const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const { logger } = require('~/config');
const {
  getIngestedDocuments,
  getCodaDocumentsWithApiTitles,
} = require('~/server/services/DocumentationService');

const router = express.Router();

router.use(requireJwtAuth);

/**
 * GET /api/documentation
 * Returns the list of Confluence/Coda documents ingested into the RAG vector store,
 * grouped by source category, with only title and link per document. Coda titles use a
 * fast heuristic here so the page can render immediately.
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

/**
 * GET /api/documentation/coda-titles
 * Resolves real Coda page titles via the Coda API (slower, cached). Meant to be fetched in
 * the background after the initial page render, to upgrade the heuristic Coda titles.
 */
router.get('/coda-titles', async (req, res) => {
  try {
    const { coda } = await getCodaDocumentsWithApiTitles();
    res.json({ coda });
  } catch (error) {
    logger.error('[GET /api/documentation/coda-titles] Failed to resolve Coda titles', error);
    res.status(500).json({ error: 'Failed to resolve Coda titles' });
  }
});

module.exports = router;
