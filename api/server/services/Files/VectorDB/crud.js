const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { logger } = require('@librechat/data-schemas');
const { FileSources } = require('librechat-data-provider');
const { logAxiosError, generateShortLivedToken } = require('@librechat/api');
const { updateEmbeddingStatus } = require('./status');
const Workspace = require('~/models/Workspace');

/**
 * Produces a sanitized namespace string from raw input (email or id).
 * - lowercase, replace '-', '.', '@', whitespace with '_'
 * - replace any non [a-z0-9_] with '_'
 * - ensure starts with a letter by prefixing 'ns_'
 * - trim to max 63 chars and trim leading/trailing '_'
 */
function sanitizeNamespace(raw) {
  if (!raw) return 'ns_default';
  let s = String(raw)
    .toLowerCase()
    .replace(/[-.@\s]/g, '_')
    .replace(/[^a-z0-9_]/g, '_');
  if (!/^[a-z]/.test(s)) s = `ns_${s}`;
  if (s.length > 63) s = s.slice(0, 63);
  s = s.replace(/^_+|_+$/g, '');
  return s || 'ns_default';
}

/**
 * Gets the appropriate namespace for RAG operations.
 * If workspaceId is provided, uses workspace name; otherwise uses user email/id.
 *
 * @param {Object} params - Parameters object
 * @param {Object} params.user - User object with email and id
 * @param {string} [params.workspaceId] - Optional workspace ID
 * @returns {Promise<string>} - Sanitized namespace string
 */
async function getNamespace({ user, workspaceId }) {
  if (workspaceId) {
    try {
      const workspace = await Workspace.findOne({ workspaceId, isActive: true });
      if (workspace && workspace.name) {
        logger.debug(`[getNamespace] Using workspace name for namespace: ${workspace.name}`);
        return sanitizeNamespace(workspace.name);
      }
      logger.warn(`[getNamespace] Workspace ${workspaceId} not found, falling back to user identifier`);
    } catch (error) {
      logger.error(`[getNamespace] Error fetching workspace ${workspaceId}:`, error);
    }
  }

  // Fallback to user email/id
  const userIdentifier = user?.email || user?.id;
  logger.debug(`[getNamespace] Using user identifier for namespace: ${userIdentifier}`);
  return sanitizeNamespace(userIdentifier);
}

/**
 * Deletes a file from the vector database. This function takes a file object, constructs the full path, and
 * verifies the path's validity before deleting the file. If the path is invalid, an error is thrown.
 *
 * @param {ServerRequest} req - The request object from Express.
 * @param {MongoFile} file - The file object to be deleted. It should have a `filepath` property that is
 *                           a string representing the path of the file relative to the publicPath.
 *
 * @returns {Promise<void>}
 *          A promise that resolves when the file has been successfully deleted, or throws an error if the
 *          file path is invalid or if there is an error in deletion.
 */
const deleteVectors = async (req, file) => {
  if (!process.env.RAG_API_URL) {
    logger.debug(
      `[deleteVectors] Skipping vector deletion - RAG_API_URL not configured`,
    );
    return;
  }

  // Always attempt deletion if RAG_API_URL is configured
  // This handles files that may have been embedded but webhook wasn't called
  logger.info(
    `[deleteVectors] Attempting vector deletion - file_id: ${file.file_id}, filename: ${file.filename}, embedded status: ${file.embedded}, workspace: ${file.workspace}`,
  );
  logger.info(`[deleteVectors] Full file object keys: ${Object.keys(file).join(', ')}`);
  try {
    const jwtToken = generateShortLivedToken(req.user.id);
    const namespace = await getNamespace({ user: req.user, workspaceId: file.workspace });

    // RAG API uses source path as document identifier: "./uploads/public/{filename}"
    const sourceToDelete = `./uploads/public/${file.filename}`;

    logger.info(
      `[deleteVectors] Deleting file from RAG - source: ${sourceToDelete}, file_id: ${file.file_id}, workspace: ${file.workspace || 'none'}, namespace: ${namespace}`,
    );

    const response = await axios.delete(`${process.env.RAG_API_URL}/documents`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'X-Namespace': namespace,
        'X-File-ID': file.file_id,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      data: {
        document_ids: [file.file_id],
      },
    });

    logger.info(
      `[deleteVectors] Successfully deleted from RAG - file_id: ${file.file_id}, namespace: ${namespace}`,
    );
    return response;
  } catch (error) {
    logAxiosError({
      error,
      message: 'Error deleting vectors',
    });
    if (
      error.response &&
      error.response.status !== 404 &&
      (error.response.status < 200 || error.response.status >= 300)
    ) {
      logger.warn(
        `[deleteVectors] Error deleting vectors for file ${file.file_id}, file will not be deleted`,
      );
      throw new Error(error.message || 'An error occurred during file deletion.');
    }
  }
};

