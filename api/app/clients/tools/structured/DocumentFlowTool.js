const { z } = require('zod');
const { Tool } = require('@langchain/core/tools');
const { getEnvironmentVariable } = require('@langchain/core/utils/env');

class DocumentFlowTool extends Tool {
  static lc_name() {
    return 'document_flow';
  }

  constructor(fields = {}) {
    super(fields);
    this.name = 'document_flow';
    this.baseUrl = getEnvironmentVariable('DOCUMENT_FLOW_API_URL');
    
    this.description = 
      'Generează documentație profesională din cerințe folosind AI. ' +
      'Suportă PRD (Product Requirements Document), Execution Plan, și diagrame PlantUML. ' +
      'Poate procesa text direct sau fișiere DOCX/PDF.';

    this.schema = z.object({
      action: z.enum(['generate_documentation', 'generate_from_file']),
      requirements: z.string().optional(),
      doc_type: z.enum(['all', 'prd', 'execution', 'diagrams']).optional(),
      return_format: z.enum(['text', 'pdf']).optional(),
      file_data: z.object({
        name: z.string(),
        content: z.string()
      }).optional()
    });
  }

  async _call(input) {
    const { action, requirements, doc_type = 'all', return_format = 'text', file_data } = this.schema.parse(input);

    switch (action) {
      case 'generate_documentation':
        return await this._generateDocumentation(requirements, doc_type, return_format);
      case 'generate_from_file':
        return await this._generateFromFile(file_data, doc_type, return_format);
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  }

  async _generateDocumentation(requirements, doc_type = 'all', return_format = 'text') {
    if (!requirements || !requirements.trim()) {
      throw new Error('Cerințele furnizate sunt goale sau invalide');
    }

    const requestBody = {
      message: requirements,
      doc_type: doc_type,
      return_format: return_format
    };

    return await this._request('POST', '/api/generate', requestBody);
  }

  async _generateFromFile(fileData, doc_type = 'all', return_format = 'text') {
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

      // Verifică extensia fișierului și MIME type
      const fileExtension = fileData.name.split('.').pop().toLowerCase();
      const supportedExtensions = ['docx', 'pdf'];
      const supportedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/pdf' // .pdf
      ];
      
      if (!supportedExtensions.includes(fileExtension)) {
        throw new Error('Tip de fișier nesuportat. Suportate: .docx, .pdf');
      }
      
      // Detectează MIME type din conținut (simplu verificare)
      const isPdf = fileContent.slice(0, 4).toString('hex') === '25504446'; // %PDF
      const isDocx = fileContent.slice(0, 4).toString('hex') === '504b0304'; // PK\x03\x04 (ZIP header)
      
      if (fileExtension === 'pdf' && !isPdf) {
        throw new Error('Fișierul nu pare să fie un PDF valid');
      }
      if (fileExtension === 'docx' && !isDocx) {
        throw new Error('Fișierul nu pare să fie un DOCX valid');
      }

      // Construim FormData pentru upload
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', fileContent, fileData.name);
      formData.append('doc_type', doc_type);
      formData.append('return_format', return_format);

      return await this._request('POST', '/api/generate', formData, false);
    } catch (error) {
      throw new Error(`Eroare la procesarea fișierului: ${error.message}`);
    }
  }

  async _request(method, path, body = null, isJson = true) {
    if (!this.baseUrl) {
      throw new Error('DOCUMENT_FLOW_API_URL nu este configurat');
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
      
      if (response.headers.get('content-type')?.includes('application/pdf')) {
        // Pentru PDF, returnăm un mesaj cu link-ul de download
        return JSON.stringify({
          success: true,
          message: "Documentația a fost generată cu succes în format PDF",
          format: "pdf",
          download_available: true
        });
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || response.statusText || `HTTP ${response.status}`);
      }

      return JSON.stringify(result);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Nu se poate conecta la serviciul DocuFlow la ${this.baseUrl}`);
      }
      throw error;
    }
  }
}

module.exports = DocumentFlowTool; 