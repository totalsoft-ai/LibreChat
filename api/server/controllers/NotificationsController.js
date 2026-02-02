const { logger } = require('@librechat/data-schemas');
const { Notification } = require('~/db/models');

/**
 * Get notifications for the authenticated user
 * GET /api/notifications?page=1&pageSize=20&unreadOnly=true
 */
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 100);
    const unreadOnly = req.query.unreadOnly === 'true';
    const type = req.query.type;
    const skip = (page - 1) * pageSize;

    const query = { user: userId };
    if (unreadOnly) {
      query.read = false;
    }
    if (type) {
      query.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: userId, read: false }),
    ]);

    res.status(200).json({
      notifications,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
      unreadCount,
    });
  } catch (error) {
    logger.error('[NotificationsController] Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
};

/**
 * Mark notification(s) as read
 * PUT /api/notifications/:id/read OR PUT /api/notifications/read (body: { notificationIds: [] })
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { notificationIds } = req.body;

    let result;

    if (id) {
      // Mark single notification as read
      result = await Notification.updateOne(
        { _id: id, user: userId },
        { $set: { read: true, readAt: new Date() } },
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark multiple notifications as read
      result = await Notification.updateMany(
        { _id: { $in: notificationIds }, user: userId },
        { $set: { read: true, readAt: new Date() } },
      );
    } else {
      return res.status(400).json({ error: 'Invalid request' });
    }

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Notification(s) not found' });
    }

    res.status(200).json({
      message: 'Marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error('[NotificationsController] Error marking as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

/**
 * Mark all notifications as read for the user
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true, readAt: new Date() } },
    );

    res.status(200).json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error('[NotificationsController] Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await Notification.deleteOne({ _id: id, user: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    logger.error('[NotificationsController] Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

/**
 * Get unread count
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      user: userId,
      read: false,
    });

    res.status(200).json({ count });
  } catch (error) {
    logger.error('[NotificationsController] Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
