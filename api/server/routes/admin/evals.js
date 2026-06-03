const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const checkAdmin = require('~/server/middleware/roles/admin');
const EvalsController = require('~/server/controllers/admin/EvalsController');

const router = express.Router();
router.use(requireJwtAuth);
router.use(checkAdmin);

router.get('/baselines', EvalsController.getBaselines);
router.get('/filters', EvalsController.getFilters);
router.get('/model-scores', EvalsController.getModelScores);
router.get('/pr-comparison', EvalsController.getPRComparison);

module.exports = router;
