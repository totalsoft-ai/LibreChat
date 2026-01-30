const { logger } = require('@librechat/data-schemas');
const { getMultiplier, getCacheMultiplier } = require('./tx');
const { Transaction, Balance } = require('~/db/models');
const { resetAlerts } = require('~/server/services/BudgetAlertService');

const cancelRate = 1.15;

/**
 * Generic retry wrapper with exponential backoff and optimistic locking
 * @param {Function} operation - The operation to retry
 * @param {string} operationName - Name for logging purposes
 * @returns {Promise<any>} The result of the operation
 */
const withRetry = async (operation, operationName) => {
  const maxRetries = 10;
  let delay = 50;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation(attempt);
      if (result) {
        return result;
      }
      lastError = new Error(`Operation returned null on attempt ${attempt}`);
    } catch (error) {
      lastError = error;
      logger.error(`[${operationName}] Error during attempt ${attempt}:`, error);
    }

    if (attempt < maxRetries) {
      const jitter = Math.random() * delay * 0.5;
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
      delay = Math.min(delay * 2, 2000);
    }
  }

  logger.error(`[${operationName}] Failed after ${maxRetries} attempts.`);
  throw lastError;
};

/**
 * Updates an endpoint-specific balance with optimistic concurrency control
 * @param {Object} params - The function parameters.
 * @param {string|mongoose.Types.ObjectId} params.user - The user ID.
 * @param {string} params.model - The endpoint name (kept as 'model' for backward compatibility).
 * @param {number} params.incrementValue - The value to increment the balance by (can be negative).
 * @param {Object} [params.setValues] - Optional additional fields to set on the endpoint limit.
 * @returns {Promise<Object>} Returns the updated balance document (lean).
 */
const updateModelBalance = ({ user, model, incrementValue, setValues }) =>
  withRetry(async () => {
    const currentBalanceDoc = await Balance.findOne({ user }).lean();

    if (!currentBalanceDoc) {
      throw new Error(`No balance record found for user ${user}`);
    }

    const endpointLimits = currentBalanceDoc.endpointLimits || [];
    const endpointLimitIndex = endpointLimits.findIndex((el) => el.endpoint === model);

    if (endpointLimitIndex === -1) {
      throw new Error(`No endpoint limit configured for endpoint ${model}`);
    }

    const currentEndpointCredits = endpointLimits[endpointLimitIndex].tokenCredits;
    const newCredits = Math.max(0, currentEndpointCredits + incrementValue);

    const updatePayload = {
      $set: {
        [`endpointLimits.${endpointLimitIndex}.tokenCredits`]: newCredits,
        [`endpointLimits.${endpointLimitIndex}.lastUsed`]: new Date(),
        ...(setValues &&
          Object.fromEntries(
            Object.entries(setValues).map(([k, v]) => [`endpointLimits.${endpointLimitIndex}.${k}`, v]),
          )),
      },
    };

    return await Balance.findOneAndUpdate(
      {
        user,
        [`endpointLimits.${endpointLimitIndex}.tokenCredits`]: currentEndpointCredits,
      },
      updatePayload,
      { new: true },
    ).lean();
  }, `updateEndpointBalance:${user}:${model}`);

/**
 * Updates a user's token balance with optimistic concurrency control
 * @param {Object} params - The function parameters.
 * @param {string|mongoose.Types.ObjectId} params.user - The user ID.
 * @param {number} params.incrementValue - The value to increment the balance by (can be negative).
 * @param {import('mongoose').UpdateQuery<import('@librechat/data-schemas').IBalance>['$set']} [params.setValues] - Optional additional fields to set.
 * @returns {Promise<Object>} Returns the updated balance document (lean).
 */
const updateBalance = ({ user, incrementValue, setValues }) =>
  withRetry(async () => {
    const currentBalanceDoc = await Balance.findOne({ user }).lean();
    const currentCredits = currentBalanceDoc ? currentBalanceDoc.tokenCredits : 0;
    const newCredits = Math.max(0, currentCredits + incrementValue);

    const updatePayload = {
      $set: {
        tokenCredits: newCredits,
        ...(setValues || {}),
      },
    };

    if (currentBalanceDoc) {
      return await Balance.findOneAndUpdate({ user, tokenCredits: currentCredits }, updatePayload, {
        new: true,
      }).lean();
    }

    try {
      return await Balance.findOneAndUpdate({ user }, updatePayload, {
        upsert: true,
        new: true,
      }).lean();
    } catch (error) {
      if (error.code === 11000) {
        return null; // Retry on duplicate key error
      }
      throw error;
    }
  }, `updateBalance:${user}`);

