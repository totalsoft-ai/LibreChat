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

/**
 * Retrieves a paginated list of feedback entries for admin review, newest first.
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.pageSize=20]
 * @param {string} [params.category] - Optional category filter.
 * @param {string} [params.status] - Optional status filter.
 * @returns {Promise<{data: Object[], pagination: {page: number, pageSize: number, total: number, totalPages: number}}>}
 */
const getFeedbackList = async ({ page = 1, pageSize = 20, category, status } = {}) => {
  try {
    const query = {};
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      Feedback.find(query)
        .populate('user', 'name email username')
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(),
      Feedback.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  } catch (error) {
    logger.error('[getFeedbackList] Error listing feedback', error);
    throw new Error('Error listing feedback');
  }
};

/**
 * Updates the triage status of a feedback entry.
 * @param {Object} params
 * @param {string} params.id
 * @param {string} params.status
 * @returns {Promise<Object|null>} The updated feedback document, or null if not found.
 */
const updateFeedbackStatus = async ({ id, status }) => {
  try {
    return await Feedback.findByIdAndUpdate(id, { status }, { new: true }).lean();
  } catch (error) {
    logger.error('[updateFeedbackStatus] Error updating feedback', error);
    throw new Error('Error updating feedback');
  }
};

module.exports = { createFeedback, getFeedbackList, updateFeedbackStatus };
