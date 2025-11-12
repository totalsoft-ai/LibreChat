const { logger } = require('@librechat/data-schemas');
const { updateFile, findFileById } = require('~/models/File');

/**
 * Updates the embedding status of a file in MongoDB
 * @param {Object} params
 * @param {string} params.file_id - The file ID to update
 * @param {boolean} params.embedded - The embedding status
 * @param {string} [params.error] - Optional error message if embedding failed
 * @returns {Promise<Object>} The updated file document
 */
async function updateEmbeddingStatus({ file_id, embedded, error }) {
  try {
    if (!file_id) {
      throw new Error('file_id is required');
    }

    // First, check if file exists
    const existingFile = await findFileById(file_id);
    if (!existingFile) {
      logger.warn(`[updateEmbeddingStatus] File not found: ${file_id}`);
      throw new Error('File not found');
    }

    // Prepare update data
    const updateData = {
      file_id,
      embedded: !!embedded,
    };

    // If there's an error, we could store it in metadata or a new field
    if (error) {
      logger.error(`[updateEmbeddingStatus] Error embedding file ${file_id}: ${error}`);
      updateData.embedded = false;
      // Optionally store error in metadata
      updateData.metadata = {
        ...existingFile.metadata,
        embeddingError: error,
        lastEmbeddingAttempt: new Date().toISOString(),
      };
    }

    // Update the file
    const updatedFile = await updateFile(updateData);

    logger.info(
      `[updateEmbeddingStatus] Successfully updated embedding status for file ${file_id}: ${embedded}`,
    );

    return updatedFile;
  } catch (error) {
    logger.error('[updateEmbeddingStatus] Error updating embedding status:', error);
    throw error;
  }
}

/**
 * Batch update embedding status for multiple files
 * @param {Array<Object>} updates - Array of {file_id, embedded, error} objects
 * @returns {Promise<Array>} Array of update results
 */
async function batchUpdateEmbeddingStatus(updates) {
  try {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error('Updates array is required and must not be empty');
    }

    logger.info(`[batchUpdateEmbeddingStatus] Processing ${updates.length} file updates`);

    const results = await Promise.allSettled(
      updates.map((update) => updateEmbeddingStatus(update)),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    logger.info(
      `[batchUpdateEmbeddingStatus] Batch update complete: ${successful} successful, ${failed} failed`,
    );

    return results;
  } catch (error) {
    logger.error('[batchUpdateEmbeddingStatus] Error in batch update:', error);
    throw error;
  }
}

module.exports = {
  updateEmbeddingStatus,
  batchUpdateEmbeddingStatus,
};
