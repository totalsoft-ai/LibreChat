const rateLimit = require('express-rate-limit');
const { limiterCache } = require('@librechat/api');
const { ViolationTypes } = require('librechat-data-provider');
const { removePorts } = require('~/server/utils');
const { logViolation } = require('~/cache');

// Configuration: Allow 10 searches per minute per IP to prevent user enumeration and ReDoS attacks
const { USER_SEARCH_WINDOW = 1, USER_SEARCH_MAX = 10, USER_SEARCH_VIOLATION_SCORE: score } =
  process.env;
const windowMs = USER_SEARCH_WINDOW * 60 * 1000;
const max = USER_SEARCH_MAX;
const windowInMinutes = windowMs / 60000;
const message = `Too many search requests, please try again after ${windowInMinutes} minute(s).`;

const handler = async (req, res) => {
  const type = ViolationTypes.ILLEGAL_OPERATION;
  const errorMessage = {
    type,
    max,
    windowInMinutes,
    operation: 'user_search',
  };

  await logViolation(req, res, type, errorMessage, score);
  return res.status(429).json({ message });
};

const limiterOptions = {
  windowMs,
  max,
  handler,
  keyGenerator: removePorts,
  store: limiterCache('user_search_limiter'),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};

const userSearchLimiter = rateLimit(limiterOptions);

module.exports = userSearchLimiter;
