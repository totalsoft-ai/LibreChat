const { logger } = require('~/config');
const { Feedback } = require('~/db/models');

/**
 * Creates a new general feedback entry submitted by a user.
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.message
 * @param {string} [params.category]
 * @param {Array<{file_id: string, filepath: string, filename?: string}>} [params.files]
 *   Already-verified (ownership + type checked by the caller) image attachments.
 * @returns {Promise<Object>} The created feedback document.
 */
const createFeedback = async ({ userId, message, category, files = [] }) => {
  try {
    return await Feedback.create({ user: userId, message, category, files });
  } catch (error) {
    logger.error('[createFeedback] Error creating feedback', error);
    throw new Error('Error creating feedback');
  }
};

module.exports = { createFeedback };
