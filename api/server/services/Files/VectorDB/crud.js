const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { logger } = require('@librechat/data-schemas');
const { FileSources } = require('librechat-data-provider');
const { logAxiosError, generateShortLivedToken } = require('@librechat/api');

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
  if (!file.embedded || !process.env.RAG_API_URL) {
    return;
  }
  try {
    const jwtToken = generateShortLivedToken(req.user.id);

    return await axios.delete(`${process.env.RAG_API_URL}/documents`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'X-Namespace': sanitizeNamespace(req.user?.email || req.user?.id),
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      data: [file.file_id],
    });
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
      logger.warn('Error deleting vectors, file will not be deleted');
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
 *
 * @returns {Promise<{ filepath: string, bytes: number }>}
 *          A promise that resolves to an object containing:
 *            - filepath: The path where the file is saved.
 *            - bytes: The size of the file in bytes.
 */
async function uploadVectors({ req, file, file_id, entity_id, storageMetadata }) {
  if (!process.env.RAG_API_URL) {
    throw new Error('RAG_API_URL not defined');
  }

  try {
    const formData = new FormData();
    // FastAPI expects a list under field name "files"; send one file
    formData.append('files', fs.createReadStream(file.path), file.originalname);
    // Optionally include namespace as a form field instead of header:
    // formData.append('namespace', sanitizeNamespace(req.user?.email || req.user?.id));

    // Include storage metadata for RAG API to store with embeddings
    if (storageMetadata) {
      formData.append('storage_metadata', JSON.stringify(storageMetadata));
    }

    const formHeaders = formData.getHeaders();

    // Start upload in background - don't wait for response
    axios.post(`${process.env.RAG_API_URL}/upload/files/`, formData, {
      headers: {
        accept: 'application/json',
        'X-Namespace': sanitizeNamespace(req.user?.email || req.user?.id),
        'X-User-Email': req.user?.email || '',
        ...formHeaders,
      },
    }).then(response => {
      const responseData = response.data;
      logger.debug('Response from Document Loader API', responseData);
      
      if (responseData.status !== 'loaded') {
        logger.warn(`Upload processing failed: ${responseData.message || 'not loaded'}`);
      } else {
        logger.info(`File ${file.originalname} successfully processed by Document Loader API`);
      }
    }).catch(error => {
      logger.error('Background upload failed:', error.message);
    });

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
};
