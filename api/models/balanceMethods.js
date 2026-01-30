const { logger } = require('@librechat/data-schemas');
const { ViolationTypes } = require('librechat-data-provider');
const { createAutoRefillTransaction, createModelAutoRefillTransaction } = require('./Transaction');
const { logViolation } = require('~/cache');
const { getMultiplier } = require('./tx');
const { Balance } = require('~/db/models');
const { checkBudgetAlerts } = require('~/server/services/BudgetAlertService');

/**
 * Adds a time interval to a given date.
 * @param {Date} date - The starting date.
 * @param {number} value - The numeric value of the interval.
 * @param {'seconds'|'minutes'|'hours'|'days'|'weeks'|'months'} unit - The unit of time.
 * @returns {Date} A new Date representing the starting date plus the interval.
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

const getHoursUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date();

  // Reset la ora 00:00
  midnight.setHours(24, 0, 0, 0);

  const diffMs = midnight - now;

  return Math.ceil(diffMs / (1000 * 60 * 60));
};


/**
 * Checks if refill is due and performs auto-refill if conditions are met.
 * @param {Object} params - Refill parameters
 * @param {string} params.user - User ID
 * @param {Date} params.lastRefill - Last refill date
 * @param {number} params.intervalValue - Refill interval value
 * @param {string} params.intervalUnit - Refill interval unit
 * @param {number} params.refillAmount - Amount to refill
 * @param {Function} params.createTransaction - Transaction creation function
 * @param {string} params.logContext - Context for logging
 * @param {string} [params.model] - Model name for model-specific refills
 * @returns {Promise<number|null>} New balance or null if no refill occurred
 */
const attemptAutoRefill = async ({
  user,
  lastRefill,
  intervalValue,
  intervalUnit,
  refillAmount,
  createTransaction,
  logContext,
  model,
}) => {
  const lastRefillDate = new Date(lastRefill);
  const now = new Date();

  if (
    isNaN(lastRefillDate) ||
    now >= addIntervalToDate(lastRefillDate, intervalValue, intervalUnit)
  ) {
    try {
      const result = await createTransaction({
        user,
        ...(model && { model }),
        tokenType: 'credits',
        context: 'autoRefill',
        rawAmount: refillAmount,
      });
      return result.balance;
    } catch (error) {
      logger.error(`[Balance.check] Failed to record ${logContext} auto-refill transaction`, error);
    }
  }
  return null;
};

/**
 * Simple check method that calculates token cost and returns balance info.
 * The auto-refill logic has been moved to balanceMethods.js to prevent circular dependencies.
 * Now supports model-specific limits with fallback to global balance.
 */
const checkBalanceRecord = async function ({
  user,
  model,
  endpoint,
  valueKey,
  tokenType,
  amount,
  endpointTokenConfig,
}) {
  const multiplier = getMultiplier({ valueKey, tokenType, model, endpoint, endpointTokenConfig });
  const tokenCost = amount * multiplier;

  // Retrieve the balance record
  let record = await Balance.findOne({ user }).lean();
  if (!record) {
    logger.debug('[Balance.check] No balance record found for user', { user });
    return {
      canSpend: false,
      balance: 0,
      tokenCost,
      balanceSource: 'global',
    };
  }

  // Check for endpoint-specific limit
  const endpointLimit = endpoint && record.endpointLimits?.find((el) => el.endpoint === endpoint && el.enabled);

  // If no endpoint limit exists OR not enabled → ALLOW UNLIMITED
  if (!endpointLimit) {
    logger.debug('[Balance.check] No endpoint limit found - allowing unlimited', { user, endpoint });
    return {
      canSpend: true,  // Allow unlimited spending
      balance: Infinity,
      tokenCost,
      balanceSource: endpoint || 'none',
    };
  }

  // Use endpoint-specific balance
  const balanceSource = endpoint;
  let balance = endpointLimit.tokenCredits;

  logger.debug('[Balance.check] Initial state', {
    user,
    model,
    endpoint,
    valueKey,
    tokenType,
    amount,
    balance,
    balanceSource,
    multiplier,
    endpointTokenConfig: !!endpointTokenConfig,
  });

  // Only perform auto-refill if spending would bring the balance to 0 or below
  if (balance - tokenCost <= 0) {
    let newBalance = null;

    // Only endpoint-level auto-refill (no global fallback)
    if (endpointLimit.autoRefillEnabled && endpointLimit.refillAmount > 0) {
      newBalance = await attemptAutoRefill({
        user,
        lastRefill: endpointLimit.lastRefill,
        intervalValue: endpointLimit.refillIntervalValue,
        intervalUnit: endpointLimit.refillIntervalUnit,
        refillAmount: endpointLimit.refillAmount,
        createTransaction: createModelAutoRefillTransaction,
        logContext: 'endpoint',
        model: endpoint, // Use endpoint as model parameter for transaction
      });
    }

    if (newBalance !== null) {
      balance = newBalance;
    }
  }

  logger.debug('[Balance.check] Token cost', { tokenCost, balanceSource });
  return { canSpend: balance >= tokenCost, balance, tokenCost, balanceSource };
};

/**
 * Checks the balance for a user and determines if they can spend a certain amount.
 * If the user cannot spend the amount, it logs a violation and denies the request.
 * Stores the balanceSource in req.balanceSource for use in subsequent transactions.
 *
 * @async
 * @function
 * @param {Object} params - The function parameters.
 * @param {ServerRequest} params.req - The Express request object.
 * @param {Express.Response} params.res - The Express response object.
 * @param {Object} params.txData - The transaction data.
 * @param {string} params.txData.user - The user ID or identifier.
 * @param {('prompt' | 'completion')} params.txData.tokenType - The type of token.
 * @param {number} params.txData.amount - The amount of tokens.
 * @param {string} params.txData.model - The model name or identifier.
 * @param {string} [params.txData.endpointTokenConfig] - The token configuration for the endpoint.
 * @returns {Promise<boolean>} Throws error if the user cannot spend the amount.
 * @throws {Error} Throws an error if there's an issue with the balance check.
 */
const checkBalance = async ({ req, res, txData }) => {
  const { canSpend, balance, tokenCost, balanceSource } = await checkBalanceRecord(txData);

  // Store balanceSource in request for use in transaction creation
  if (req && balanceSource) {
    req.balanceSource = balanceSource;
  }

  // Check budget alerts (non-blocking - runs in background)
  // This triggers notifications when user approaches budget limits
  if (txData.user && txData.endpoint && req?.app?.locals?.appConfig) {
    setImmediate(() => {
      checkBudgetAlerts({
        user: txData.user,
        endpoint: txData.endpoint,
        appConfig: req.app.locals.appConfig,
      }).catch((error) => {
        logger.error('[Balance.check] Error in budget alerts:', error);
      });
    });
  }

  if (canSpend) {
    return true;
  }

  const type = ViolationTypes.TOKEN_BALANCE;
  const errorMessage = {
    type,
    balance,
    tokenCost,
    promptTokens: txData.amount,
    balanceSource,
    resetInHours: getHoursUntilMidnight(),
  };

  if (txData.generations && txData.generations.length > 0) {
    errorMessage.generations = txData.generations;
  }

  await logViolation(req, res, type, errorMessage, 0);
  throw new Error(JSON.stringify(errorMessage));
};

module.exports = {
  checkBalance,
};
