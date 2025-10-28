const { logger } = require('@librechat/data-schemas');
const { getConvo } = require('~/models/Conversation');
const { getMessages } = require('~/models/Message');

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date) {
    return 'Unknown';
  }
  try {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return String(date);
  }
}

/**
 * Export Service
 * Handles conversation exports in multiple formats (JSON, Markdown, PDF)
 */
class ExportService {
  /**
   * Fetches conversation data with all messages
   * @param {string} userId - The user's ID
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<{conversation: TConversation, messages: TMessage[]}>}
   */
  async getConversationData(userId, conversationId) {
    try {
      const conversation = await getConvo(userId, conversationId);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const messages = await getMessages(
        {
          conversationId,
          user: userId,
        },
        null, // select all fields
      );

      return { conversation, messages };
    } catch (error) {
      logger.error('[ExportService] Error fetching conversation data:', error);
      throw error;
    }
  }

  /**
   * Exports conversation to JSON format
   * @param {string} userId - The user's ID
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<{data: Object, filename: string, contentType: string}>}
   */
  async exportToJSON(userId, conversationId) {
    try {
      const { conversation, messages } = await this.getConversationData(userId, conversationId);

      const exportData = {
        conversation: {
          id: conversation.conversationId,
          title: conversation.title || 'Untitled Conversation',
          model: conversation.model,
          endpoint: conversation.endpoint,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
        messages: messages.map((msg) => ({
          id: msg.messageId,
          role: msg.isCreatedByUser ? 'user' : 'assistant',
          content: msg.text,
          model: msg.model,
          timestamp: msg.createdAt,
          parentMessageId: msg.parentMessageId,
          tokenCount: msg.tokenCount,
          feedback: msg.feedback,
        })),
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };

      const filename = `conversation_${conversationId}_${Date.now()}.json`;

      return {
        data: JSON.stringify(exportData, null, 2),
        filename,
        contentType: 'application/json',
      };
    } catch (error) {
      logger.error('[ExportService] Error exporting to JSON:', error);
      throw error;
    }
  }

  /**
   * Exports conversation to Markdown format
   * @param {string} userId - The user's ID
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<{data: string, filename: string, contentType: string}>}
   */
  async exportToMarkdown(userId, conversationId) {
    try {
      const { conversation, messages } = await this.getConversationData(userId, conversationId);

      let markdown = `# ${conversation.title || 'Untitled Conversation'}\n\n`;
      markdown += `**Model:** ${conversation.model || 'Unknown'}  \n`;
      markdown += `**Created:** ${formatDate(conversation.createdAt)}  \n`;
      markdown += `**Updated:** ${formatDate(conversation.updatedAt)}  \n\n`;
      markdown += `---\n\n`;

      // Sort messages by creation time
      const sortedMessages = messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );

      for (const msg of sortedMessages) {
        const role = msg.isCreatedByUser ? '**User**' : '**Assistant**';
        const timestamp = formatDate(msg.createdAt);

        markdown += `### ${role} - ${timestamp}\n\n`;
        markdown += `${msg.text || '*[No content]*'}\n\n`;

        if (msg.feedback) {
          const feedbackEmoji = msg.feedback.rating === 'thumbsUp' ? '👍' : '👎';
          markdown += `*Feedback: ${feedbackEmoji}`;
          if (msg.feedback.tag) {
            markdown += ` (${msg.feedback.tag})`;
          }
          markdown += '*\n\n';
        }

        markdown += `---\n\n`;
      }

      markdown += `\n*Exported on ${formatDate(new Date())}*\n`;

      const filename = `conversation_${conversationId}_${Date.now()}.md`;

      return {
        data: markdown,
        filename,
        contentType: 'text/markdown',
      };
    } catch (error) {
      logger.error('[ExportService] Error exporting to Markdown:', error);
      throw error;
    }
  }

