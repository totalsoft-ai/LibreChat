const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const checkAdmin = require('~/server/middleware/roles/admin');
const SystemStatusController = require('~/server/controllers/admin/SystemStatusController');

const router = express.Router();

router.use(requireJwtAuth);
router.use(checkAdmin);

router.get('/', SystemStatusController.getStatus);
router.get('/history', SystemStatusController.getHistory);
router.get('/incidents', SystemStatusController.getIncidents);

module.exports = router;
