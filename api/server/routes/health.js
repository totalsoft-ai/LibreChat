const express = require('express');
const { logger } = require('@librechat/data-schemas');

const { getUnavailableEndpoints } = require('~/server/services/EndpointHealth');
const requireJwtAuth = require('~/server/middleware/requireJwtAuth');
const router = express.Router();

/**
 * Returns the AI endpoints currently flagged as unavailable, so the client can
 * display a global banner naming the affected service(s).
 */
router.get('/endpoints', requireJwtAuth, async (req, res) => {
  try {
    const unavailable = await getUnavailableEndpoints();
    res.status(200).json({ unavailable });
  } catch (error) {
    logger.error('[/health/endpoints] Error getting endpoint health', error);
    res.status(500).json({ message: 'Error getting endpoint health' });
  }
});

module.exports = router;
