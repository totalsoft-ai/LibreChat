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
  const { tool_resources, req, agentId, workspaceId } = options;
  const file_ids = tool_resources?.[EToolResources.file_search]?.file_ids ?? [];
  const agentResourceIds = new Set(file_ids);
  const resourceFiles = tool_resources?.[EToolResources.file_search]?.files ?? [];

  // Get files: if no files attached, search ALL workspace files or user's personal files
  let allFiles;
  if (file_ids.length === 0 && req?.user?.id) {
    const fileQuery = {
      embedded: true,  // Only get files that are indexed in RAG
      filepath: 'vectordb'  // Only RAG-indexed files
    };

    if (workspaceId) {
      // In workspace: get ALL files from workspace (shared among all members)
      fileQuery.workspace = workspaceId;
      logger.info(`[primeFiles] No files attached, fetching all indexed files in workspace: ${workspaceId}`);
    } else {
      // In personal: get only user's own files
      fileQuery.user = req.user.id;
      logger.info(`[primeFiles] No files attached, fetching all indexed files for user: ${req.user.id} (personal)`);
    }

    allFiles = (await getFiles(fileQuery, null, { text: 0 })) ?? [];
    const context = workspaceId ? `workspace ${workspaceId}` : `user ${req.user.id} (personal)`;
    logger.info(`[primeFiles] Found ${allFiles.length} indexed files in ${context}`);
    if (allFiles.length > 0) {
      logger.debug(`[primeFiles] Files: ${allFiles.map(f => `${f.filename} (workspace: ${f.workspace || 'none'})`).join(', ')}`);
    }
  } else {
    // Files attached - get only those files
    logger.info(`[primeFiles] ${file_ids.length} files attached, fetching specific files`);
    allFiles = (await getFiles({ file_id: { $in: file_ids } }, null, { text: 0 })) ?? [];
  }

  // Filter by access if user and agent are provided
  let dbFiles;
  if (req?.user?.id && agentId) {
    logger.debug(`[primeFiles] Filtering ${allFiles.length} files by agent access for agent: ${agentId}`);
    dbFiles = await filterFilesByAgentAccess({
      files: allFiles,
      userId: req.user.id,
      role: req.user.role,
      agentId,
    });
    logger.info(`[primeFiles] After filtering: ${dbFiles.length} files accessible by agent`);
  } else {
    dbFiles = allFiles;
  }

  dbFiles = dbFiles.concat(resourceFiles);
  logger.info(`[primeFiles] Final file count after adding resourceFiles: ${dbFiles.length}`);

  const files = [];
  const searchingAllFiles = file_ids.length === 0 && dbFiles.length > 0;
  let toolContext;

  if (dbFiles.length === 0 && file_ids.length === 0) {
    // No files attached AND no indexed files found
    // BUT we still want the tool available for global namespace search
    toolContext = `- Note: Use the ${Tools.file_search} tool to search your document knowledge base. The tool will search across all your indexed documents in the system.`;

    // Add a special placeholder to indicate global search mode
    files.push({
      file_id: null,  // null means search entire namespace
      filename: '__GLOBAL_SEARCH__',  // Special marker
    });
  } else if (dbFiles.length === 0) {
    // Files were attached but not found (shouldn't happen normally)
    toolContext = `- Note: Semantic search is available through the ${Tools.file_search} tool but no files are currently loaded. Request the user to upload documents to search through.`;
  } else {
    // Files found - build the list
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
const createFileSearchTool = async ({ userId, files, entity_id, fileCitations = false, req, workspaceId }) => {
  const workspaceContext = workspaceId ? ` in workspace ${workspaceId}` : '';
  logger.info(`[createFileSearchTool] Created tool with ${files.length} files available for user ${userId}${workspaceContext}`);

  return tool(
    async ({ query }) => {
      logger.info(`[file_search] Tool invoked with query: "${query}", files available: ${files.length}${workspaceContext}`);

      // Note: files array may contain all user's indexed files when no specific files are attached
      // So we no longer check for files.length === 0 here

      const jwtToken = generateShortLivedToken(userId);
      if (!jwtToken) {
        logger.error('[file_search] Failed to generate JWT token');
        return 'There was an error authenticating the file search request.';
      }

      // Check if we have the global search placeholder
      const isGlobalSearch = files.length === 1 && files[0].filename === '__GLOBAL_SEARCH__';

      if (files.length === 0 && !isGlobalSearch) {
        logger.warn('[file_search] No files available for search');
        return 'No indexed documents found in your account. Please upload and index documents first to enable search.';
      }

      // Generate namespace using getNamespace (supports workspace isolation)
      const { getNamespace } = require('~/server/services/Files/VectorDB/crud');
      const namespace = await getNamespace({ user: req?.user || { id: userId }, workspaceId });
      logger.debug(`[${Tools.file_search}] Using namespace: ${namespace} for user: ${req?.user?.id || userId}${workspaceContext}`);

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
      const searchGlobally = isGlobalSearch || files.length > 3; // Global search mode OR many files
      const queryTimeout = parseInt(process.env.RAG_QUERY_TIMEOUT || '30000', 10); // Default 30s
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
              timeout: queryTimeout,
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
              timeout: queryTimeout,
            })
            .catch((error) => {
              logger.error('Error encountered in `file_search` while querying file:', error);
              return null;
            }),
        );
      }

      const results = await Promise.all(queryPromises);
      const validResults = results.filter((result) => result !== null);


      const formattedResults = validResults
        .flatMap((result, fileIndex) =>
          result.data.map(([docInfo, distance], chunkIndex) => {
            const metadata = docInfo.metadata || {};
            // Try to extract any location info (page, chunk, section, etc.)
            const locationInfo = metadata.page
              ? `Page ${metadata.page}`
              : metadata.chunk
              ? `Chunk ${metadata.chunk}`
              : metadata.section
              ? `Section ${metadata.section}`
              : `Part ${chunkIndex + 1}`;

            return {
              filename: metadata.source ? metadata.source.split('/').pop() : 'Unknown',
              content: docInfo.page_content,
              distance,
              file_id: files[fileIndex]?.file_id,
              page: metadata.page || null,
              location: locationInfo,
              metadata: metadata, // Keep full metadata for debugging
            };
          }),
        )
        // TODO: results should be sorted by relevance, not distance
        .sort((a, b) => a.distance - b.distance)
        // TODO: make this configurable
        .slice(0, 10);

      if (!formattedResults || formattedResults.length === 0) {
        logger.info(`[${Tools.file_search}] No results found in documents`);

        return [
          `[NO_RESULTS]
        I could not find this information in the uploaded documents.`,
          {
            [Tools.file_search]: {
              sources: [],
              noResults: true,
            },
          },
        ];
      }

      const strictModeHeader = `[SEARCH RESULTS - ANSWER ONLY FROM THESE RESULTS]
MANDATORY: If the answer to the user's question is not in these results, respond with: "I could not find this information in the uploaded documents."
DO NOT use external knowledge. ONLY use the information below.

Format your answer like: "According to [filename], ..." or "Based on [filename], ..."
IMPORTANT: Answer in the SAME LANGUAGE as the user's question. If user asks in Romanian, answer in Romanian. If in English, answer in English.

`;

      const formattedString = strictModeHeader + formattedResults
        .map(
          (result, index) =>
            `[SOURCE: ${result.filename}]${
              fileCitations ? `\nAnchor: \\ue202turn0file${index} (${result.filename})` : ''
            }\nContent: ${result.content}\n`,
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

**CRITICAL - HOW TO USE THIS TOOL:**
- ALWAYS pass the user's EXACT question as the query parameter
- DO NOT rephrase, simplify, or extract keywords
- Example: User asks "Ce este eTransport?" → query: "Ce este eTransport?" (NOT "etransport")
- The semantic search engine will automatically find relevant content regardless of exact wording

**IMPORTANT - STRICT DOCUMENT-ONLY MODE:**
- ONLY answer questions using information explicitly found in the file search results
- If the information is not present in the search results, you MUST state: "I could not find this information in the uploaded documents"
- DO NOT use your general knowledge or training data to supplement or add information beyond what the documents contain
- NEVER make assumptions or inferences that aren't directly supported by the document content

**MANDATORY - ALWAYS CITE SOURCES:**
- ALWAYS mention the source document name for every piece of information you provide
- Format examples:
  - English: "According to [filename], ..." or "Based on [filename], ..."
  - Romanian: "Conform [filename], ..." or "Potrivit [filename], ..."
- If multiple documents contain the same information, list all sources
- NEVER provide information without citing its source document

**CRITICAL - LANGUAGE MATCHING:**
- ALWAYS respond in the SAME LANGUAGE as the user's question
- If user asks in Romanian, answer entirely in Romanian
- If user asks in English, answer entirely in English
- Do NOT mix languages in your response

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
            "The EXACT question or search query from the user. DO NOT rephrase or extract keywords - use the user's original question verbatim. For example, if user asks 'Ce e eTransport?', pass exactly 'Ce e eTransport?' not just 'etransport'. The semantic search will handle variations automatically.",
          ),
      }),
    },
  );
};

module.exports = { createFileSearchTool, primeFiles };
