const express = require('express');
const { imageMimeTypes } = require('librechat-data-provider');
const { requireJwtAuth } = require('~/server/middleware');
const { getFiles } = require('~/models');
const { logger } = require('~/config');
const { createFeedback } = require('~/server/services/FeedbackService');

const router = express.Router();

router.use(requireJwtAuth);

const MAX_MESSAGE_LENGTH = 5000;
const MAX_FILES = 3;
const CATEGORIES = ['bug', 'suggestion', 'other'];

/**
 * POST /api/feedback
 * Submits general user feedback (not tied to a specific message/conversation).
 * Optionally attaches images that were already uploaded via POST /api/files.
 */
router.post('/', async (req, res) => {
  try {
    const { message, category, files } = req.body ?? {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Feedback message is required' });
    }
    if (message.trim().length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: 'Feedback message is too long' });
    }

    const fileIds = Array.isArray(files)
      ? [...new Set(files.filter((id) => typeof id === 'string' && id))]
      : [];
    if (fileIds.length > MAX_FILES) {
      return res.status(400).json({ error: `You can attach up to ${MAX_FILES} images` });
    }

    let attachedFiles = [];
    if (fileIds.length > 0) {
      const dbFiles = await getFiles({ file_id: { $in: fileIds } });
      if (dbFiles.length !== fileIds.length) {
        return res.status(400).json({ error: 'One or more attachments could not be found' });
      }
      const notOwned = dbFiles.some((file) => file.user?.toString() !== req.user.id.toString());
      if (notOwned) {
        return res.status(403).json({ error: 'One or more attachments do not belong to you' });
      }
      const notImage = dbFiles.some((file) => !imageMimeTypes.test(file.type ?? ''));
      if (notImage) {
        return res.status(400).json({ error: 'Only image attachments are allowed' });
      }
      attachedFiles = dbFiles.map((file) => ({
        file_id: file.file_id,
        filepath: file.filepath,
        filename: file.filename,
      }));
    }

    const feedback = await createFeedback({
      userId: req.user.id,
      message: message.trim(),
      category: CATEGORIES.includes(category) ? category : 'other',
      files: attachedFiles,
    });

    res.status(201).json({ id: feedback._id });
  } catch (error) {
    logger.error('[POST /api/feedback] Failed to save feedback', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
