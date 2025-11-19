const { z } = require('zod');
const axios = require('axios');
const { tool } = require('@langchain/core/tools');
const { logger } = require('@librechat/data-schemas');
const { generateShortLivedToken } = require('@librechat/api');
const { Tools, EToolResources } = require('librechat-data-provider');
const { filterFilesByAgentAccess } = require('~/server/services/Files/permissions');
const { getFiles } = require('~/models/File');
const { sanitizeNamespace } = require('~/server/services/Files/VectorDB/crud');

/**
 *
 * @param {Object} options
 * @param {ServerRequest} options.req
 * @param {Agent['tool_resources']} options.tool_resources
 * @param {string} [options.agentId] - The agent ID for file access control
 * @returns {Promise<{
 *   files: Array<{ file_id: string; filename: string }>,
 *   toolContext: string
 * }>}
 */
const primeFiles = async (options) => {
  const { tool_resources, req, agentId } = options;
  const file_ids = tool_resources?.[EToolResources.file_search]?.file_ids ?? [];
  const agentResourceIds = new Set(file_ids);
  const resourceFiles = tool_resources?.[EToolResources.file_search]?.files ?? [];

  // Get files: if no files attached, search ALL user's files in namespace
  let allFiles;
  if (file_ids.length === 0 && req?.user?.id) {
    // No files attached - get ALL user's files with embedded: true (indexed in RAG)
    logger.info(`[primeFiles] No files attached, fetching all indexed files for user: ${req.user.id}`);
    allFiles = (await getFiles(
      {
        user: req.user.id,
        embedded: true,  // Only get files that are indexed in RAG
        filepath: 'vectordb'  // Only RAG-indexed files
      },
      null,
      { text: 0 }
    )) ?? [];
  } else {
    // Files attached - get only those files
    allFiles = (await getFiles({ file_id: { $in: file_ids } }, null, { text: 0 })) ?? [];
  }

  // Filter by access if user and agent are provided
  let dbFiles;
  if (req?.user?.id && agentId) {
    dbFiles = await filterFilesByAgentAccess({
      files: allFiles,
      userId: req.user.id,
      role: req.user.role,
      agentId,
    });
  } else {
    dbFiles = allFiles;
  }

  dbFiles = dbFiles.concat(resourceFiles);

  let toolContext = `- Note: Semantic search is available through the ${Tools.file_search} tool but no files are currently loaded. Request the user to upload documents to search through.`;

  const files = [];
  const searchingAllFiles = file_ids.length === 0 && dbFiles.length > 0;

  for (let i = 0; i < dbFiles.length; i++) {
    const file = dbFiles[i];
    if (!file) {
      continue;
    }
    if (i === 0) {
      if (searchingAllFiles) {
        toolContext = `- Note: No specific files attached. Use the ${Tools.file_search} tool to search across ALL your indexed documents (${dbFiles.length} files):`;
      } else {
        toolContext = `- Note: Use the ${Tools.file_search} tool to find relevant information within:`;
      }
    }
    toolContext += `\n\t- ${file.filename}${
      agentResourceIds.has(file.file_id) ? '' : ' (just attached by user)'
    }`;
    files.push({
      file_id: file.file_id,
      filename: file.filename,
    });
  }

  return { files, toolContext };
};

/**
 *
 * @param {Object} options
 * @param {string} options.userId
 * @param {Array<{ file_id: string; filename: string }>} options.files
 * @param {string} [options.entity_id]
 * @param {boolean} [options.fileCitations=false] - Whether to include citation instructions
 * @param {ServerRequest} [options.req] - The Express request object (for user email/namespace)
 * @returns
 */
