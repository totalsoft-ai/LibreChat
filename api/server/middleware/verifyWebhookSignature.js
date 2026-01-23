const crypto = require('crypto');
const { logger } = require('@librechat/data-schemas');

/**
 * Middleware to verify webhook signatures using HMAC-SHA256.
 * Protects against unauthorized webhook calls and tampering.
 *
 * Expected header: x-webhook-signature
 * Expected env var: WEBHOOK_SECRET
 *
 * The signature is computed as: HMAC-SHA256(webhook_secret, request_body)
 *
 * Usage:
 * router.post('/webhook', verifyWebhookSignature, handlerFunction);
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  const webhookSecret = process.env.WEBHOOK_SECRET;

  // If webhook secret is not configured, log warning and allow request
  // This maintains backward compatibility but logs a security warning
  if (!webhookSecret) {
    logger.warn(
      '[verifyWebhookSignature] WEBHOOK_SECRET not configured. Webhook signature verification is disabled. ' +
        'This is a security risk. Please set WEBHOOK_SECRET environment variable.',
    );
    return next();
  }

  // If secret is configured, signature is required
  if (!signature) {
    logger.warn('[verifyWebhookSignature] Missing webhook signature header');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing webhook signature',
    });
  }

  try {
    // Compute expected signature
    // Use raw body for signature verification
    const requestBody =
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(requestBody)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

    if (!isValid) {
      logger.warn('[verifyWebhookSignature] Invalid webhook signature', {
        receivedSignature: signature.substring(0, 10) + '...',
        expectedSignature: expectedSignature.substring(0, 10) + '...',
      });
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Invalid webhook signature',
      });
    }

    // Signature is valid, proceed to webhook handler
    logger.debug('[verifyWebhookSignature] Webhook signature verified successfully');
    next();
  } catch (error) {
    logger.error('[verifyWebhookSignature] Error verifying webhook signature:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error verifying webhook',
    });
  }
};

/**
 * Optional: Middleware to log webhook requests for debugging
 * Use only in development or for debugging purposes
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const logWebhookRequest = (req, res, next) => {
  logger.info('[webhook] Received webhook request', {
    method: req.method,
    path: req.path,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'x-webhook-signature': req.headers['x-webhook-signature'] ? 'present' : 'missing',
    },
    bodySize: JSON.stringify(req.body || {}).length,
  });
  next();
};

module.exports = {
  verifyWebhookSignature,
  logWebhookRequest,
};
