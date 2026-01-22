const rateLimit = require('express-rate-limit');
const { limiterCache } = require('@librechat/api');
const { ViolationTypes } = require('librechat-data-provider');
const { removePorts } = require('~/server/utils');
const { logViolation } = require('~/cache');

// Global rate limiter: Allow 1000 requests per 15 minutes per IP
// This is a baseline protection against DDoS and API abuse
const { GLOBAL_RATE_WINDOW = 15, GLOBAL_RATE_MAX = 1000, GLOBAL_RATE_VIOLATION_SCORE: score } =
  process.env;
const windowMs = GLOBAL_RATE_WINDOW * 60 * 1000;
const max = GLOBAL_RATE_MAX;
const windowInMinutes = windowMs / 60000;
const message = `Too many requests from this IP, please try again after ${windowInMinutes} minutes.`;

const handler = async (req, res) => {
  const type = ViolationTypes.ILLEGAL_OPERATION;
  const errorMessage = {
    type,
    max,
    windowInMinutes,
    operation: 'global_rate_limit',
  };

  await logViolation(req, res, type, errorMessage, score);
  return res.status(429).json({ message });
};

const limiterOptions = {
  windowMs,
  max,
  handler,
  keyGenerator: removePorts,
  store: limiterCache('global_limiter'),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip health check endpoint
  skip: (req) => req.path === '/health',
};

const globalLimiter = rateLimit(limiterOptions);

module.exports = globalLimiter;
