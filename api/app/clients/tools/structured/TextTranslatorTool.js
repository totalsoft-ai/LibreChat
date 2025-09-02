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
      'Translates text and documents between different languages using AI. ' +
      'Supports PDF, DOCX, DOC, TXT files and direct text. ' +
      'Automatically detects source language and provides professional translations.';

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
    try {
      const { action, text, target_language, file_data } = this.schema.parse(input);

      switch (action) {
        case 'translate_text':
          return await this._translateText(text, target_language);
        case 'translate_file':
          return await this._translateFile(file_data, target_language);
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    } catch (error) {
      console.error('[TextTranslatorTool] Error in _call:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  async _translateText(text, target_language = 'en') {
    console.log('[TextTranslatorTool] _translateText called with:', {
      text: typeof text,
      target_language: typeof target_language,
      textValue: text,
      targetValue: target_language
    });

    // Handle case where text might be an object
    let textString = text;
    if (typeof text === 'object' && text !== null) {
      textString = JSON.stringify(text);
    } else if (typeof text !== 'string') {
      textString = String(text);
    }

    // Handle case where target_language might be an object
    let targetString = target_language;
    if (typeof target_language === 'object' && target_language !== null) {
      targetString = JSON.stringify(target_language);
    } else if (typeof target_language !== 'string') {
      targetString = String(target_language);
    }

    if (!textString || !textString.trim()) {
      throw new Error('Provided text is empty or invalid');
    }

    if (!targetString || !targetString.trim()) {
      throw new Error('Target language must be specified');
    }

    console.log('[TextTranslatorTool] Processed values:', {
      textString: textString.substring(0, 100) + '...',
      targetString
    });



    // Try URLSearchParams first (simpler form data)
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('text', textString.trim());
    urlSearchParams.append('target_language', targetString.trim());

    console.log('[TextTranslatorTool] Sending URLSearchParams with text and target_language fields...');
    console.log('[TextTranslatorTool] URLSearchParams content:', urlSearchParams.toString());
    
    return await this._request('POST', '/translate', urlSearchParams, false);
  }

  async _translateFile(fileData, target_language = 'en') {
    if (!fileData || !fileData.name || !fileData.content) {
      throw new Error('File data is incomplete');
    }

    if (!target_language || !target_language.trim()) {
      throw new Error('Target language must be specified');
    }

    try {
      let fileContent;
      if (fileData.content.startsWith('data:')) {
        const parts = fileData.content.split(',');
        if (parts.length < 2) {
          throw new Error('Invalid data URL format');
        }
        fileContent = Buffer.from(parts[1], 'base64');
      } else {
        fileContent = Buffer.from(fileData.content, 'base64');
      }

      const fileExtension = fileData.name.split('.').pop().toLowerCase();
      const supportedExtensions = ['pdf', 'docx', 'doc', 'txt'];
      
      if (!supportedExtensions.includes(fileExtension)) {
        throw new Error('Unsupported file type. Supported: .pdf, .docx, .doc, .txt');
      }
      
      const isPdf = fileContent.slice(0, 4).toString('hex') === '25504446';
      const isDocx = fileContent.slice(0, 4).toString('hex') === '504b0304';
      const isDoc = fileContent.slice(0, 8).toString('hex') === 'd0cf11e0a1b11ae1';
      
      if (fileExtension === 'pdf' && !isPdf) {
        throw new Error('File does not appear to be a valid PDF');
      }
      if (fileExtension === 'docx' && !isDocx) {
        throw new Error('File does not appear to be a valid DOCX');
      }
      if (fileExtension === 'doc' && !isDoc) {
        throw new Error('File does not appear to be a valid DOC');
      }

      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', fileContent, fileData.name);
      formData.append('target_language', target_language);

      return await this._request('POST', '/translate/file', formData, false);
    } catch (error) {
      throw new Error(`Error processing file: ${error.message}`);
    }
  }

  async _request(method, path, body = null, isJson = true) {
    if (!this.baseUrl) {
      throw new Error('TEXT_TRANSLATOR_API_URL is not configured. Please set this environment variable.');
    }

    const options = { 
      method,
      headers: {}
    };
    
    if (body) {
      if (isJson) {
        options.headers['Content-Type'] = 'application/json';
        options.headers['Accept'] = 'application/json';
        options.body = JSON.stringify(body);
      } else {
        // For FormData or URLSearchParams, set the correct Content-Type
        if (body instanceof URLSearchParams) {
          options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          options.headers['Accept'] = 'application/json';
          options.body = body.toString();
        } else {
          // For FormData, don't set Content-Type - let it be set automatically with boundary
          options.headers['Accept'] = 'application/json';
          options.body = body;
        }
      }
    } else if (method !== 'GET') {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Accept'] = 'application/json';
    }

    try {
      console.log(`[TextTranslatorTool] Making ${method} request to ${this.baseUrl}${path}`);
      if (isJson && body) {
        console.log(`[TextTranslatorTool] Request body:`, JSON.stringify(body, null, 2));
      } else if (!isJson && body) {
        console.log(`[TextTranslatorTool] FormData request`);
      }
      
      const response = await fetch(`${this.baseUrl}${path}`, options);
      
      console.log(`[TextTranslatorTool] Response status: ${response.status}`);
      console.log(`[TextTranslatorTool] Response headers:`, Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = await response.text();
      }
      
      if (!response.ok) {
        console.log(`[TextTranslatorTool] Error response:`, result);
        let errorMessage;
        
        if (result && typeof result === 'object') {
          if (Array.isArray(result.detail)) {
            errorMessage = result.detail.map(d => d.msg || d.message || 'Unknown error').join(', ');
          } else {
            errorMessage = result.detail || result.message || result.error || 'Unknown error';
          }
        } else if (typeof result === 'string') {
          errorMessage = result;
        } else {
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      console.log(`[TextTranslatorTool] Success response:`, result);
      console.log(`[TextTranslatorTool] Response type:`, typeof result);
      console.log(`[TextTranslatorTool] Response keys:`, typeof result === 'object' ? Object.keys(result) : 'N/A');
      
      // Handle different response formats
      if (typeof result === 'object' && result.translated_text) {
        const formattedResult = {
          translated_text: result.translated_text,
          source_language: result.source_language || 'auto',
          target_language: result.target_language,
          status: 'success'
        };
        console.log(`[TextTranslatorTool] Formatted result:`, formattedResult);
        return JSON.stringify(formattedResult);
      } else if (typeof result === 'string') {
        const formattedResult = {
          translated_text: result,
          source_language: 'auto',
          target_language: 'unknown',
          status: 'success'
        };
        console.log(`[TextTranslatorTool] Formatted result:`, formattedResult);
        return JSON.stringify(formattedResult);
      } else {
        console.log(`[TextTranslatorTool] Raw result:`, result);
        return JSON.stringify(result);
      }
    } catch (error) {
      console.error(`[TextTranslatorTool] Request failed:`, error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to Text Translator service at ${this.baseUrl}. Please check if the URL is correct and the service is available.`);
      }
      throw error;
    }
  }
}

module.exports = TextTranslatorTool; 