  /**
   * Exports conversation to HTML format (used as intermediate for PDF)
   * @param {string} userId - The user's ID
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<{data: string, filename: string, contentType: string}>}
   */
  async exportToHTML(userId, conversationId) {
    try {
      const { conversation, messages } = await this.getConversationData(userId, conversationId);

      const sortedMessages = messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );

      let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(conversation.title || 'Conversation Export')}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header h1 {
      margin: 0 0 10px 0;
      color: #333;
    }
    .metadata {
      color: #666;
      font-size: 14px;
    }
    .message {
      background: white;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .message-role {
      font-weight: bold;
      color: #444;
    }
    .message-role.user {
      color: #2563eb;
    }
    .message-role.assistant {
      color: #059669;
    }
    .message-timestamp {
      color: #999;
      font-size: 13px;
    }
    .message-content {
      color: #333;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .message-feedback {
      margin-top: 10px;
      padding: 8px 12px;
      background: #f9f9f9;
      border-radius: 4px;
      font-size: 13px;
      color: #666;
    }
    .footer {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHTML(conversation.title || 'Untitled Conversation')}</h1>
    <div class="metadata">
      <p><strong>Model:</strong> ${escapeHTML(conversation.model || 'Unknown')}</p>
      <p><strong>Created:</strong> ${escapeHTML(formatDate(conversation.createdAt))}</p>
      <p><strong>Last Updated:</strong> ${escapeHTML(formatDate(conversation.updatedAt))}</p>
    </div>
  </div>
`;

      for (const msg of sortedMessages) {
        const role = msg.isCreatedByUser ? 'user' : 'assistant';
        const roleLabel = msg.isCreatedByUser ? 'User' : 'Assistant';
        const content = msg.text || '[No content]';

        html += `
  <div class="message">
    <div class="message-header">
      <span class="message-role ${role}">${escapeHTML(roleLabel)}</span>
      <span class="message-timestamp">${escapeHTML(formatDate(msg.createdAt))}</span>
    </div>
    <div class="message-content">${escapeHTML(content)}</div>
`;

        if (msg.feedback) {
          const feedbackEmoji = msg.feedback.rating === 'thumbsUp' ? '👍' : '👎';
          let feedbackText = `Feedback: ${feedbackEmoji}`;
          if (msg.feedback.tag) {
            feedbackText += ` (${msg.feedback.tag})`;
          }
          html += `    <div class="message-feedback">${escapeHTML(feedbackText)}</div>\n`;
        }

        html += `  </div>\n`;
      }

      html += `
  <div class="footer">
    <p>Exported from LibreChat on ${escapeHTML(formatDate(new Date()))}</p>
  </div>
</body>
</html>
`;

      const filename = `conversation_${conversationId}_${Date.now()}.html`;

      return {
        data: html,
        filename,
        contentType: 'text/html',
      };
    } catch (error) {
      logger.error('[ExportService] Error exporting to HTML:', error);
      throw error;
    }
  }

  /**
   * Exports conversation to PDF format using puppeteer
   * @param {string} userId - The user's ID
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<{data: Buffer, filename: string, contentType: string}>}
   */
  async exportToPDF(userId, conversationId) {
    try {
      // First generate HTML
      const { data: htmlContent } = await this.exportToHTML(userId, conversationId);

      // Check if puppeteer is available
      let puppeteer;
      try {
        puppeteer = require('puppeteer');
      } catch (err) {
        throw new Error(
          'Puppeteer is not installed. Please install it with: npm install puppeteer',
        );
      }

      // Launch browser and generate PDF
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm',
          },
        });

        await browser.close();

        const filename = `conversation_${conversationId}_${Date.now()}.pdf`;

        return {
          data: pdfBuffer,
          filename,
          contentType: 'application/pdf',
        };
      } catch (error) {
        await browser.close();
        throw error;
      }
    } catch (error) {
      logger.error('[ExportService] Error exporting to PDF:', error);
      throw error;
    }
  }

  /**
   * Main export method that routes to appropriate format handler
   * @param {string} userId - The user's ID
   * @param {string} conversationId - The conversation ID
   * @param {string} format - The export format ('json', 'markdown', 'html', 'pdf')
   * @returns {Promise<{data: Buffer|string, filename: string, contentType: string}>}
   */
  async exportConversation(userId, conversationId, format = 'json') {
    const formatLower = format.toLowerCase();

    switch (formatLower) {
      case 'json':
        return await this.exportToJSON(userId, conversationId);
      case 'markdown':
      case 'md':
        return await this.exportToMarkdown(userId, conversationId);
      case 'html':
        return await this.exportToHTML(userId, conversationId);
      case 'pdf':
        return await this.exportToPDF(userId, conversationId);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHTML(text) {
  if (!text) {
    return '';
  }
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = new ExportService();
