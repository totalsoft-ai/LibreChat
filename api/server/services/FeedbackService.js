const { logger } = require('~/config');
const { Feedback } = require('~/db/models');

/**
 * Creates a new general feedback entry submitted by a user.
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.message
 * @param {string} [params.category]
 * @param {Array<{data: string, contentType: string, filename?: string}>} [params.images]
 *   Already-validated (type + size checked by the caller) base64 image attachments,
 *   stored inline in MongoDB rather than via the shared file-storage pipeline.
 * @returns {Promise<Object>} The created feedback document.
 */
const createFeedback = async ({ userId, message, category, images = [] }) => {
  try {
    return await Feedback.create({ user: userId, message, category, images });
  } catch (error) {
    logger.error('[createFeedback] Error creating feedback', error);
    throw new Error('Error creating feedback');
  }
};

module.exports = { createFeedback };
