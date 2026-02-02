const express = require('express');
const router = express.Router();
const controller = require('../controllers/NotificationsController');
const { requireJwtAuth } = require('../middleware/');

router.use(requireJwtAuth);

// Get user notifications
router.get('/', controller.getUserNotifications);

// Get unread count
router.get('/unread-count', controller.getUnreadCount);

// Mark all as read
router.put('/read-all', controller.markAllAsRead);

// Mark notification(s) as read
router.put('/read', controller.markAsRead);
router.put('/:id/read', controller.markAsRead);

// Delete notification
router.delete('/:id', controller.deleteNotification);

module.exports = router;
