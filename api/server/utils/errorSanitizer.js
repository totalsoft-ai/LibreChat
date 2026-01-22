const { logger } = require('@librechat/data-schemas');

/**
 * Sanitizes error information for client responses to prevent information disclosure.
 * In production, detailed error information is hidden from the client but logged server-side.
 *
 * @param {Error} error - The error object to sanitize
 * @param {Object} options - Configuration options
 * @param {boolean} [options.includeDetails=false] - Whether to include detailed error information
 * @param {string} [options.requestId] - Optional request ID for error correlation
 * @param {string} [options.fallbackMessage='An error occurred'] - Default error message
 * @returns {Object} Sanitized error response object
 */
const sanitizeError = (error, options = {}) => {
  const {
    includeDetails = false,
    requestId = null,
    fallbackMessage = 'An error occurred',
  } = options;

  // Always log the full error server-side
  logger.error('[sanitizeError]', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    requestId,
  });

  // In production, hide detailed errors unless explicitly requested
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !includeDetails) {
    return {
      error: fallbackMessage,
      ...(requestId && { requestId }),
    };
  }

  // In development or when details are explicitly requested, return more information
  return {
    error: fallbackMessage,
    details: error.message,
    ...(error.name && { type: error.name }),
    ...(requestId && { requestId }),
    ...(!isProduction && { stack: error.stack }),
  };
};

/**
 * Creates an Express error handling middleware using the error sanitizer.
 *
 * @param {Object} options - Configuration options for the sanitizer
 * @returns {Function} Express middleware function
 */
const createErrorSanitizerMiddleware = (options = {}) => {
  return (err, req, res, next) => {
    // Generate or use existing request ID
    const requestId = req.id || req.headers['x-request-id'] || null;

    const sanitizedError = sanitizeError(err, {
      ...options,
      requestId,
    });

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json(sanitizedError);
  };
};

/**
 * Sanitizes database errors to prevent exposure of database structure.
 *
 * @param {Error} error - Database error object
 * @param {string} [requestId] - Optional request ID
 * @returns {Object} Sanitized error response
 */
const sanitizeDatabaseError = (error, requestId = null) => {
  // Common database error patterns to sanitize
  const dbErrorPatterns = [
    /duplicate key/i,
    /foreign key constraint/i,
    /violates .* constraint/i,
    /invalid input syntax/i,
  ];

  const isDatabaseError = dbErrorPatterns.some((pattern) => pattern.test(error.message));

  if (isDatabaseError && process.env.NODE_ENV === 'production') {
    return {
      error: 'A database error occurred. Please try again or contact support.',
      requestId,
    };
  }

  return sanitizeError(error, { requestId, fallbackMessage: 'A database error occurred' });
};

/**
 * Sanitizes validation errors, allowing some safe information to pass through.
 *
 * @param {Error} error - Validation error object
 * @param {string} [requestId] - Optional request ID
 * @returns {Object} Sanitized error response
 */
const sanitizeValidationError = (error, requestId = null) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Validation errors can usually be shown to users as they don't expose system internals
  return {
    error: 'Validation error',
    ...(error.message && { details: error.message }),
    ...(error.errors && { fields: error.errors }), // For mongoose validation errors
    ...(requestId && { requestId }),
    ...(!isProduction && { stack: error.stack }),
  };
};

module.exports = {
  sanitizeError,
  createErrorSanitizerMiddleware,
  sanitizeDatabaseError,
  sanitizeValidationError,
};
