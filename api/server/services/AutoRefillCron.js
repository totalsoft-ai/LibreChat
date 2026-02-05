const cron = require('node-cron');
const { logger } = require('@librechat/data-schemas');
const { Balance } = require('~/db/models');
const { createAutoRefillTransaction } = require('~/models/Transaction');

/**
 * Calculates the next refill date based on interval unit
 * @param {Date} lastRefill - Last refill date
 * @param {number} intervalValue - Interval value
 * @param {string} intervalUnit - Unit: seconds, minutes, hours, days, weeks, months
 * @returns {Date} Next refill date
 */
function calculateNextRefillDate(lastRefill, intervalValue, intervalUnit) {
  const next = new Date(lastRefill);

  switch (intervalUnit) {
    case 'seconds':
      next.setSeconds(next.getSeconds() + intervalValue);
      break;
    case 'minutes':
      next.setMinutes(next.getMinutes() + intervalValue);
      break;
    case 'hours':
      next.setHours(next.getHours() + intervalValue);
      break;
    case 'days':
      next.setDate(next.getDate() + intervalValue);
      break;
    case 'weeks':
      next.setDate(next.getDate() + intervalValue * 7);
      break;
    case 'months':
      next.setMonth(next.getMonth() + intervalValue);
      break;
    default:
      logger.warn(`[AutoRefill] Unknown interval unit: ${intervalUnit}, defaulting to days`);
      next.setDate(next.getDate() + intervalValue);
  }

  return next;
}

/**
 * Auto-refill cron job
 * Runs every hour (or custom interval from env) to check and process auto-refills
 */
function startAutoRefillCron() {
  // Default: every hour at minute 0 (0 * * * *)
  // Env variable format: CRON format (e.g., "*/5 * * * *" for every 5 minutes)
  const cronSchedule = process.env.AUTO_REFILL_CRON || '0 * * * *';
  const timezone = process.env.AUTO_REFILL_TIMEZONE || 'UTC';

  logger.info(`[AutoRefill] Starting auto-refill cron job with schedule: ${cronSchedule} (timezone: ${timezone})`);

  cron.schedule(cronSchedule, async () => {
    try {
      const now = new Date();
      logger.debug(`[AutoRefill] Running auto-refill check at ${now.toISOString()}`);

      // Find all balances with auto-refill enabled
      const balances = await Balance.find({
        autoRefillEnabled: true,
        refillAmount: { $gt: 0 },
      }).lean();

      if (!balances || balances.length === 0) {
        logger.debug('[AutoRefill] No balances with auto-refill enabled found');
        return;
      }

      logger.debug(`[AutoRefill] Found ${balances.length} balances with auto-refill enabled`);

      let processedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const balance of balances) {
        try {
          const {
            user,
            refillAmount,
            refillIntervalValue,
            refillIntervalUnit,
            lastRefill,
            tokenCredits,
          } = balance;

          // For daily refills, check if the day has changed (not just 24 hours)
          let shouldRefill = false;
          if (refillIntervalUnit === 'days') {
            const lastRefillDate = new Date(lastRefill);
            const lastRefillDay = lastRefillDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const todayDay = now.toISOString().split('T')[0]; // YYYY-MM-DD

            shouldRefill = lastRefillDay !== todayDay;

            if (!shouldRefill) {
              logger.debug(
                `[AutoRefill] Skipping user ${user}: already refilled today (last refill: ${lastRefillDay})`,
              );
              skippedCount++;
              continue;
            }
          } else {
            // For other intervals (hours, minutes, etc.), use the existing logic
            const nextRefillDate = calculateNextRefillDate(
              new Date(lastRefill),
              refillIntervalValue,
              refillIntervalUnit,
            );

            if (now < nextRefillDate) {
              logger.debug(
                `[AutoRefill] Skipping user ${user}: next refill at ${nextRefillDate.toISOString()}`,
              );
              skippedCount++;
              continue;
            }
          }

          // Perform auto-refill
          logger.info(
            `[AutoRefill] Processing refill for user ${user}: ${refillAmount} credits (current: ${tokenCredits})`,
          );

          const result = await createAutoRefillTransaction({
            user: user,
            tokenType: 'credits',
            context: 'autoRefill',
            rawAmount: refillAmount,
          });

          logger.info(
            `[AutoRefill] ✓ Refilled user ${user}: +${refillAmount} credits → new balance: ${result.balance}`,
          );

          processedCount++;
        } catch (error) {
          errorCount++;
          logger.error(`[AutoRefill] Error processing refill for user ${balance.user}:`, error);
        }
      }

      logger.info(
        `[AutoRefill] Completed: ${processedCount} processed, ${skippedCount} skipped, ${errorCount} errors`,
      );
    } catch (error) {
      logger.error('[AutoRefill] Error in cron job:', error);
    }
  }, {
    timezone: timezone
  });

  logger.info('[AutoRefill] Cron job started successfully');
}

/**
 * Manually trigger auto-refill for a specific user (for testing)
 * @param {string} userId - User ID
 * @returns {Promise<object>} Result
 */
async function manualRefill(userId) {
  try {
    const balance = await Balance.findOne({ user: userId });

    if (!balance) {
      throw new Error('Balance not found');
    }

    if (!balance.autoRefillEnabled) {
      throw new Error('Auto-refill is not enabled for this user');
    }

    const result = await createAutoRefillTransaction({
      user: userId,
      tokenType: 'credits',
      context: 'manualRefill',
      rawAmount: balance.refillAmount,
    });

    logger.info(`[AutoRefill] Manual refill for user ${userId}: +${balance.refillAmount} credits`);

    return result;
  } catch (error) {
    logger.error(`[AutoRefill] Manual refill error for user ${userId}:`, error);
    throw error;
  }
}

module.exports = {
  startAutoRefillCron,
  manualRefill,
  calculateNextRefillDate,
};
