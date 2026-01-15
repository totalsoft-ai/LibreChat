const axios = require('axios');
const Activity = require('~/models/Activity');
const { logger } = require('@librechat/data-schemas');
const { queryLogs } = require('~/server/services/PostgresLogsService');

/**
 * Get authentication events from Keycloak via KC_CONNECTOR microservice
 * @route GET /api/admin/events/auth
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.page - Page number (default: 1)
 * @param {number} req.query.pageSize - Page size (default: 20, max: 100)
 * @param {string} [req.query.eventType] - Filter by event type
 * @param {string} [req.query.user] - Filter by user
 * @param {string} [req.query.fromDate] - Filter events from date (ISO 8601)
 * @param {string} [req.query.toDate] - Filter events to date (ISO 8601)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getAuthEvents = async (req, res) => {
  try {
    // Extract and validate query params
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 100);
    const { eventType, user, fromDate, toDate } = req.query;

    // Validate page number
    if (page < 1) {
      return res.status(400).json({ message: 'Page number must be >= 1' });
    }

    // Check if KC_CONNECTOR is configured
    if (!process.env.KC_CONNECTOR_API_URL || !process.env.KC_CONNECTOR_API_KEY) {
      logger.warn('[getAuthEvents] KC_CONNECTOR not configured');
      return res.status(503).json({
        message: 'Keycloak events service not configured',
      });
    }

    // Build KC_CONNECTOR request params
    const params = {
      page,
      page_size: pageSize,
    };

    // Add Keycloak realm and client_id if configured
    if (process.env.KEYCLOAK_REALM) {
      params.realm = process.env.KEYCLOAK_REALM;
    }
    if (process.env.KEYCLOAK_CLIENT_ID) {
      params.client_id = process.env.KEYCLOAK_CLIENT_ID;
    }

    if (eventType) {
      params.event_type = eventType;
    }
    if (user) {
      params.user = user;
    }
    if (fromDate) {
      params.from_date = fromDate;
    }
    if (toDate) {
      params.to_date = toDate;
    }

    // Log request details for debugging
    logger.info('[getAuthEvents] Calling KC_CONNECTOR', {
      url: `${process.env.KC_CONNECTOR_API_URL}/events`,
      params,
      hasApiKey: !!process.env.KC_CONNECTOR_API_KEY,
    });

    // Call KC_CONNECTOR microservice
    const response = await axios.get(`${process.env.KC_CONNECTOR_API_URL}/events`, {
      params,
      headers: {
        'api-key': process.env.KC_CONNECTOR_API_KEY,
      },
      timeout: 10000, // 10s timeout
    });

    // Transform KC_CONNECTOR response to match our interface
    const kcPagination = response.data.pagination || {};

    // Calculate totalPages if not provided or if in snake_case format
    let totalPages = kcPagination.totalPages || kcPagination.total_pages || 0;
    const total = kcPagination.total || 0;
    const currentPageSize = kcPagination.pageSize || kcPagination.page_size || params.page_size;

    // If totalPages is not provided, calculate it from total and pageSize
    if (!totalPages && total > 0) {
      totalPages = Math.ceil(total / currentPageSize);
    }

    const transformedData = {
      data: response.data.data?.map((event) => ({
        id: event.id,
        timestamp: event.occurred_at || '-',
        user: event.user || 'unknown',
        eventType: event.type || 'unknown',
        resourceType: event.resource_type || event.resourceType || null,
        resourceName: event.resource_name || event.resourceName || null,
        details: event.details || event.metadata || null,
      })) || [],
      pagination: {
        page: kcPagination.page || params.page,
        pageSize: currentPageSize,
        total: total,
        totalPages: totalPages,
      },
    };

    logger.info('[getAuthEvents] Transformed pagination', transformedData.pagination);
    return res.json(transformedData);
  } catch (error) {
    // Handle timeout and connection errors
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      logger.error('[getAuthEvents] KC_CONNECTOR unavailable', error.message);
      return res.status(503).json({
        message: 'Events service temporarily unavailable',
      });
    }

    // Handle HTTP errors from KC_CONNECTOR
    if (error.response) {
      logger.error('[getAuthEvents] KC_CONNECTOR error', {
        status: error.response.status,
        data: error.response.data,
      });
      return res.status(error.response.status).json(error.response.data);
    }

    // Handle unexpected errors
    logger.error('[getAuthEvents] Unexpected error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get internal application events from Activity model
 * @route GET /api/admin/events/internal
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.page - Page number (default: 1)
 * @param {number} req.query.pageSize - Page size (default: 20, max: 100)
 * @param {string} [req.query.eventType] - Filter by event type
 * @param {string} [req.query.user] - Filter by user ID or username/email
 * @param {string} [req.query.fromDate] - Filter events from date (ISO 8601)
 * @param {string} [req.query.toDate] - Filter events to date (ISO 8601)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getInternalEvents = async (req, res) => {
  try {
    // Extract and validate query params
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 100);
    const { eventType, user, fromDate, toDate } = req.query;

    // Validate page number
    if (page < 1) {
      return res.status(400).json({ message: 'Page number must be >= 1' });
    }

    const skip = (page - 1) * pageSize;

    // Build MongoDB query
    const query = {};

    if (eventType) {
      query.type = eventType;
    }

    if (user) {
      // Search for users matching the search term (name, email, or username)
      const userSearchRegex = new RegExp(user, 'i'); // case-insensitive
      const matchingUsers = await User.find({
        $or: [
          { name: userSearchRegex },
          { email: userSearchRegex },
          { username: userSearchRegex },
        ],
      })
        .select('_id')
        .lean();

      const userIds = matchingUsers.map((u) => u._id);

      if (userIds.length > 0) {
        query.user = { $in: userIds };
      } else {
        // No matching users found, return empty results
        query.user = null; // Will match nothing
      }
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        const from = new Date(fromDate);
        if (isNaN(from.getTime())) {
          return res.status(400).json({ message: 'Invalid fromDate format' });
        }
        query.createdAt.$gte = from;
      }
      if (toDate) {
        const to = new Date(toDate);
        if (isNaN(to.getTime())) {
          return res.status(400).json({ message: 'Invalid toDate format' });
        }
        query.createdAt.$lte = to;
      }
    }

    // Execute queries in parallel for better performance
    const [events, total] = await Promise.all([
      Activity.find(query)
        .populate('user', 'name email username')
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean(), // Use lean() for better performance (read-only)
      Activity.countDocuments(query),
    ]);

    // Format response data
    const data = events.map((event) => ({
      id: event._id.toString(),
      timestamp: event.createdAt,
      user: event.user?.username || event.user?.email || event.user?.name || 'Unknown',
      eventType: event.type,
      resourceType: event.resourceType || null,
      resourceName: event.resourceName || null,
      details: event.metadata ? JSON.stringify(event.metadata) : null,
    }));

    // Return paginated response
    return res.json({
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    logger.error('[getInternalEvents] Error querying Activity model', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get error logs from PostgreSQL database
 * @route GET /api/admin/events/logs
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.page - Page number (default: 1)
 * @param {number} req.query.pageSize - Page size (default: 20, max: 100)
 * @param {string} [req.query.level] - Filter by log level (error, warn, info, debug)
 * @param {string} [req.query.fromDate] - Filter logs from date (ISO 8601)
 * @param {string} [req.query.toDate] - Filter logs to date (ISO 8601)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getLogs = async (req, res) => {
  try {
    // Extract and validate query params
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 100);
    const { level, fromDate, toDate } = req.query;

    // Validate page number
    if (page < 1) {
      return res.status(400).json({ message: 'Page number must be >= 1' });
    }

    // Check if PostgreSQL is configured
    if (!process.env.POSTGRES_LOGS_URI) {
      logger.warn('[getLogs] POSTGRES_LOGS_URI not configured');
      return res.status(503).json({
        message: 'Logs database not configured',
      });
    }

    // Parse dates if provided
    const fromDateObj = fromDate ? new Date(fromDate) : null;
    const toDateObj = toDate ? new Date(toDate) : null;

    // Validate dates
    if (fromDate && isNaN(fromDateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid fromDate format' });
    }
    if (toDate && isNaN(toDateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid toDate format' });
    }

    // Query logs from PostgreSQL
    const { data: logs, total } = await queryLogs({
      page,
      pageSize,
      level,
      fromDate: fromDateObj,
      toDate: toDateObj,
    });

    // Format response to match Events interface
    const data = logs.map((log) => ({
      id: log.id.toString(),
      timestamp: log.timestamp,
      user: 'System',
      eventType: log.level,
      resourceType: null,
      resourceName: null,
      details: JSON.stringify({
        message: log.message,
        stack: log.stack,
        metadata: log.metadata,
      }),
    }));

    return res.json({
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    // Handle PostgreSQL connection errors
    if (error.code === 'ECONNREFUSED' || error.message.includes('connection')) {
      logger.error('[getLogs] PostgreSQL unavailable', error.message);
      return res.status(503).json({
        message: 'Logs database temporarily unavailable',
      });
    }

    logger.error('[getLogs] Error querying logs', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAuthEvents,
  getInternalEvents,
  getLogs,
};
