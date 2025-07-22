const { z } = require('zod');
const { Tool } = require('@langchain/core/tools');
const { getEnvironmentVariable } = require('@langchain/core/utils/env');

class CodeReviewTool extends Tool {
  static lc_name() {
    return 'code_review';
  }

  constructor(fields = {}) {
    super(fields);
    this.name = 'code_review';
    this.baseUrl = getEnvironmentVariable('CODE_REVIEW_API_URL');

    this.description =
      'Analizează și review-ează codul folosind un agent AI specializat. ' +
      'Oferă feedback, sugestii de îmbunătățire și un scor de calitate. ' +
      'Suportă analiza codului din mesaje text sau fișiere încărcate.';

    this.schema = z.object({
      action: z.enum(['review_code', 'review_file']),
      code: z.string().optional(),
      filename: z.string().optional(),
      language: z.string().optional(),
      file_data: z.object({
        name: z.string(),
        content: z.string(),
      }).optional(),
    });
  }

  async _call(input) {
    const { action, code, filename, language, file_data } = this.schema.parse(input);

    switch (action) {
      case 'review_code':
        return await this._reviewCode(code, filename, language);
      case 'review_file':
        return await this._reviewFile(file_data);
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  }

  async _reviewCode(code, filename = 'code_snippet.txt', language = '') {
    if (!code || !code.trim()) {
      throw new Error('Codul furnizat este gol sau invalid');
    }

    // Construim mesajul pentru API
    let message = `Analizează codul din fișierul ${filename}`;
    if (language) {
      message += ` (${language})`;
    }
    message += `:\n\n${code}`;

    return await this._request('POST', '/codereview', { message });
  }

  async _reviewFile(fileData) {
    if (!fileData || !fileData.name || !fileData.content) {
      throw new Error('Datele fișierului sunt incomplete');
    }

    try {
      // Decodăm conținutul base64 dacă este necesar
      let fileContent;
      if (fileData.content.startsWith('data:')) {
        const [header, content] = fileData.content.split(',', 1);
        fileContent = Buffer.from(content, 'base64').toString('utf-8');
      } else {
        fileContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
      }

      return await this._reviewCode(fileContent, fileData.name);
    } catch (error) {
      throw new Error(`Eroare la procesarea fișierului: ${error.message}`);
    }
  }

  async _request(method, path, body = null) {
    if (!this.baseUrl) {
      throw new Error('CODE_REVIEW_API_URL nu este configurat');
    }

    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || response.statusText || `HTTP ${response.status}`);
      }

      return JSON.stringify(result);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Nu se poate conecta la serviciul de Code Review la ${this.baseUrl}`);
      }
      throw error;
    }
  }
}

module.exports = CodeReviewTool; 