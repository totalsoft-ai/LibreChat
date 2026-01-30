const cron = require('node-cron');
const { logger } = require('@librechat/data-schemas');
const { Balance } = require('~/db/models');
const { createModelAutoRefillTransaction } = require('~/models/Transaction');

/**
 * Adds interval to a date
 * @param {Date} date - Starting date
 * @param {number} value - Interval value
 * @param {string} unit - Interval unit (seconds/minutes/hours/days/weeks/months)
 * @returns {Date} New date with interval added
 */
const addIntervalToDate = (date, value, unit) => {
  const result = new Date(date);
  const operations = {
    seconds: () => result.setSeconds(result.getSeconds() + value),
    minutes: () => result.setMinutes(result.getMinutes() + value),
    hours: () => result.setHours(result.getHours() + value),
    days: () => result.setDate(result.getDate() + value),
    weeks: () => result.setDate(result.getDate() + value * 7),
    months: () => result.setMonth(result.getMonth() + value),
  };
  operations[unit]?.();
  return result;
};

/**
 * Processes auto-refill for a single endpoint limit
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.endpoint - Endpoint name
 * @param {Object} params.endpointLimit - Endpoint limit object
 * @returns {Promise<boolean>} True if refill was performed
 */
async function processEndpointRefill({ userId, endpoint, endpointLimit }) {
  const now = new Date();
  const lastRefillDate = new Date(endpointLimit.lastRefill);
  const nextRefillTime = addIntervalToDate(
    lastRefillDate,
    endpointLimit.refillIntervalValue,
    endpointLimit.refillIntervalUnit,
  );

  // Check if interval has passed
  if (now < nextRefillTime) {
    return false;
  }

  try {
    logger.info('[AutoRefillScheduler] Performing scheduled refill', {
      user: userId,
      endpoint,
      refillAmount: endpointLimit.refillAmount,
      lastRefill: lastRefillDate,
      nextRefillTime,
    });

    // Create auto-refill transaction
    await createModelAutoRefillTransaction({
      user: userId,
      model: endpoint,
      tokenType: 'credits',
      context: 'autoRefill',
      rawAmount: endpointLimit.refillAmount,
    });

    logger.info('[AutoRefillScheduler] Refill successful', {
      user: userId,
      endpoint,
      amount: endpointLimit.refillAmount,
    });

    return true;
  } catch (error) {
    logger.error('[AutoRefillScheduler] Failed to process refill', {
      user: userId,
      endpoint,
      error: error.message,
    });
    return false;
  }
}

/**
 * Checks all users and processes auto-refills where needed
 */
async function checkAndRefillAll() {
  try {
    logger.debug('[AutoRefillScheduler] Starting scheduled refill check');

    // Find all balance records with auto-refill enabled endpoints
    const balances = await Balance.find({
      'endpointLimits.autoRefillEnabled': true,
      'endpointLimits.enabled': true,
    }).lean();

    if (!balances || balances.length === 0) {
      logger.debug('[AutoRefillScheduler] No users with auto-refill enabled');
      return;
    }

    logger.debug(`[AutoRefillScheduler] Found ${balances.length} users with auto-refill enabled`);

    let totalRefills = 0;
    const now = new Date();

    // Process each user's endpoint limits
    for (const balance of balances) {
      const userId = balance.user.toString();

      // Find endpoint limits that need refill
      for (const endpointLimit of balance.endpointLimits || []) {
        // Skip if not enabled or auto-refill not enabled
        if (!endpointLimit.enabled || !endpointLimit.autoRefillEnabled) {
          continue;
        }

        // Skip if refillAmount is 0 or negative
        if (!endpointLimit.refillAmount || endpointLimit.refillAmount <= 0) {
          continue;
        }

        // Check if interval has passed
        const lastRefillDate = new Date(endpointLimit.lastRefill);
        const nextRefillTime = addIntervalToDate(
          lastRefillDate,
          endpointLimit.refillIntervalValue,
          endpointLimit.refillIntervalUnit,
        );

        if (now >= nextRefillTime) {
          const success = await processEndpointRefill({
            userId,
            endpoint: endpointLimit.endpoint,
            endpointLimit,
          });

          if (success) {
            totalRefills++;
          }
        }
      }
    }

    if (totalRefills > 0) {
      logger.info(`[AutoRefillScheduler] Completed: ${totalRefills} refills processed`);
    } else {
      logger.debug('[AutoRefillScheduler] Completed: No refills needed');
    }
  } catch (error) {
    logger.error('[AutoRefillScheduler] Error during scheduled refill check', error);
  }
}

/**
 * Starts the auto-refill scheduler
 * @param {Object} options - Scheduler options
 * @param {string} options.cronExpression - Cron expression (default: every minute)
 * @param {boolean} options.runImmediately - Run immediately on start (default: false)
 */
function startAutoRefillScheduler(options = {}) {
  const {
    cronExpression = '* * * * *', // Every minute by default
    runImmediately = false,
  } = options;

  logger.info('[AutoRefillScheduler] Starting scheduler', {
    cronExpression,
    runImmediately,
  });

  // Schedule periodic checks
  const task = cron.schedule(cronExpression, async () => {
    await checkAndRefillAll();
  });

  // Run immediately if requested
  if (runImmediately) {
    logger.info('[AutoRefillScheduler] Running immediate check');
    checkAndRefillAll().catch((error) => {
      logger.error('[AutoRefillScheduler] Error in immediate check', error);
    });
  }

  logger.info('[AutoRefillScheduler] Scheduler started successfully');

  return {
    task,
    stop: () => {
      logger.info('[AutoRefillScheduler] Stopping scheduler');
      task.stop();
    },
    checkNow: () => checkAndRefillAll(),
  };
}

/**
 * Manual trigger for testing
 */
async function triggerManualRefill() {
  logger.info('[AutoRefillScheduler] Manual refill triggered');
  await checkAndRefillAll();
}

module.exports = {
  startAutoRefillScheduler,
  triggerManualRefill,
  checkAndRefillAll,
};
