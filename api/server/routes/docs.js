const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Documentation files mapping
const DOCS_MAP = {
  'index': 'README.md',
  'getting-started': '01-getting-started.md',
  'conversations': '02-conversations.md',
  'models': '03-models.md',
  'agents': '04-agents.md',
  'files': '05-files.md',
  'export-share': '06-export-share.md',
  'prompts': '07-prompts.md',
  'workspace': '10-workspaces.md',
  'advanced': '08-advanced.md',
  'settings': '09-settings.md',
  'faq': '11-faq.md',
};

// Documentation metadata
const DOCS_METADATA = {
  'index': { title: 'TESSA User Guide', order: 0, keywords: 'welcome introduction overview tessa guide documentation help' },
  'getting-started': { title: 'Getting Started', order: 1, keywords: 'start begin setup initial first login account create register' },
  'conversations': { title: 'Conversations', order: 2, keywords: 'chat message talk conversation history search fork archive delete tag' },
  'models': { title: 'Models & Configuration', order: 3, keywords: 'model gpt claude openai anthropic configure settings parameters temperature' },
  'agents': { title: 'Agents Marketplace', order: 4, keywords: 'agent marketplace custom tool function action workflow automation' },
  'files': { title: 'File Management', order: 5, keywords: 'file upload download attach document image pdf excel word' },
  'export-share': { title: 'Export & Sharing', order: 6, keywords: 'export share download pdf json markdown html link public private' },
  'prompts': { title: 'Prompts Library', order: 7, keywords: 'prompt template library save reuse custom variable system message' },
  'workspace': { title: 'Workspace', order: 8, keywords: 'workspace team collaborate member invite share permission role' },
  'advanced': { title: 'Advanced Features', order: 9, keywords: 'advanced feature code interpreter sandbox mcp protocol plugin extension' },
  'settings': { title: 'Settings & Personalization', order: 10, keywords: 'settings preferences theme dark light language customize profile password' },
  'faq': { title: 'FAQ & Troubleshooting', order: 11, keywords: 'faq question answer help problem issue error troubleshoot fix solution' },
};

// Get docs directory path
const getDocsPath = () => {
  return path.join(__dirname, '..', '..', '..', 'docs', 'user-guide');
};

// Validate doc ID to prevent path traversal
const isValidDocId = (docId) => {
  return docId && DOCS_MAP.hasOwnProperty(docId);
};

/**
 * GET /api/docs
 * Get list of all available documentation sections
 */
router.get('/', async (req, res) => {
  try {
    const sections = Object.keys(DOCS_MAP).map((id) => ({
      id,
      title: DOCS_METADATA[id].title,
      order: DOCS_METADATA[id].order,
      filename: DOCS_MAP[id],
      keywords: DOCS_METADATA[id].keywords || '',
    }));

    // Sort by order
    sections.sort((a, b) => a.order - b.order);

    res.json({
      sections,
      default: 'index',
    });
  } catch (error) {
    console.error('Error listing docs:', error);
    res.status(500).json({ error: 'Failed to list documentation sections' });
  }
});

/**
 * GET /api/docs/:docId
 * Get specific documentation content
 */
router.get('/:docId', async (req, res) => {
  try {
    const { docId } = req.params;

    // Validate doc ID
    if (!isValidDocId(docId)) {
      return res.status(404).json({ error: 'Documentation not found' });
    }

    const filename = DOCS_MAP[docId];
    const filePath = path.join(getDocsPath(), filename);

    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');

    // Extract sections from markdown headers
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match markdown headers (## or ###)
      const headerMatch = line.match(/^(#{2,3})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2];
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        if (level === 2) {
          currentSection = { id, title, subsections: [] };
          sections.push(currentSection);
        } else if (level === 3 && currentSection) {
          currentSection.subsections.push({ id, title });
        }
      }
    }

    res.json({
      id: docId,
      title: DOCS_METADATA[docId].title,
      filename,
      content,
      sections,
    });
  } catch (error) {
    console.error('Error reading doc:', error);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Documentation file not found' });
    } else {
      res.status(500).json({ error: 'Failed to read documentation' });
    }
  }
});

module.exports = router;
