const { Tool } = require('@langchain/core/tools');
const { z } = require('zod');
const { getEnvironmentVariable } = require('@langchain/core/utils/env');

class WebScrapingTool extends Tool {
  static lc_name() {
    return 'web_scraping';
  }

  constructor(fields = {}) {
    super(fields);
    this.name = 'web_scraping_tool';
    this.description =
      'Extract content from web pages and URLs. Can also upload content to Notion if requested. Supports various content types including PDFs, HTML pages, and dynamic content.';
    this.schema = z.object({
      url: z.string().describe('The URL to scrape content from'),
      upload_to_notion: z.boolean().optional().describe('Whether to upload the extracted content to Notion (default: false)'),
    });
  }

  async _call(input) {
    try {
      const { url, upload_to_notion = false } =
        typeof input === 'string' ? { url: input } : input;

      if (!url) {
        throw new Error('URL is required for web scraping');
      }

      // Validate URL format
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(url)) {
        throw new Error('Invalid URL format. URL must start with http:// or https://');
      }

      const apiUrl = getEnvironmentVariable('WEB_SCRAPING_API_URL');
      if (!apiUrl) {
        throw new Error('WEB_SCRAPING_API_URL is not configured. Please set this environment variable.');
      }

      // Validate API URL format
      if (!urlPattern.test(apiUrl)) {
        throw new Error('Invalid WEB_SCRAPING_API_URL format. URL must start with http:// or https://');
      }

      const requestBody = {
        message: upload_to_notion ? `${url} notion` : url,
      };

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

      try {
        const response = await fetch(`${apiUrl}/scrape`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Web scraping API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        if (!result.response) {
          throw new Error('No response received from web scraping service');
        }

        // Format the response
        let formattedResponse = result.response;

        // Add additional metadata if available
        if (result.content && result.content.length > 0) {
          const contentLength = result.content.length;
          const wordCount = result.content.split(/\s+/).length;

          formattedResponse += `\n\n📊 **Extraction Statistics:**\n`;
          formattedResponse += `• Characters extracted: ${contentLength.toLocaleString()}\n`;
          formattedResponse += `• Words extracted: ${wordCount.toLocaleString()}\n`;

          if (result.download_url) {
            formattedResponse += `• [Download full content](${result.download_url})\n`;
          }
        }

        // Add Notion integration status
        if (upload_to_notion) {
          if (result.notion_upload_result && result.notion_upload_result.success) {
            formattedResponse += `\n✅ **Notion Integration:** Content successfully uploaded to Notion\n`;
            if (result.notion_upload_result.page_link) {
              formattedResponse += `• [View in Notion](${result.notion_upload_result.page_link})\n`;
            }
          } else if (result.notion_upload_result && !result.notion_upload_result.success) {
            formattedResponse += `\n❌ **Notion Integration:** ${result.notion_upload_result.message}\n`;
          } else if (!result.notion_available) {
            formattedResponse += `\n⚠️ **Notion Integration:** Notion integration is not configured\n`;
          }
        }

        return formattedResponse;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Web scraping request timed out after 5 minutes');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Web scraping tool error:', error);
      throw new Error(`Web scraping failed: ${error.message}`);
    }
  }
}

module.exports = WebScrapingTool; 