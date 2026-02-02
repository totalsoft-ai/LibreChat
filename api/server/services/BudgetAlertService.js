const { logger } = require('@librechat/data-schemas');
const { Balance, User, Notification } = require('~/db/models');
const { getBalanceConfig } = require('@librechat/api');

/**
 * Calculate percentage of budget consumed
 * @param {number} initialLimit - Initial balance/limit
 * @param {number} currentBalance - Current balance
 * @returns {number} Percentage consumed (0-100)
 */
function calculateConsumedPercentage(initialLimit, currentBalance) {
  if (initialLimit <= 0) {
    return 0;
  }
  const consumed = initialLimit - currentBalance;
  const percentage = (consumed / initialLimit) * 100;
  return Math.max(0, Math.min(100, percentage));
}

/**
 * Check if alert should be sent for a given threshold
 * @param {number} consumedPercentage - Current consumed percentage
 * @param {number} threshold - Alert threshold
 * @param {number[]} alertsSent - Array of thresholds already alerted
 * @returns {boolean} True if alert should be sent
 */
function shouldSendAlert(consumedPercentage, threshold, alertsSent = []) {
  // Check if consumed percentage has crossed the threshold
  if (consumedPercentage < threshold) {
    return false;
  }

  // Check if we already sent this alert
  return !alertsSent.includes(threshold);
}

/**
 * Get budget alert configuration from app config
 * @param {Object} appConfig - Application configuration
 * @returns {Object} Alert configuration
 */
function getAlertConfig(appConfig) {
  const balanceConfig = getBalanceConfig(appConfig);
  return {
    enabled: balanceConfig?.alertsEnabled ?? true,
    thresholds: balanceConfig?.alertThresholds ?? [80, 95],
  };
}

/**
 * Send budget alert notification (placeholder - to be implemented)
 * @param {Object} params - Alert parameters
 * @param {string} params.userId - User ID
 * @param {string} params.email - User email
 * @param {string} params.endpoint - Endpoint name (or 'global' for general balance)
 * @param {number} params.threshold - Threshold percentage
 * @param {number} params.consumed - Consumed percentage
 * @param {number} params.remainingCredits - Remaining credits
 * @param {number} params.initialLimit - Initial limit
 */
async function sendBudgetAlert({ userId, email, endpoint, threshold, consumed, remainingCredits, initialLimit }) {
  const remainingDollars = (remainingCredits / 1000000).toFixed(2);
  const initialDollars = (initialLimit / 1000000).toFixed(2);
  const consumedFormatted = consumed.toFixed(1);

  // Determine severity based on threshold
  let severity = 'warning';
  if (threshold >= 95) {
    severity = 'error';
  } else if (threshold >= 80) {
    severity = 'warning';
  }

  // Create notification title and message
  const endpointDisplay = endpoint === 'global' ? 'your account' : `endpoint "${endpoint}"`;
  const title = `Budget Alert: ${threshold}% Used`;
  const message = `You have consumed ${consumedFormatted}% of ${endpointDisplay} budget. Only $${remainingDollars} ($${initialDollars} initial) remaining.`;

  try {
    // Create in-app notification
    const notification = await Notification.create({
      user: userId,
      type: 'BUDGET_ALERT',
      title,
      message,
      severity,
      read: false,
      data: {
        endpoint,
        threshold,
        consumed: parseFloat(consumedFormatted),
        remainingCredits,
        remainingDollars,
        initialLimit,
        initialDollars,
      },
    });

    logger.warn('[BudgetAlertService] Budget alert created', {
      userId,
      endpoint,
      threshold,
      consumed: consumedFormatted,
      notificationId: notification._id,
    });

    // TODO: Optional email notification (if email service is configured)
    // await sendBudgetAlertEmail({ email, title, message, data: notification.data });

    // TODO: Optional webhook notification (if configured)
    // await triggerWebhook('budget_alert', notification);

    return notification;
  } catch (error) {
    logger.error('[BudgetAlertService] Failed to create notification:', error);
    // Don't throw - we don't want to break the main flow if notification fails
    return null;
  }
}

/**
 * Check and send alerts for endpoint-specific limits
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {string} params.email - User email
 * @param {Object} params.endpointLimit - Endpoint limit object
 * @param {number} params.initialLimit - Initial limit for this endpoint
 * @param {number[]} params.thresholds - Alert thresholds
 * @returns {Promise<number[]>} Updated alertsSent array
 */
