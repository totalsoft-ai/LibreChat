const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/ModelLimitsController');
const { requireJwtAuth } = require('../../middleware/');
const checkAdmin = require('../../middleware/roles/admin');

router.use(requireJwtAuth, checkAdmin);

// Get all model limits for a user
router.get('/users/:userId/model-limits', controller.getUserModelLimits);

// Set/update model limit for a user
router.put('/users/:userId/model-limits/:model', controller.setModelLimit);

// Delete model limit for a user (revert to global)
router.delete('/users/:userId/model-limits/:model', controller.deleteModelLimit);

// Bulk set model limits for multiple users
router.post('/model-limits/bulk', controller.bulkSetModelLimits);

// Get all users with model-specific limits
router.get('/model-limits/users', controller.getUsersWithModelLimits);

module.exports = router;
