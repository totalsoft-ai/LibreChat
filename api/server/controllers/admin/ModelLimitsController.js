const { logger } = require('@librechat/data-schemas');
const { Balance, User } = require('~/db/models');
const mongoose = require('mongoose');

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
 * Create model limit object with standardized structure
 * @param {Object} params - Model limit parameters
 * @returns {Object} - Model limit object
 */
function createModelLimitObject({
  model,
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
    model,
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
 * Upsert model limit for a user (create balance if needed, update existing limit)
 * @param {string} userId - User ID
 * @param {Object} limitParams - Model limit parameters
 * @returns {Promise<Object>} - Updated balance document
 */
async function upsertModelLimitForUser(userId, limitParams) {
  let balance = await Balance.findOne({ user: userId });

  if (!balance) {
    balance = new Balance({
      user: userId,
      tokenCredits: 0,
      modelLimits: [createModelLimitObject({ ...limitParams, preserveDates: null })],
    });
  } else {
    const existingIndex = balance.modelLimits.findIndex((ml) => ml.model === limitParams.model);
    const existingLimit = balance.modelLimits[existingIndex];

    if (existingIndex >= 0) {
      balance.modelLimits[existingIndex] = createModelLimitObject({
        ...limitParams,
        preserveDates: { lastUsed: existingLimit.lastUsed, lastRefill: existingLimit.lastRefill },
      });
    } else {
      balance.modelLimits.push(createModelLimitObject({ ...limitParams, preserveDates: null }));
    }
  }

  await balance.save();
  return balance;
}

/**
 * Get all model limits for a user
 * GET /api/admin/users/:userId/model-limits
 * Accepts either User ID (ObjectId) or email address
 */
const getUserModelLimits = async (req, res) => {
  try {
    const { userId: userIdOrEmail } = req.params;

    // Find actual user ID
    const userId = await findUserId(userIdOrEmail);
    if (!userId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const balanceData = await Balance.findOne(
      { user: userId },
      'tokenCredits modelLimits autoRefillEnabled refillAmount refillIntervalValue refillIntervalUnit lastRefill',
    ).lean();

    if (!balanceData) {
      return res.status(404).json({ error: 'Balance not found for user' });
    }

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
      modelLimits: balanceData.modelLimits || [],
    });
  } catch (error) {
    logger.error('[ModelLimitsController] Error getting user model limits:', error);
    res.status(500).json({ error: 'Failed to retrieve model limits' });
  }
};

/**
 * Set or update a model limit for a user
 * PUT /api/admin/users/:userId/model-limits/:model
 * Body: { tokenCredits, enabled, autoRefillEnabled?, refillAmount?, refillIntervalValue?, refillIntervalUnit? }
 * Accepts either User ID (ObjectId) or email address
 */
const setModelLimit = async (req, res) => {
  try {
    const { userId: userIdOrEmail, model } = req.params;
    const {
      tokenCredits,
      enabled = true,
      autoRefillEnabled = false,
      refillAmount = 0,
      refillIntervalValue = 30,
      refillIntervalUnit = 'days',
    } = req.body;

    if (tokenCredits === undefined || typeof tokenCredits !== 'number') {
      return res.status(400).json({ error: 'tokenCredits is required and must be a number' });
    }

    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'model parameter is required and must be a string' });
    }

    const userId = await findUserId(userIdOrEmail);
    if (!userId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const balance = await upsertModelLimitForUser(userId, {
      model,
      tokenCredits,
      enabled,
      autoRefillEnabled,
      refillAmount,
      refillIntervalValue,
      refillIntervalUnit,
    });

    res.status(200).json({
      message: 'Model limit set successfully',
      modelLimit: balance.modelLimits.find((ml) => ml.model === model),
    });
  } catch (error) {
    logger.error('[ModelLimitsController] Error setting model limit:', error);
    res.status(500).json({ error: 'Failed to set model limit' });
  }
};

/**
 * Delete a model limit for a user (revert to global balance)
 * DELETE /api/admin/users/:userId/model-limits/:model
 * Accepts either User ID (ObjectId) or email address
 */
const deleteModelLimit = async (req, res) => {
  try {
    const { userId: userIdOrEmail, model } = req.params;

    // Find actual user ID
    const userId = await findUserId(userIdOrEmail);
    if (!userId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const balance = await Balance.findOne({ user: userId });

    if (!balance) {
      return res.status(404).json({ error: 'Balance not found for user' });
    }

    const initialLength = balance.modelLimits.length;
    balance.modelLimits = balance.modelLimits.filter((ml) => ml.model !== model);

    if (balance.modelLimits.length === initialLength) {
      return res.status(404).json({ error: 'Model limit not found' });
    }

    await balance.save();

    res.status(200).json({
      message: 'Model limit deleted successfully',
      remainingLimits: balance.modelLimits,
    });
  } catch (error) {
    logger.error('[ModelLimitsController] Error deleting model limit:', error);
    res.status(500).json({ error: 'Failed to delete model limit' });
  }
};

/**
 * Bulk set model limits for multiple users
 * POST /api/admin/model-limits/bulk
 * Body: { userIds: ["id1", "id2"], model: "gpt-4", tokenCredits: 5000, enabled: true, ... }
 */
const bulkSetModelLimits = async (req, res) => {
  try {
    const {
      userIds,
      model,
      tokenCredits,
      enabled = true,
      autoRefillEnabled = false,
      refillAmount = 0,
      refillIntervalValue = 30,
      refillIntervalUnit = 'days',
    } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds must be a non-empty array' });
    }

    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'model is required and must be a string' });
    }

    if (tokenCredits === undefined || typeof tokenCredits !== 'number') {
      return res.status(400).json({ error: 'tokenCredits is required and must be a number' });
    }

    const results = { success: [], failed: [] };
    const limitParams = {
      model,
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
          results.failed.push({ userId: userIdOrEmail, error: 'User not found' });
          continue;
        }

        await upsertModelLimitForUser(userId, limitParams);
        results.success.push(userIdOrEmail);
      } catch (error) {
        logger.error(
          `[ModelLimitsController] Error setting limit for user ${userIdOrEmail}:`,
          error,
        );
        results.failed.push({ userId: userIdOrEmail, error: error.message });
      }
    }

    res.status(200).json({
      message: 'Bulk operation completed',
      results,
    });
  } catch (error) {
    logger.error('[ModelLimitsController] Error in bulk set model limits:', error);
    res.status(500).json({ error: 'Failed to perform bulk operation' });
  }
};

/**
 * Get all users with model-specific limits
 * GET /api/admin/model-limits/users?page=1&pageSize=20&model=gpt-4
 */
const getUsersWithModelLimits = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const model = req.query.model;
    const skip = (page - 1) * pageSize;

    // Build query
    const query = { 'modelLimits.0': { $exists: true } };
    if (model) {
      query['modelLimits.model'] = model;
    }

    const [users, total] = await Promise.all([
      Balance.find(query)
        .select('user tokenCredits modelLimits')
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
        modelLimits: model ? u.modelLimits.filter((ml) => ml.model === model) : u.modelLimits,
      })),
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    logger.error('[ModelLimitsController] Error getting users with model limits:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

module.exports = {
  getUserModelLimits,
  setModelLimit,
  deleteModelLimit,
  bulkSetModelLimits,
  getUsersWithModelLimits,
};
