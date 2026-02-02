const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/EndpointLimitsController');
const { requireJwtAuth } = require('../../middleware/');
const checkAdmin = require('../../middleware/roles/admin');

router.use(requireJwtAuth, checkAdmin);

// Get all endpoint limits for a user
router.get('/users/:userId/endpoint-limits', controller.getUserEndpointLimits);

// Set/update endpoint limit for a user
router.put('/users/:userId/endpoint-limits/:endpointName', controller.setEndpointLimit);

// Delete endpoint limit for a user (revert to global)
router.delete('/users/:userId/endpoint-limits/:endpointName', controller.deleteEndpointLimit);

// Bulk set endpoint limits for multiple users
router.post('/endpoint-limits/bulk', controller.bulkSetEndpointLimits);

// Get all users with endpoint-specific limits
router.get('/endpoint-limits/users', controller.getUsersWithEndpointLimits);

// Get audit logs for endpoint limit changes
router.get('/endpoint-limits/audit', controller.getEndpointLimitsAuditLog);

module.exports = router;
