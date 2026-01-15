const express = require('express');
const { logger } = require('@librechat/data-schemas');
const {
  updateEmbeddingStatus,
  batchUpdateEmbeddingStatus,
} = require('~/server/services/Files/VectorDB/status');

const router = express.Router();

/**
 * Webhook endpoint for RAG API to notify when embedding is complete
 * POST /api/files/webhooks/embedding
 *
 * Request body:
 * {
 *   "file_id": "file-abc123",
 *   "embedded": true,
 *   "error": "optional error message"
 * }
 *
 * Or batch:
 * {
 *   "files": [
 *     { "file_id": "file-abc123", "embedded": true },
 *     { "file_id": "file-xyz789", "embedded": false, "error": "Failed to process" }
 *   ]
 * }
 */
router.post('/embedding', async (req, res) => {
  try {
    const { file_id, embedded, error, files } = req.body;

    // Validate request
    if (!file_id && !files) {
      return res.status(400).json({
        error: 'Either file_id or files array is required',
      });
    }

    // Batch update
    if (files && Array.isArray(files)) {
      logger.info(`[webhook:embedding] Received batch update for ${files.length} files`);

      const results = await batchUpdateEmbeddingStatus(files);

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      return res.status(200).json({
        success: true,
        message: `Batch update complete: ${successful} successful, ${failed} failed`,
        results: results.map((r) => ({
          status: r.status,
          value: r.status === 'fulfilled' ? r.value?.file_id : undefined,
          error: r.status === 'rejected' ? r.reason?.message : undefined,
        })),
      });
    }

    // Single file update
    logger.info(`[webhook:embedding] Received update for file ${file_id}: embedded=${embedded}`);

    const updatedFile = await updateEmbeddingStatus({
      file_id,
      embedded: !!embedded,
      error,
    });

    return res.status(200).json({
      success: true,
      message: 'Embedding status updated successfully',
      file_id: updatedFile.file_id,
      embedded: updatedFile.embedded,
    });
  } catch (error) {
    logger.error('[webhook:embedding] Error processing webhook:', error);

    // Don't expose internal errors to external services
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing webhook',
    });
  }
});

/**
 * Health check endpoint for webhook
 * GET /api/files/webhooks/health
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'file-embedding-webhook',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