const createFileSearchTool = async ({ userId, files, entity_id, fileCitations = false, req }) => {
  return tool(
    async ({ query }) => {
      // Note: files array may contain all user's indexed files when no specific files are attached
      // So we no longer check for files.length === 0 here

      const jwtToken = generateShortLivedToken(userId);
      if (!jwtToken) {
        return 'There was an error authenticating the file search request.';
      }

      // If truly no files available (not even user's indexed files), return early
      if (files.length === 0) {
        return 'No indexed documents found in your account. Please upload and index documents first to enable search.';
      }

      // Generate namespace from user email or ID (same as uploadVectors)
      const userIdentifier = req?.user?.email || req?.user?.id || userId;
      const namespace = sanitizeNamespace(userIdentifier);
      logger.debug(`[${Tools.file_search}] Using namespace: ${namespace} for user: ${userIdentifier}`);

      /**
       * Creates query body for RAG API
       * @param {import('librechat-data-provider').TFile} [file] - Optional file for specific file search
       * @returns {{ file_id?: string, query: string, k: number, entity_id?: string }}
       */
      const createQueryBody = (file) => {
        const body = {
          query,
          k: 5,
        };

        // Only include file_id if searching specific file
        // If file_id is omitted, RAG API searches entire namespace
        if (file?.file_id) {
          body.file_id = file.file_id;
        }

        if (entity_id) {
          body.entity_id = entity_id;
        }

        logger.debug(`[${Tools.file_search}] RAG API /query body`, body);
        return body;
      };

      // Determine if we should search globally (all user files) or specific files
      const searchGlobally = files.length > 3; // If many files, search namespace globally
      let queryPromises;

      if (searchGlobally) {
        // Global search: single query without file_id to search entire namespace
        logger.info(`[${Tools.file_search}] Searching globally across ${files.length} files in namespace: ${namespace}`);
        queryPromises = [
          axios
            .post(`${process.env.RAG_API_URL}/query`, createQueryBody(null), {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
                'X-Namespace': namespace,
                // No X-File-ID header for global search
              },
            })
            .catch((error) => {
              logger.error('Error encountered in `file_search` global query:', error);
              return null;
            })
        ];
      } else {
        // Specific file search: query each file individually
        queryPromises = files.map((file) =>
          axios
            .post(`${process.env.RAG_API_URL}/query`, createQueryBody(file), {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
                'X-Namespace': namespace,
                'X-File-ID': file.file_id,
              },
            })
            .catch((error) => {
              logger.error('Error encountered in `file_search` while querying file:', error);
              return null;
            }),
        );
      }

      const results = await Promise.all(queryPromises);
      const validResults = results.filter((result) => result !== null);

      if (validResults.length === 0) {
        return 'No results found or errors occurred while searching the files.';
      }

      const formattedResults = validResults
        .flatMap((result, fileIndex) =>
          result.data.map(([docInfo, distance]) => ({
            filename: docInfo.metadata.source.split('/').pop(),
            content: docInfo.page_content,
            distance,
            file_id: files[fileIndex]?.file_id,
            page: docInfo.metadata.page || null,
          })),
        )
        // TODO: results should be sorted by relevance, not distance
        .sort((a, b) => a.distance - b.distance)
        // TODO: make this configurable
        .slice(0, 10);

      const strictModeHeader = `[SEARCH RESULTS - ANSWER ONLY FROM THESE RESULTS]
If the answer to the user's question is not in these results, respond with: "I could not find this information in the uploaded documents."
DO NOT use external knowledge. ONLY use the information below.

`;

      const formattedString = strictModeHeader + formattedResults
        .map(
          (result, index) =>
            `File: ${result.filename}${
              fileCitations ? `\nAnchor: \\ue202turn0file${index} (${result.filename})` : ''
            }\nRelevance: ${(1.0 - result.distance).toFixed(4)}\nContent: ${result.content}\n`,
        )
        .join('\n---\n');

      const sources = formattedResults.map((result) => ({
        type: 'file',
        fileId: result.file_id,
        content: result.content,
        fileName: result.filename,
        relevance: 1.0 - result.distance,
        pages: result.page ? [result.page] : [],
        pageRelevance: result.page ? { [result.page]: 1.0 - result.distance } : {},
      }));

      return [formattedString, { [Tools.file_search]: { sources, fileCitations } }];
    },
    {
      name: Tools.file_search,
      responseFormat: 'content_and_artifact',
      description: `Performs semantic search across attached "${Tools.file_search}" documents using natural language queries. This tool analyzes the content of uploaded files to find relevant information, quotes, and passages that best match your query.

**IMPORTANT - STRICT DOCUMENT-ONLY MODE:**
- ONLY answer questions using information explicitly found in the file search results
- If the information is not present in the search results, you MUST state: "I could not find this information in the uploaded documents"
- DO NOT use your general knowledge or training data to supplement or add information beyond what the documents contain
- NEVER make assumptions or inferences that aren't directly supported by the document content
- Always cite which document(s) the information comes from

Use this tool to extract specific information or find relevant sections within the available documents.${
        fileCitations
          ? `

**CITE FILE SEARCH RESULTS:**
Use anchor markers immediately after statements derived from file content. Reference the filename in your text:
- File citation: "The document.pdf states that... \\ue202turn0file0"  
- Page reference: "According to report.docx... \\ue202turn0file1"
- Multi-file: "Multiple sources confirm... \\ue200\\ue202turn0file0\\ue202turn0file1\\ue201"

**ALWAYS mention the filename in your text before the citation marker. NEVER use markdown links or footnotes.**`
          : ''
      }`,
      schema: z.object({
        query: z
          .string()
          .describe(
            "A natural language query to search for relevant information in the files. Be specific and use keywords related to the information you're looking for. The query will be used for semantic similarity matching against the file contents.",
          ),
      }),
    },
  );
};

module.exports = { createFileSearchTool, primeFiles };