async function checkEndpointLimitAlerts({ userId, email, endpointLimit, initialLimit, thresholds }) {
  const { endpoint, tokenCredits, alertsSent = [] } = endpointLimit;
  const consumed = calculateConsumedPercentage(initialLimit, tokenCredits);

  const newAlerts = [];

  for (const threshold of thresholds) {
    if (shouldSendAlert(consumed, threshold, alertsSent)) {
      await sendBudgetAlert({
        userId,
        email,
        endpoint,
        threshold,
        consumed,
        remainingCredits: tokenCredits,
        initialLimit,
      });
      newAlerts.push(threshold);
    }
  }

  if (newAlerts.length > 0) {
    return [...alertsSent, ...newAlerts].sort((a, b) => a - b);
  }

  return alertsSent;
}

/**
 * Check budget alerts for a user during balance check
 * This is called from balanceMethods.js during balance verification
 * @param {Object} params - Parameters
 * @param {string} params.user - User ID
 * @param {string} params.endpoint - Endpoint being used
 * @param {Object} params.appConfig - Application configuration
 */
async function checkBudgetAlerts({ user, endpoint, appConfig }) {
  try {
    const alertConfig = getAlertConfig(appConfig);

    if (!alertConfig.enabled || alertConfig.thresholds.length === 0) {
      return;
    }

    const balanceRecord = await Balance.findOne({ user });
    if (!balanceRecord) {
      return;
    }

    const userRecord = await User.findById(user, 'email name').lean();
    if (!userRecord) {
      return;
    }

    // Check alerts for the specific endpoint being used
    if (endpoint) {
      const endpointLimitIndex = balanceRecord.endpointLimits.findIndex((el) => el.endpoint === endpoint);

      if (endpointLimitIndex >= 0) {
        const endpointLimit = balanceRecord.endpointLimits[endpointLimitIndex];

        // Get initial limit from config or use current + consumed as estimate
        const balanceConfig = getBalanceConfig(appConfig);
        const configEndpointLimit = balanceConfig?.endpointLimits?.find((el) => el.endpoint === endpoint);
        const initialLimit = configEndpointLimit?.limit || endpointLimit.tokenCredits;

        const updatedAlertsSent = await checkEndpointLimitAlerts({
          userId: user,
          email: userRecord.email,
          endpointLimit,
          initialLimit,
          thresholds: alertConfig.thresholds,
        });

        // Update alertsSent in database if changed
        if (updatedAlertsSent.length !== endpointLimit.alertsSent?.length) {
          await Balance.updateOne(
            { user },
            {
              $set: {
                [`endpointLimits.${endpointLimitIndex}.alertsSent`]: updatedAlertsSent,
              },
            }
          );
        }
      }
    }
  } catch (error) {
    logger.error('[BudgetAlertService] Error checking budget alerts:', error);
  }
}

/**
 * Reset alerts when refill happens
 * @param {Object} params - Parameters
 * @param {string} params.user - User ID
 * @param {string} [params.model] - Endpoint name (kept as 'model' for backward compatibility)
 */
async function resetAlerts({ user, model }) {
  try {
    if (model) {
      // Reset alerts for specific endpoint
      const balance = await Balance.findOne({ user });
      if (!balance) {
        return;
      }

      const endpointLimitIndex = balance.endpointLimits.findIndex((el) => el.endpoint === model);
      if (endpointLimitIndex >= 0) {
        await Balance.updateOne(
          { user },
          {
            $set: {
              [`endpointLimits.${endpointLimitIndex}.alertsSent`]: [],
              [`endpointLimits.${endpointLimitIndex}.lastAlertReset`]: new Date(),
            },
          }
        );
        logger.debug(`[BudgetAlertService] Reset alerts for user ${user}, endpoint ${model}`);
      }
    } else {
      // Reset global balance alerts
      await Balance.updateOne(
        { user },
        {
          $set: {
            alertsSent: [],
            lastAlertReset: new Date(),
          },
        }
      );
      logger.debug(`[BudgetAlertService] Reset global alerts for user ${user}`);
    }
  } catch (error) {
    logger.error('[BudgetAlertService] Error resetting alerts:', error);
  }
}

module.exports = {
  calculateConsumedPercentage,
  shouldSendAlert,
  getAlertConfig,
  sendBudgetAlert,
  checkEndpointLimitAlerts,
  checkBudgetAlerts,
  resetAlerts,
};
