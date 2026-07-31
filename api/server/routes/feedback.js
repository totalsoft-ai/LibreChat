const express = require('express');
const { imageMimeTypes } = require('librechat-data-provider');
const { requireJwtAuth } = require('~/server/middleware');
const { logger } = require('~/config');
const { createFeedback } = require('~/server/services/FeedbackService');

const router = express.Router();

router.use(requireJwtAuth);

const MAX_MESSAGE_LENGTH = 5000;
// Images are stored inline (base64) on the Feedback document itself, not via
// the shared file-storage pipeline (no S3/MinIO/local disk involved). The app's
// global JSON body limit is 3mb (api/server/index.js), so these caps keep a
// full request (message + up to MAX_IMAGES base64 images) safely under that.
const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 600 * 1024;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+=*$/;
const CATEGORIES = ['bug', 'suggestion', 'other'];

/**
 * POST /api/feedback
 * Submits general user feedback (not tied to a specific message/conversation),
 * with optional small images attached inline as base64.
 */
router.post('/', async (req, res) => {
  try {
    const { message, category, images } = req.body ?? {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Feedback message is required' });
    }
    if (message.trim().length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: 'Feedback message is too long' });
    }

    const imageList = Array.isArray(images) ? images : [];
    if (imageList.length > MAX_IMAGES) {
      return res.status(400).json({ error: `You can attach up to ${MAX_IMAGES} images` });
    }

    const validatedImages = [];
    for (const image of imageList) {
      const { data, contentType, filename } = image ?? {};
      if (typeof data !== 'string' || !data || !BASE64_PATTERN.test(data)) {
        return res.status(400).json({ error: 'Invalid image attachment' });
      }
      if (typeof contentType !== 'string' || !imageMimeTypes.test(contentType)) {
        return res.status(400).json({ error: 'Only image attachments are allowed' });
      }
      const approxBytes = Math.ceil((data.length * 3) / 4);
      if (approxBytes > MAX_IMAGE_BYTES) {
        return res.status(400).json({ error: 'Image is too large' });
      }
      validatedImages.push({
        data,
        contentType,
        filename: typeof filename === 'string' ? filename.slice(0, 255) : undefined,
      });
    }

    const feedback = await createFeedback({
      userId: req.user.id,
      message: message.trim(),
      category: CATEGORIES.includes(category) ? category : 'other',
      images: validatedImages,
    });

    res.status(201).json({ id: feedback._id });
  } catch (error) {
    logger.error('[POST /api/feedback] Failed to save feedback', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
