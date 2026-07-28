const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const { logger } = require('~/config');
const { getIngestedDocuments } = require('~/server/services/DocumentationService');

const router = express.Router();

router.use(requireJwtAuth);

/**
 * GET /api/documentation
 * Returns the list of Confluence/Coda documents ingested into the RAG vector store,
 * grouped by source category, with only title and link per document.
 */
router.get('/', async (req, res) => {
  try {
    const documents = await getIngestedDocuments();
    res.json(documents);
  } catch (error) {
    logger.error('[GET /api/documentation] Failed to fetch ingested documents', error);
    res.status(500).json({ error: 'Failed to fetch documentation list' });
  }
});

module.exports = router;