/**
 * Uploads a file to the configured Vector database
 *
 * @param {Object} params - The params object.
 * @param {Object} params.req - The request object from Express. It should have a `user` property with an `id` representing the user
 * @param {Express.Multer.File} params.file - The file object, which is part of the request. The file object should
 *                                     have a `path` property that points to the location of the uploaded file.
 * @param {string} params.file_id - The file ID.
 * @param {string} [params.entity_id] - The entity ID for shared resources.
 * @param {Object} [params.storageMetadata] - Storage metadata for dual storage pattern.
 * @param {string} [params.workspaceId] - Optional workspace ID for namespace determination.
 *
 * @returns {Promise<{ filepath: string, bytes: number }>}
 *          A promise that resolves to an object containing:
 *            - filepath: The path where the file is saved.
 *            - bytes: The size of the file in bytes.
 */
async function uploadVectors({ req, file, file_id, entity_id, storageMetadata, workspaceId }) {
  if (!process.env.RAG_API_URL) {
    throw new Error('RAG_API_URL not defined');
  }

  try {
    const namespace = await getNamespace({ user: req.user, workspaceId });

    logger.info(
      `[uploadVectors] Starting upload to RAG - file: ${file.originalname}, file_id: ${file_id}, workspace: ${workspaceId || 'none'}, namespace: ${namespace}`,
    );

    const formData = new FormData();
    // RAG API expects a single file field named "file"
    formData.append('file', fs.createReadStream(file.path), file.originalname);
    // Send file_id as FormData parameter for RAG API to track file
    formData.append('file_id', file_id);
    // Optionally include namespace as a form field instead of header:
    // formData.append('namespace', namespace);

    // Include storage metadata for RAG API to store with embeddings
    if (storageMetadata) {
      formData.append('storage_metadata', JSON.stringify(storageMetadata));
      logger.debug(`[uploadVectors] Including storage metadata for ${file.originalname}`);
    }

    const formHeaders = formData.getHeaders();

    // Start upload in background - don't wait for response
    // Timeout configured for large files (30-60 seconds)
    const uploadTimeout = parseInt(process.env.RAG_UPLOAD_TIMEOUT || '60000', 10); // Default 60s
    axios
      .post(`${process.env.RAG_API_URL}/embed`, formData, {
        headers: {
          accept: 'application/json',
          'X-Namespace': namespace,
          'X-File-ID': file_id,
          'X-User-Email': req.user?.email || '',
          ...formHeaders,
        },
        timeout: uploadTimeout, // Configurable timeout for large files
      })
      .then(async (response) => {
        const responseData = response.data;
        logger.debug(
          `[uploadVectors] Response from RAG API for ${file.originalname}:`,
          responseData,
        );

        // RAG API returns: { status: true/false, message: "..." }
        // OR { status: "loaded"/"processing", ... }
        const isSuccess = responseData.status === true || responseData.status === 'loaded';

        if (!isSuccess) {
          logger.warn(
            `[uploadVectors] Upload processing failed for ${file.originalname} (namespace: ${namespace}): ${responseData.message || 'processing failed'}`,
          );
          // Update file with error status
          try {
            await updateEmbeddingStatus({
              file_id,
              embedded: false,
              error: responseData.message || 'RAG processing failed',
            });
          } catch (updateError) {
            logger.error(
              `[uploadVectors] Failed to update error status for ${file_id}:`,
              updateError.message,
            );
          }
        } else {
          logger.info(
            `[uploadVectors] File ${file.originalname} successfully processed by RAG API (namespace: ${namespace}, file_id: ${file_id}, status: ${responseData.status})`,
          );
          // Update file with success status
          try {
            await updateEmbeddingStatus({
              file_id,
              embedded: true,
            });
            logger.info(
              `[uploadVectors] Successfully updated database for ${file_id} with embedded: true`,
            );
          } catch (updateError) {
            logger.error(
              `[uploadVectors] Failed to update success status for ${file_id}:`,
              updateError.message,
            );
          }
        }
      })
      .catch((error) => {
        logger.error(
          `[uploadVectors] Background upload failed for ${file.originalname} (namespace: ${namespace}):`,
          error.message,
        );
      });

    logger.info(
      `[uploadVectors] Upload initiated for ${file.originalname}, returning immediately with embedded: false`,
    );

    // Return immediately - file is "processing" not "embedded"
    return {
      bytes: file.size,
      filename: file.originalname,
      filepath: FileSources.vectordb,
      embedded: false, // Mark as processing, not yet embedded
    };
  } catch (error) {
    logAxiosError({
      error,
      message: 'Error uploading vectors',
    });
    throw new Error(error.message || 'An error occurred during file upload.');
  }
}

module.exports = {
  deleteVectors,
  uploadVectors,
  sanitizeNamespace,
  getNamespace,
};
