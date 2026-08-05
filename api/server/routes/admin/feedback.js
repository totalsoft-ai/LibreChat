const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const checkAdmin = require('~/server/middleware/roles/admin');
const { logger } = require('~/config');
const { getFeedbackList, updateFeedbackStatus } = require('~/server/services/FeedbackService');

const router = express.Router();

// Apply JWT auth and admin check to all routes
router.use(requireJwtAuth);
router.use(checkAdmin);

const CATEGORIES = ['bug', 'suggestion', 'other'];
const STATUSES = ['new', 'reviewed'];

/**
 * GET /api/admin/feedback
 * Lists submitted feedback, newest first, with optional category/status filters.
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 20, 1), 100);
    const category = CATEGORIES.includes(req.query.category) ? req.query.category : undefined;
    const status = STATUSES.includes(req.query.status) ? req.query.status : undefined;

    const result = await getFeedbackList({ page, pageSize, category, status });
    res.json(result);
  } catch (error) {
    logger.error('[GET /api/admin/feedback] Failed to list feedback', error);
    res.status(500).json({ error: 'Failed to load feedback' });
  }
});

/**
 * PATCH /api/admin/feedback/:id/status
 * Marks a feedback entry as reviewed (or back to new).
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body ?? {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await updateFeedbackStatus({ id: req.params.id, status });
    if (!updated) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json(updated);
  } catch (error) {
    logger.error('[PATCH /api/admin/feedback/:id/status] Failed to update feedback', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

module.exports = router;
