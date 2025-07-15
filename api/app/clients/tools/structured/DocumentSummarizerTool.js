const { z } = require('zod');
const { Tool } = require('@langchain/core/tools');
const { getEnvironmentVariable } = require('@langchain/core/utils/env');

class DocumentSummarizerTool extends Tool {
  static lc_name() {
    return 'document_summarizer';
  }

  constructor(fields = {}) {
    super(fields);
    this.name = 'document_summarizer';
    this.baseUrl = getEnvironmentVariable('DOCUMENT_SUMMARIZER_API_URL');
    
    this.description = 
      'Sumarizează documente și text folosind AI. ' +
      'Suportă fișiere PDF, DOCX, DOC, TXT și text direct. ' +
      'Generează sumare concise și profesionale.';

    this.schema = z.object({
      action: z.enum(['summarize_text', 'summarize_file']),
      text: z.string().optional(),
      file_data: z.object({
        name: z.string(),
        content: z.string()
      }).optional()
    });
  }

  async _call(input) {
    const { action, text, file_data } = this.schema.parse(input);

    switch (action) {
      case 'summarize_text':
        return await this._summarizeText(text);
      case 'summarize_file':
        return await this._summarizeFile(file_data);
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  }

  async _summarizeText(text) {
    if (!text || !text.trim()) {
      throw new Error('Textul furnizat este gol sau invalid');
    }

    // Construim FormData pentru request
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('text', text);

    return await this._request('POST', '/summarize/text', formData, false);
  }

  async _summarizeFile(fileData) {
    if (!fileData || !fileData.name || !fileData.content) {
      throw new Error('Datele fișierului sunt incomplete');
    }

    try {
      // Decodăm conținutul base64
      let fileContent;
      if (fileData.content.startsWith('data:')) {
        const [header, content] = fileData.content.split(',', 1);
        fileContent = Buffer.from(content, 'base64');
      } else {
        fileContent = Buffer.from(fileData.content, 'base64');
      }

      // Verifică extensia fișierului
      const fileExtension = fileData.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx', 'doc', 'txt'].includes(fileExtension)) {
        throw new Error('Tip de fișier nesuportat. Suportate: .pdf, .docx, .doc, .txt');
      }

      // Construim FormData pentru upload
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', fileContent, fileData.name);
      formData.append('return_format', 'text');

      return await this._request('POST', '/summarize/file', formData, false);
    } catch (error) {
      throw new Error(`Eroare la procesarea fișierului: ${error.message}`);
    }
  }

  async _request(method, path, body = null, isJson = true) {
    if (!this.baseUrl) {
      throw new Error('DOCUMENT_SUMMARIZER_API_URL nu este configurat');
    }

    const options = { method };
    
    if (body) {
      if (isJson) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(body);
      } else {
        // Pentru FormData, nu setăm Content-Type - browser-ul îl va seta automat cu boundary
        options.body = body;
      }
    } else if (method !== 'GET') {
      options.headers = { 'Content-Type': 'application/json' };
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
        throw new Error(`Nu se poate conecta la serviciul Document Summarizer la ${this.baseUrl}`);
      }
      throw error;
    }
  }
}

module.exports = DocumentSummarizerTool; 