/** Method to calculate and set the tokenValue for a transaction */
function calculateTokenValue(txn) {
  if (!txn.valueKey || !txn.tokenType) {
    txn.tokenValue = txn.rawAmount;
  }
  const { valueKey, tokenType, model, endpointTokenConfig } = txn;
  const multiplier = Math.abs(getMultiplier({ valueKey, tokenType, model, endpointTokenConfig }));
  txn.rate = multiplier;
  txn.tokenValue = txn.rawAmount * multiplier;
  if (txn.context && txn.tokenType === 'completion' && txn.context === 'incomplete') {
    txn.tokenValue = Math.ceil(txn.tokenValue * cancelRate);
    txn.rate *= cancelRate;
  }
}

/**
 * Generic auto-refill transaction creator
 * @param {object} txData - Transaction data.
 * @param {string} [txData.model] - The model name (optional, for model-specific refills).
 * @returns {Promise<object>} - The created transaction with balance info.
 */
async function createAutoRefillTransaction(txData) {
  if (txData.rawAmount != null && isNaN(txData.rawAmount)) {
    return;
  }

  const isModelSpecific = txData.model && txData.model !== 'global';
  const transaction = new Transaction({
    ...txData,
    balanceSource: isModelSpecific ? txData.model : 'global',
  });
  transaction.endpointTokenConfig = txData.endpointTokenConfig;
  calculateTokenValue(transaction);
  await transaction.save();

  const balanceResponse = isModelSpecific
    ? await updateModelBalance({
        user: transaction.user,
        model: txData.model,
        incrementValue: txData.rawAmount,
        setValues: { lastRefill: new Date() },
      })
    : await updateBalance({
        user: transaction.user,
        incrementValue: txData.rawAmount,
        setValues: { lastRefill: new Date() },
      });

  const balance = isModelSpecific
    ? balanceResponse.endpointLimits.find((el) => el.endpoint === txData.model)?.tokenCredits || 0
    : balanceResponse.tokenCredits;

  const result = {
    rate: transaction.rate,
    user: transaction.user.toString(),
    balance,
    transaction,
  };

  logger.debug(
    `[Balance.check] ${isModelSpecific ? 'Model' : 'Global'} auto-refill performed`,
    result,
  );

  // Reset budget alerts after refill (run asynchronously)
  setImmediate(() => {
    resetAlerts({
      user: transaction.user.toString(),
      model: isModelSpecific ? txData.model : null,
    }).catch((error) => {
      logger.error('[Transaction] Error resetting alerts after refill:', error);
    });
  });

  return result;
}

// Alias for backward compatibility
const createModelAutoRefillTransaction = createAutoRefillTransaction;

/**
 * Helper function to deduct balance from the appropriate source
 * @param {Object} params - Parameters
 * @param {string} params.user - User ID
 * @param {string} params.balanceSource - Balance source (model name or 'global')
 * @param {number} params.incrementValue - Amount to increment/decrement
 * @returns {Promise<number>} The resulting balance
 */
async function deductBalance({ user, balanceSource, incrementValue }) {
  if (!balanceSource || balanceSource === 'global') {
    const response = await updateBalance({ user, incrementValue });
    return response.tokenCredits;
  }

  const response = await updateModelBalance({
    user,
    model: balanceSource,
    incrementValue,
  });
  return response.endpointLimits.find((el) => el.endpoint === balanceSource)?.tokenCredits || 0;
}

/**
 * Generic transaction creator with balance deduction
 * @param {txData} _txData - Transaction data.
 * @param {Function} calculateFn - Function to calculate token value (calculateTokenValue or calculateStructuredTokenValue)
 */
