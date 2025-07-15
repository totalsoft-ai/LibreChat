const { z } = require('zod');
const { Tool } = require('@langchain/core/tools');
const { getEnvironmentVariable } = require('@langchain/core/utils/env');

class TextTranslatorTool extends Tool {
  static lc_name() {
    return 'text_translator';
  }

  constructor(fields = {}) {
    super(fields);
    this.name = 'text_translator';
    this.baseUrl = getEnvironmentVariable('TEXT_TRANSLATOR_API_URL');
    
    this.description = 
      'Traduce text și documente între diferite limbi folosind AI. ' +
      'Suportă fișiere PDF, DOCX, DOC, TXT și text direct. ' +
      'Detectează automat limba sursă și oferă traduceri profesionale.';

    this.schema = z.object({
      action: z.enum(['translate_text', 'translate_file']),
      text: z.string().optional(),
      target_language: z.string().optional(),
      file_data: z.object({
        name: z.string(),
        content: z.string()
      }).optional()
    });
  }

  async _call(input) {
    const { action, text, target_language, file_data } = this.schema.parse(input);

    switch (action) {
      case 'translate_text':
        return await this._translateText(text, target_language);
      case 'translate_file':
        return await this._translateFile(file_data, target_language);
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  }

  async _translateText(text, target_language = 'en') {
    if (!text || !text.trim()) {
      throw new Error('Textul furnizat este gol sau invalid');
    }

    if (!target_language || !target_language.trim()) {
      throw new Error('Limba țintă trebuie specificată');
    }

    // Construim FormData pentru request
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('text', text);
    formData.append('target_language', target_language);

    return await this._request('POST', '/translate', formData, false);
  }

  async _translateFile(fileData, target_language = 'en') {
    if (!fileData || !fileData.name || !fileData.content) {
      throw new Error('Datele fișierului sunt incomplete');
    }

    if (!target_language || !target_language.trim()) {
      throw new Error('Limba țintă trebuie specificată');
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
      formData.append('target_language', target_language);

      return await this._request('POST', '/translate/file', formData, false);
    } catch (error) {
      throw new Error(`Eroare la procesarea fișierului: ${error.message}`);
    }
  }

  async _request(method, path, body = null, isJson = true) {
    if (!this.baseUrl) {
      throw new Error('TEXT_TRANSLATOR_API_URL nu este configurat');
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
        throw new Error(`Nu se poate conecta la serviciul Text Translator la ${this.baseUrl}`);
      }
      throw error;
    }
  }
}

module.exports = TextTranslatorTool; 