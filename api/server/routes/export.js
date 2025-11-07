const express = require('express');
const { z } = require('zod');
const { logger } = require('@librechat/data-schemas');
const ExportService = require('~/server/services/ExportService');
const requireJwtAuth = require('~/server/middleware/requireJwtAuth');

const router = express.Router();

// Validation schema for export requests
const exportSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID format'),
  format: z.enum(['json', 'markdown', 'md', 'html', 'pdf']).default('json'),
});

/**
 * @route GET /api/export/:conversationId
 * @desc Export a conversation in the specified format
 * @access Private (requires authentication)
 * @query format - Export format: 'json', 'markdown', 'md', 'html', or 'pdf' (default: 'json')
 */
router.get('/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    // Validate request parameters
    const validated = exportSchema.parse({
      conversationId: req.params.conversationId,
      format: req.query.format || 'json',
    });

    const { conversationId, format } = validated;
    const userId = req.user.id;

    logger.info(
      `[Export] User ${userId} requesting export of conversation ${conversationId} in ${format} format`,
    );

    // Export the conversation
    const { data, filename, contentType } = await ExportService.exportConversation(
      userId,
      conversationId,
      format,
    );

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // For PDF, data is a Buffer
    if (format === 'pdf') {
      res.setHeader('Content-Length', data.length);
      return res.send(data);
    }

    // For text-based formats, data is a string
    res.send(data);
  } catch (error) {
    logger.error('[Export] Error exporting conversation:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
      });
    }

    // Handle not found errors
    if (error.message === 'Conversation not found') {
      return res.status(404).json({
        error: 'Conversation not found',
        details: 'The requested conversation does not exist or you do not have access to it',
      });
    }

    // Handle puppeteer/PDF errors
    if (error.message.includes('Puppeteer')) {
      return res.status(500).json({
        error: 'PDF generation not available',
        details: 'PDF export requires puppeteer to be installed. Please contact the administrator.',
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Export failed',
      details: error.message || 'An unexpected error occurred during export',
    });
  }
});

/**
 * @route GET /api/export/formats
 * @desc Get list of supported export formats
 * @access Private (requires authentication)
 */
router.get('/', requireJwtAuth, async (req, res) => {
  try {
    // Check if puppeteer is available
    let pdfAvailable = false;
    try {
      require.resolve('puppeteer');
      pdfAvailable = true;
    } catch (e) {
      pdfAvailable = false;
    }

    const formats = [
      {
        format: 'json',
        description: 'JSON format with full conversation data including metadata',
        contentType: 'application/json',
        available: true,
      },
      {
        format: 'markdown',
        description: 'Markdown format for easy reading and editing',
        contentType: 'text/markdown',
        available: true,
      },
      {
        format: 'html',
        description: 'HTML format with styled output',
        contentType: 'text/html',
        available: true,
      },
      {
        format: 'pdf',
        description: 'PDF format for printing and archiving',
        contentType: 'application/pdf',
        available: pdfAvailable,
      },
    ];

    res.json({
      formats,
      defaultFormat: 'json',
    });
  } catch (error) {
    logger.error('[Export] Error getting formats:', error);
    res.status(500).json({
      error: 'Failed to retrieve export formats',
    });
  }
});

module.exports = router;
