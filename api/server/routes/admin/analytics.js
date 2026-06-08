const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const checkAdmin = require('~/server/middleware/roles/admin');
const AnalyticsController = require('~/server/controllers/admin/AnalyticsController');

const router = express.Router();

router.use(requireJwtAuth);
router.use(checkAdmin);

router.get('/stats', AnalyticsController.getStats);
router.get('/token-usage', AnalyticsController.getTokenUsage);
router.get('/health', AnalyticsController.getHealthStats);
router.get('/active-users', AnalyticsController.getActiveUsers);
router.get('/feedback', AnalyticsController.getFeedbackStats);
router.get('/category-distribution', AnalyticsController.getCategoryDistribution);

module.exports = router;
