const { logger } = require('@librechat/data-schemas');
const { Balance, User, AuditLog } = require('~/db/models');
const mongoose = require('mongoose');

/**
 * Enum for standardized error types
 */
const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DB: 'DATABASE_ERROR',
};

/**
 * Creates an audit log entry for admin actions
 * @param {Object} params - Audit log parameters
 * @param {string} params.action - Action type (CREATE, UPDATE, DELETE, BULK_UPDATE)
 * @param {string} params.adminUserId - Admin user ID
 * @param {string} params.targetUserId - Target user ID
 * @param {string} params.endpointName - Endpoint name
 * @param {Object} params.oldValue - Old value (for UPDATE/DELETE)
 * @param {Object} params.newValue - New value (for CREATE/UPDATE)
 * @param {Object} params.req - Express request object (for IP and user agent)
 * @param {Object} params.metadata - Additional metadata
 */
async function createAuditLog({
  action,
  adminUserId,
  targetUserId,
  endpointName,
  oldValue,
  newValue,
  req,
  metadata = {},
}) {
  try {
    const changes = [];

    if (oldValue || newValue) {
      // Record changes for each field
      const fields = new Set([...Object.keys(oldValue || {}), ...Object.keys(newValue || {})]);

      fields.forEach((field) => {
        const old = oldValue?.[field];
        const newVal = newValue?.[field];
        if (JSON.stringify(old) !== JSON.stringify(newVal)) {
          changes.push({
            field,
            oldValue: old,
            newValue: newVal,
          });
        }
      });
    }

    await AuditLog.create({
      timestamp: new Date(),
      action,
      resource: 'ENDPOINT_LIMIT',
      resourceId: `${targetUserId}:${endpointName}`,
      adminUser: adminUserId,
      targetUser: targetUserId,
      changes: changes.length > 0 ? changes : undefined,
      metadata: {
        endpoint: endpointName,
        ...metadata,
      },
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    logger.info('[AuditLog] Endpoint limit change recorded', {
      action,
      admin: adminUserId,
      target: targetUserId,
      endpoint: endpointName,
    });
  } catch (error) {
    // Don't fail the operation if audit logging fails, but log the error
    logger.error('[AuditLog] Failed to create audit log:', error);
  }
}

/**
 * Helper function to find user ID from email or ObjectId
 * @param {string} userIdOrEmail - User ID or email
 * @returns {Promise<string|null>} - User ID or null
 */
async function findUserId(userIdOrEmail) {
  if (mongoose.Types.ObjectId.isValid(userIdOrEmail)) {
    return userIdOrEmail;
  }
  const user = await User.findOne({ email: userIdOrEmail }, '_id').lean();
  return user ? user._id.toString() : null;
}

/**
 * Create endpoint limit object with standardized structure
 * @param {Object} params - Endpoint limit parameters
 * @returns {Object} - Endpoint limit object
 */
function createEndpointLimitObject({
  endpoint,
  tokenCredits,
  enabled,
  autoRefillEnabled,
  refillAmount,
  refillIntervalValue,
  refillIntervalUnit,
  preserveDates,
}) {
  const now = new Date();
  return {
    endpoint,
    tokenCredits,
    enabled,
    autoRefillEnabled,
    refillAmount,
    refillIntervalValue,
    refillIntervalUnit,
    lastUsed: preserveDates?.lastUsed || now,
    lastRefill: preserveDates?.lastRefill || now,
  };
}

/**
 * Upsert endpoint limit for a user (create balance if needed, update existing limit)
 * Accepts optional session for transactions
 * @param {string} userId - User ID
 * @param {Object} limitParams - Endpoint limit parameters
 * @param {Object} options - Optional options { session }
 * @returns {Promise<Object>} - Updated balance document
 */
async function upsertEndpointLimitForUser(userId, limitParams, options = {}) {
  const { session } = options;

  let balance = await Balance.findOne({ user: userId }).session(session);

  if (!balance) {
    balance = new Balance({
      user: userId,
      tokenCredits: 0,
      endpointLimits: [createEndpointLimitObject({ ...limitParams, preserveDates: null })],
    });
  } else {
    const existingIndex = balance.endpointLimits.findIndex(
      (el) => el.endpoint === limitParams.endpoint,
    );
    const existingLimit = balance.endpointLimits[existingIndex];

    if (existingIndex >= 0) {
      balance.endpointLimits[existingIndex] = createEndpointLimitObject({
        ...limitParams,
        preserveDates: { lastUsed: existingLimit.lastUsed, lastRefill: existingLimit.lastRefill },
      });
    } else {
      balance.endpointLimits.push(
        createEndpointLimitObject({ ...limitParams, preserveDates: null }),
      );
    }
  }

  await balance.save({ session });
  return balance;
}

/**
 * Get all endpoint limits for a user
 */
const getUserEndpointLimits = async (req, res) => {
  try {
    const { userId: userIdOrEmail } = req.params;
    const userId = await findUserId(userIdOrEmail);
    if (!userId) return res.status(404).json({ error: 'Resource not found' });

    const balanceData = await Balance.findOne(
      { user: userId },
      'tokenCredits endpointLimits autoRefillEnabled refillAmount refillIntervalValue refillIntervalUnit lastRefill',
    ).lean();

    if (!balanceData) return res.status(404).json({ error: 'Balance not found for user' });

    res.status(200).json({
      userId,
      globalBalance: {
        tokenCredits: balanceData.tokenCredits,
        autoRefillEnabled: balanceData.autoRefillEnabled,
        refillAmount: balanceData.refillAmount,
        refillIntervalValue: balanceData.refillIntervalValue,
        refillIntervalUnit: balanceData.refillIntervalUnit,
        lastRefill: balanceData.lastRefill,
      },
      endpointLimits: balanceData.endpointLimits || [],
    });
  } catch (error) {
    logger.error('[EndpointLimitsController] Error getting user endpoint limits:', error);
    res.status(500).json({ error: 'Failed to retrieve endpoint limits' });
  }
};

/**
 * Set or update an endpoint limit for a user
 */
const setEndpointLimit = async (req, res) => {
  try {
    const { userId: userIdOrEmail, endpointName } = req.params;
    const {
      tokenCredits,
      enabled = true,
      autoRefillEnabled = false,
      refillAmount = 0,
      refillIntervalValue = 30,
      refillIntervalUnit = 'days',
    } = req.body;

    const allowedUnits = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months'];
    if (!allowedUnits.includes(refillIntervalUnit))
      return res
        .status(400)
        .json({ error: `refillIntervalUnit must be one of: ${allowedUnits.join(', ')}` });
    if (!Number.isInteger(refillIntervalValue) || refillIntervalValue <= 0)
      return res.status(400).json({ error: 'refillIntervalValue must be a positive integer' });
    if (tokenCredits === undefined || typeof tokenCredits !== 'number')
      return res.status(400).json({ error: 'tokenCredits is required and must be a number' });
    if (!endpointName || typeof endpointName !== 'string')
      return res
        .status(400)
        .json({ error: 'endpointName parameter is required and must be a string' });

    const userId = await findUserId(userIdOrEmail);
    if (!userId) return res.status(404).json({ error: 'Resource not found' });

    const existingBalance = await Balance.findOne({ user: userId });
    const existingLimit = existingBalance?.endpointLimits?.find(
      (el) => el.endpoint === endpointName,
    );
    const isUpdate = !!existingLimit;

    const balance = await upsertEndpointLimitForUser(userId, {
      endpoint: endpointName,
      tokenCredits,
      enabled,
      autoRefillEnabled,
      refillAmount,
      refillIntervalValue,
      refillIntervalUnit,
    });

    const newLimit = balance.endpointLimits.find((el) => el.endpoint === endpointName);

    await createAuditLog({
      action: isUpdate ? 'UPDATE' : 'CREATE',
      adminUserId: req.user.id,
      targetUserId: userId,
      endpointName,
      oldValue: existingLimit?.toObject?.() || existingLimit,
      newValue: newLimit.toObject?.() || newLimit,
      req,
    });

    res.status(200).json({ message: 'Endpoint limit set successfully', endpointLimit: newLimit });
  } catch (error) {
    logger.error('[EndpointLimitsController] Error setting endpoint limit:', error);
    res.status(500).json({ error: 'Failed to set endpoint limit' });
  }
};

/**
 * Delete an endpoint limit for a user
 */
const deleteEndpointLimit = async (req, res) => {
  try {
    const { userId: userIdOrEmail, endpointName } = req.params;
    const userId = await findUserId(userIdOrEmail);
    if (!userId) return res.status(404).json({ error: 'Resource not found' });

    const balance = await Balance.findOne({ user: userId });
    if (!balance) return res.status(404).json({ error: 'Balance not found for user' });

    const deletedLimit = balance.endpointLimits.find((el) => el.endpoint === endpointName);
    const initialLength = balance.endpointLimits.length;
    balance.endpointLimits = balance.endpointLimits.filter((el) => el.endpoint !== endpointName);
    if (balance.endpointLimits.length === initialLength)
      return res.status(404).json({ error: 'Endpoint limit not found' });

    await balance.save();

    await createAuditLog({
      action: 'DELETE',
      adminUserId: req.user.id,
      targetUserId: userId,
      endpointName,
      oldValue: deletedLimit?.toObject?.() || deletedLimit,
      newValue: null,
      req,
    });

    res.status(200).json({
      message: 'Endpoint limit deleted successfully',
      remainingLimits: balance.endpointLimits,
    });
  } catch (error) {
    logger.error('[EndpointLimitsController] Error deleting endpoint limit:', error);
    res.status(500).json({ error: 'Failed to delete endpoint limit' });
  }
};

/**
 * Bulk set endpoint limits for multiple users
 */
const bulkSetEndpointLimits = async (req, res) => {
  const session = await mongoose.startSession(); // Start MongoDB session
  session.startTransaction(); // Start transaction

  try {
    const {
      userIds,
      endpointName,
      tokenCredits,
      enabled = true,
      autoRefillEnabled = false,
      refillAmount = 0,
      refillIntervalValue = 30,
      refillIntervalUnit = 'days',
    } = req.body;

    const allowedUnits = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months'];
    if (!allowedUnits.includes(refillIntervalUnit))
      return res
        .status(400)
        .json({ error: `refillIntervalUnit must be one of: ${allowedUnits.join(', ')}` });
    if (!Number.isInteger(refillIntervalValue) || refillIntervalValue <= 0)
      return res.status(400).json({ error: 'refillIntervalValue must be a positive integer' });
    if (!Array.isArray(userIds) || userIds.length === 0)
      return res.status(400).json({ error: 'userIds must be a non-empty array' });
    if (!endpointName || typeof endpointName !== 'string')
      return res.status(400).json({ error: 'endpointName is required and must be a string' });
    if (tokenCredits === undefined || typeof tokenCredits !== 'number')
      return res.status(400).json({ error: 'tokenCredits is required and must be a number' });

    const results = { success: [], failed: [] };
    const limitParams = {
      endpoint: endpointName,
      tokenCredits,
      enabled,
      autoRefillEnabled,
      refillAmount,
      refillIntervalValue,
      refillIntervalUnit,
    };

    for (const userIdOrEmail of userIds) {
      try {
        const userId = await findUserId(userIdOrEmail);
        if (!userId) {
          results.failed.push({
            userId: userIdOrEmail,
            error: 'User not found',
            type: ERROR_TYPES.NOT_FOUND,
          });
          continue;
        }

        // Upsert with session
        await upsertEndpointLimitForUser(userId, limitParams, { session });

        await createAuditLog({
          action: 'BULK_UPDATE',
          adminUserId: req.user.id,
          targetUserId: userId,
          endpointName,
          oldValue: null,
          newValue: limitParams,
          req,
          metadata: { bulkOperation: true, totalUsers: userIds.length },
        });

        results.success.push(userIdOrEmail);
      } catch (userError) {
        results.failed.push({
          userId: userIdOrEmail,
          error: userError.message,
          type: ERROR_TYPES.DB,
        });
      }
    }

    await session.commitTransaction(); // Commit if all OK
    res.status(200).json({ message: 'Bulk operation completed', results });
  } catch (transactionError) {
    await session.abortTransaction(); // Rollback if critical error
    logger.error(
      '[EndpointLimitsController] Bulk operation failed, transaction aborted:',
      transactionError,
    );
    res.status(500).json({
      error: 'Bulk operation failed, no changes were applied',
      details: transactionError.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * Get all users with endpoint-specific limits
 */
const getUsersWithEndpointLimits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const endpoint = req.query.endpoint;
    const skip = (page - 1) * pageSize;

    const query = { 'endpointLimits.0': { $exists: true } };
    if (endpoint) query['endpointLimits.endpoint'] = endpoint;

    const [users, total] = await Promise.all([
      Balance.find(query)
        .select('user tokenCredits endpointLimits')
        .populate('user', 'email name username')
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Balance.countDocuments(query),
    ]);

    res.status(200).json({
      users: users.map((u) => ({
        userId: u.user._id,
        email: u.user.email,
        name: u.user.name,
        username: u.user.username,
        globalBalance: u.tokenCredits,
        endpointLimits: endpoint
          ? u.endpointLimits.filter((el) => el.endpoint === endpoint)
          : u.endpointLimits,
      })),
      pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    logger.error('[EndpointLimitsController] Error getting users with endpoint limits:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

/**
 * Get audit logs for endpoint limit changes
 */
const getEndpointLimitsAuditLog = async (req, res) => {
  try {
    const {
      userId,
      adminUserId,
      action,
      endpoint,
      startDate,
      endDate,
      page = 1,
      pageSize = 20,
    } = req.query;
    const query = { resource: 'ENDPOINT_LIMIT' };
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    if (userId) query.targetUser = userId;
    if (adminUserId) query.adminUser = adminUserId;
    if (action) query.action = action;
    if (endpoint) query['metadata.endpoint'] = endpoint;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('adminUser', 'email name username')
        .populate('targetUser', 'email name username')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(pageSize))
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      logs,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        pages: Math.ceil(total / parseInt(pageSize)),
      },
    });
  } catch (error) {
    logger.error('[EndpointLimitsController] Error getting audit logs:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
};

module.exports = {
  getUserEndpointLimits,
  setEndpointLimit,
  deleteEndpointLimit,
  bulkSetEndpointLimits,
  getUsersWithEndpointLimits,
  getEndpointLimitsAuditLog,
};
