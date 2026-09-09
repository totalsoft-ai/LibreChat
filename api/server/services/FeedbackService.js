const { SystemRoles } = require('librechat-data-provider');
const { checkEmailConfig } = require('@librechat/api');
const { logger } = require('~/config');
const { sendEmail } = require('~/server/utils');
const { Feedback, User } = require('~/db/models');

/**
 * Emails all admin users that a new feedback entry was submitted.
 * Failures here are logged and swallowed - they must never block feedback submission.
 * @param {Object} feedback - The created feedback document.
 * @param {string} userId - The id of the user who submitted the feedback.
 * @returns {Promise<void>}
 */
const notifyAdminsOfNewFeedback = async (feedback, userId) => {
  if (!checkEmailConfig()) {
    return;
  }

  try {
    const [admins, submitter] = await Promise.all([
      User.find({ role: SystemRoles.ADMIN }).select('email name username').lean(),
      User.findById(userId).select('email name username').lean(),
    ]);

    const adminsWithEmail = admins.filter((admin) => admin.email);
    if (!adminsWithEmail.length) {
      return;
    }

    const appName = process.env.APP_TITLE || 'LibreChat';
    const submitterName = submitter?.name || submitter?.username || submitter?.email || 'A user';
    const feedbackUrl = `${process.env.DOMAIN_CLIENT}/admin/feedback`;

    await Promise.allSettled(
      adminsWithEmail.map((admin) =>
        sendEmail({
          email: admin.email,
          subject: `New feedback submitted in ${appName}`,
          payload: {
            appName,
            name: admin.name || admin.username || admin.email,
            submitterName,
            category: feedback.category,
            message: feedback.message,
            feedbackUrl,
            year: new Date().getFullYear(),
          },
          template: 'newFeedback.handlebars',
          throwError: false,
        }),
      ),
    );
  } catch (error) {
    logger.error('[notifyAdminsOfNewFeedback] Error notifying admins of new feedback', error);
  }
};

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
  let feedback;
  try {
    feedback = await Feedback.create({ user: userId, message, category, images });
  } catch (error) {
    logger.error('[createFeedback] Error creating feedback', error);
    throw new Error('Error creating feedback');
  }

  notifyAdminsOfNewFeedback(feedback, userId).catch((error) => {
    logger.error('[createFeedback] Error notifying admins of new feedback', error);
  });

  return feedback;
};

/**
 * Emails the user who submitted a feedback entry that an admin has responded to it.
 * Failures here are logged and swallowed - they must never block the admin's response.
 * @param {Object} feedback - The updated feedback document, with `user` populated (name/email/username) and `response` set.
 * @returns {Promise<void>}
 */
const notifyUserOfFeedbackResponse = async (feedback) => {
  if (!checkEmailConfig() || !feedback.user?.email) {
    return;
  }

  try {
    const appName = process.env.APP_TITLE || 'LibreChat';
    await sendEmail({
      email: feedback.user.email,
      subject: `You have a response to your feedback in ${appName}`,
      payload: {
        appName,
        name: feedback.user.name || feedback.user.username || feedback.user.email,
        originalMessage: feedback.message,
        responseText: feedback.response.text,
        year: new Date().getFullYear(),
      },
      template: 'feedbackResponse.handlebars',
      throwError: false,
    });
  } catch (error) {
    logger.error('[notifyUserOfFeedbackResponse] Error notifying user of feedback response', error);
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
        .populate('response.respondedBy', 'name email username')
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

/**
 * Records an admin's response to a feedback entry and emails the submitter about it.
 * @param {Object} params
 * @param {string} params.id
 * @param {string} params.text
 * @param {string} params.adminId
 * @returns {Promise<Object|null>} The updated feedback document, or null if not found.
 */
const respondToFeedback = async ({ id, text, adminId }) => {
  let feedback;
  try {
    feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        response: { text, respondedBy: adminId, respondedAt: new Date() },
        status: 'reviewed',
      },
      { new: true },
    )
      .populate('user', 'name email username')
      .lean();
  } catch (error) {
    logger.error('[respondToFeedback] Error responding to feedback', error);
    throw new Error('Error responding to feedback');
  }

  if (!feedback) {
    return null;
  }

  notifyUserOfFeedbackResponse(feedback).catch((error) => {
    logger.error('[respondToFeedback] Error notifying user of feedback response', error);
  });

  return feedback;
};

module.exports = {
  createFeedback,
  getFeedbackList,
  updateFeedbackStatus,
  respondToFeedback,
  notifyAdminsOfNewFeedback,
  notifyUserOfFeedbackResponse,
};
