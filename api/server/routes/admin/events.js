const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const checkAdmin = require('~/server/middleware/roles/admin');
const EventsController = require('~/server/controllers/admin/EventsController');

const router = express.Router();

// Apply JWT auth and admin check to all routes
router.use(requireJwtAuth);
router.use(checkAdmin);

// GET /api/admin/events/auth - Get Keycloak authentication events
router.get('/auth', EventsController.getAuthEvents);

// GET /api/admin/events/internal - Get internal application events
router.get('/internal', EventsController.getInternalEvents);

// GET /api/admin/events/logs - Get error logs from Winston log files
router.get('/logs', EventsController.getLogs);

module.exports = router;