async function createTransactionWithBalance(_txData, calculateFn) {
  const { balance, transactions, balanceSource, ...txData } = _txData;

  if (transactions?.enabled === false || (txData.rawAmount != null && isNaN(txData.rawAmount))) {
    return;
  }

  const transaction = new Transaction({
    ...txData,
    endpointTokenConfig: txData.endpointTokenConfig,
    balanceSource: balanceSource || 'global',
  });

  calculateFn(transaction);
  await transaction.save();

  if (!balance?.enabled) {
    return;
  }

  const resultBalance = await deductBalance({
    user: transaction.user,
    balanceSource: balanceSource || 'global',
    incrementValue: transaction.tokenValue,
  });

  return {
    rate: transaction.rate,
    user: transaction.user.toString(),
    balance: resultBalance,
    balanceSource: balanceSource || 'global',
    [transaction.tokenType]: transaction.tokenValue,
  };
}

/**
 * Static method to create a transaction and update the balance
 * @param {txData} _txData - Transaction data.
 */
const createTransaction = (_txData) => createTransactionWithBalance(_txData, calculateTokenValue);

/**
 * Static method to create a structured transaction and update the balance
 * @param {txData} _txData - Transaction data.
 */
const createStructuredTransaction = (_txData) =>
  createTransactionWithBalance(_txData, calculateStructuredTokenValue);

/** Method to calculate token value for structured tokens */
function calculateStructuredTokenValue(txn) {
  if (!txn.tokenType) {
    txn.tokenValue = txn.rawAmount;
    return;
  }

  const { model, endpointTokenConfig } = txn;

  if (txn.tokenType === 'prompt') {
    const inputMultiplier = getMultiplier({ tokenType: 'prompt', model, endpointTokenConfig });
    const writeMultiplier =
      getCacheMultiplier({ cacheType: 'write', model, endpointTokenConfig }) ?? inputMultiplier;
    const readMultiplier =
      getCacheMultiplier({ cacheType: 'read', model, endpointTokenConfig }) ?? inputMultiplier;

    txn.rateDetail = {
      input: inputMultiplier,
      write: writeMultiplier,
      read: readMultiplier,
    };

    const totalPromptTokens =
      Math.abs(txn.inputTokens || 0) +
      Math.abs(txn.writeTokens || 0) +
      Math.abs(txn.readTokens || 0);

    if (totalPromptTokens > 0) {
      txn.rate =
        (Math.abs(inputMultiplier * (txn.inputTokens || 0)) +
          Math.abs(writeMultiplier * (txn.writeTokens || 0)) +
          Math.abs(readMultiplier * (txn.readTokens || 0))) /
        totalPromptTokens;
    } else {
      txn.rate = Math.abs(inputMultiplier); // Default to input rate if no tokens
    }

    txn.tokenValue = -(
      Math.abs(txn.inputTokens || 0) * inputMultiplier +
      Math.abs(txn.writeTokens || 0) * writeMultiplier +
      Math.abs(txn.readTokens || 0) * readMultiplier
    );

    txn.rawAmount = -totalPromptTokens;
  } else if (txn.tokenType === 'completion') {
    const multiplier = getMultiplier({ tokenType: txn.tokenType, model, endpointTokenConfig });
    txn.rate = Math.abs(multiplier);
    txn.tokenValue = -Math.abs(txn.rawAmount) * multiplier;
    txn.rawAmount = -Math.abs(txn.rawAmount);
  }

  if (txn.context && txn.tokenType === 'completion' && txn.context === 'incomplete') {
    txn.tokenValue = Math.ceil(txn.tokenValue * cancelRate);
    txn.rate *= cancelRate;
    if (txn.rateDetail) {
      txn.rateDetail = Object.fromEntries(
        Object.entries(txn.rateDetail).map(([k, v]) => [k, v * cancelRate]),
      );
    }
  }
}

/**
 * Queries and retrieves transactions based on a given filter.
 * @async
 * @function getTransactions
 * @param {Object} filter - MongoDB filter object to apply when querying transactions.
 * @returns {Promise<Array>} A promise that resolves to an array of matched transactions.
 * @throws {Error} Throws an error if querying the database fails.
 */
async function getTransactions(filter) {
  try {
    return await Transaction.find(filter).lean();
  } catch (error) {
    logger.error('Error querying transactions:', error);
    throw error;
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  createAutoRefillTransaction,
  createModelAutoRefillTransaction,
  createStructuredTransaction,
  updateModelBalance,
};
