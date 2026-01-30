const express = require('express');
const router = express.Router();
const controller = require('../controllers/Balance');
const { requireJwtAuth } = require('../middleware/');

router.get('/', requireJwtAuth, controller.getBalance);
router.get('/model-limits', requireJwtAuth, controller.getModelLimits);      // Backwards compatibility
router.get('/endpoint-limits', requireJwtAuth, controller.getEndpointLimits); // New endpoint

module.exports = router;
