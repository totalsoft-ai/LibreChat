const { z } = require('zod');
const { Tool } = require('@langchain/core/tools');
const { getEnvironmentVariable } = require('@langchain/core/utils/env');
const FormData = require('form-data');
const fs = require('fs');

class DocumentLoaderTool extends Tool {
  static lc_name() {
    return 'document_loader';
  }

  constructor(fields = {}) {
    super(fields);
    this.name = 'document_loader';
    this.baseUrl = getEnvironmentVariable('DOCUMENT_LOADER_BASE_URL');
    
    this.description = 
      'Upload and process documents (PDF, DOCX, Excel) with automatic personal data detection. ' +
      'Also supports Notion and Confluence imports. Documents are organized in namespaces.';

    this.schema = z.object({
      action: z.enum(['upload_files', 'upload_notion', 'upload_confluence', 'list_namespaces', 'create_namespace']),
      namespace: z.string().min(3).max(32).optional(),
      files: z.array(z.string()).optional(),
      url: z.string().url().optional(),
      new_namespace: z.string().min(3).max(32).optional()
    });
  }

  async _call(input) {
    const { action, namespace, files, url, new_namespace } = this.schema.parse(input);

    switch (action) {
      case 'upload_files':
        return await this._uploadFiles(files, namespace);
      case 'upload_notion':
        return await this._uploadPage(url, namespace, '/upload/notion/', 'notion.so');
      case 'upload_confluence':
        return await this._uploadPage(url, namespace, '/upload/confluence/', 'wiki.logo.com.tr');
      case 'list_namespaces':
        return await this._request('GET', '/namespaces');
      case 'create_namespace':
        return await this._request('POST', '/namespaces/create', { namespace: new_namespace });
    }
  }

  async _uploadFiles(filePaths, namespace) {
    if (!namespace || !filePaths?.length) {
      throw new Error('Namespace and files are required');
    }

    this._validateNamespace(namespace);

    const formData = new FormData();
    formData.append('namespace', namespace);

    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
      
      const ext = filePath.split('.').pop().toLowerCase();
      if (!['pdf', 'docx', 'xlsx', 'xls'].includes(ext)) {
        throw new Error(`Unsupported file type: ${ext}`);
      }

      formData.append('files', fs.createReadStream(filePath), filePath.split('/').pop());
    }

    return await this._request('POST', '/upload/files/', formData, false);
  }

  async _uploadPage(pageUrl, namespace, endpoint, requiredDomain) {
    if (!namespace || !pageUrl) {
      throw new Error('Namespace and URL are required');
    }
    
    this._validateNamespace(namespace);
    
    if (!pageUrl.includes(requiredDomain)) {
      throw new Error(`URL must be from ${requiredDomain}`);
    }

    return await this._request('POST', endpoint, { page_url: pageUrl, namespace });
  }

  async _request(method, path, body = null, isJson = true) {
    const options = { method };
    
    if (body) {
      if (isJson) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(body);
      } else {
        options.body = body; // FormData
      }
    } else if (method !== 'GET') {
      options.headers = { 'Content-Type': 'application/json' };
    }

    const response = await fetch(`${this.baseUrl}${path}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.detail || response.statusText);
    }

    return JSON.stringify(result);
  }

  _validateNamespace(namespace) {
    if (!namespace?.trim()) throw new Error('Namespace cannot be empty');
    if (!/^[a-zA-Z][a-zA-Z0-9_-]{2,31}$/.test(namespace)) {
      throw new Error('Namespace must start with letter, 3-32 chars, letters/numbers/_/- only');
    }
    
    const reserved = ['http', 'https', 'www', 'api', 'notion', 'wiki', 'confluence'];
    if (reserved.some(word => namespace.toLowerCase().includes(word))) {
      throw new Error('Namespace contains reserved word');
    }
  }
}

module.exports = DocumentLoaderTool;