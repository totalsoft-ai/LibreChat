const { z } = require('zod');
const { Tool } = require('@langchain/core/tools');
const { getEnvironmentVariable } = require('@langchain/core/utils/env');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const fileType = require('file-type');

 // Safe fetch (Node 18+ or node-fetch fallback)
 const getFetch = async () => {
   if (typeof fetch === 'function') return fetch;
   try {
     const mod = await import('node-fetch');
     return mod.default;
   } catch {
     throw new Error('fetch is not available. Use Node 18+ or install node-fetch.');
   }
 };

 // Safe axios for FormData requests
 const getAxios = async () => {
   try {
     const mod = await import('axios');
     return mod.default;
   } catch {
     throw new Error('axios is not available. Please install axios.');
   }
 };

// Safe logger utility
const safe = (v) => {
  try { return typeof v === 'string' ? v : JSON.stringify(v); } catch { return String(v); }
};

const logger = {
  info: (message, data = null) => {
    console.log(`[DocumentLoader] INFO: ${message}`, data ? safe(data) : '');
  },
  error: (message, error = null) => {
    console.error(`[DocumentLoader] ERROR: ${message}`, error ? (error.stack || safe(error)) : '');
  },
  debug: (message, data = null) => {
    console.log(`[DocumentLoader] DEBUG: ${message}`, data ? safe(data) : '');
  }
};

// Helper function to get MIME type from filename extension
const extToMime = (filename = '') => {
  const f = filename.toLowerCase();
  if (f.endsWith('.pdf')) return 'application/pdf';
  if (f.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (f.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (f.endsWith('.xls')) return 'application/vnd.ms-excel';
  return null;
};

class DocumentLoaderTool extends Tool {
  static lc_name() {
    return 'document_loader';
  }

  constructor(fields = {}) {
    super(fields);
    this.name = 'document_loader';
    this.baseUrl = getEnvironmentVariable('DOCUMENT_LOADER_BASE_URL');
    
    if (!this.baseUrl) {
      throw new Error('DOCUMENT_LOADER_BASE_URL is not set');
    }
    
    logger.info('DocumentLoaderTool initialized', {
      baseUrl: this.baseUrl,
      hasAttachedFiles: !!(fields.attachedFiles && fields.attachedFiles.length > 0),
      hasToolResources: !!(fields.tool_resources && fields.tool_resources.document_loader),
      hasAttachments: !!(fields.attachments && fields.attachments.length > 0),
      hasAgentAttachments: !!(fields.agent && fields.agent.attachments && fields.agent.attachments.length > 0),
      hasReqAttachments: !!(fields.req && fields.req.body && fields.req.body.attachments && fields.req.body.attachments.length > 0),
      toolResourcesKeys: fields.tool_resources ? Object.keys(fields.tool_resources) : [],
      toolResourcesDetails: fields.tool_resources ? Object.keys(fields.tool_resources).map(key => ({
        key,
        hasFiles: !!(fields.tool_resources[key] && fields.tool_resources[key].files),
        fileCount: fields.tool_resources[key] && fields.tool_resources[key].files ? fields.tool_resources[key].files.length : 0
      })) : []
    });
    
    // Get attached files from various sources
    this.attachedFiles = fields.attachedFiles || [];
    
    // Also check for files in tool_resources (LibreChat standard)
    if (fields.tool_resources && fields.tool_resources.document_loader && fields.tool_resources.document_loader.files) {
      logger.info('Found files in tool_resources.document_loader.files', {
        count: fields.tool_resources.document_loader.files.length,
        files: fields.tool_resources.document_loader.files.map(f => ({ 
          name: f.filename, 
          type: f.type, 
          size: f.size,
          hasContent: !!f.content,
          contentLength: f.content ? f.content.length : 0,
          contentPreview: f.content ? f.content.substring(0, 100) + '...' : 'no content'
        }))
      });
      this.attachedFiles = this.attachedFiles.concat(fields.tool_resources.document_loader.files);
    }
    
    // Also check for files in attachments (LibreChat standard)
    if (fields.attachments && Array.isArray(fields.attachments)) {
      logger.info('Found files in attachments', {
        count: fields.attachments.length,
        files: fields.attachments.map(f => ({ name: f.filename, type: f.type, size: f.size }))
      });
      this.attachedFiles = this.attachedFiles.concat(fields.attachments);
    }
    
    // Also check for files in agent.attachments (LibreChat standard)
    if (fields.agent && fields.agent.attachments && Array.isArray(fields.agent.attachments)) {
      logger.info('Found files in agent.attachments', {
        count: fields.agent.attachments.length,
        files: fields.agent.attachments.map(f => ({ name: f.filename, type: f.type, size: f.size }))
      });
      this.attachedFiles = this.attachedFiles.concat(fields.agent.attachments);
    }
    
    // Also check for files in req.body.attachments (LibreChat standard)
    if (fields.req && fields.req.body && fields.req.body.attachments && Array.isArray(fields.req.body.attachments)) {
      logger.info('Found files in req.body.attachments', {
        count: fields.req.body.attachments.length,
        files: fields.req.body.attachments.map(f => ({ 
          name: f.filename, 
          type: f.type, 
          size: f.size,
          hasContent: !!f.content,
          contentLength: f.content ? f.content.length : 0,
          contentPreview: f.content ? f.content.substring(0, 100) + '...' : 'no content'
        }))
      });
      this.attachedFiles = this.attachedFiles.concat(fields.req.body.attachments);
    }
    
         // Also check for files in req.body.files (LibreChat standard)
     if (fields.req && fields.req.body && fields.req.body.files && Array.isArray(fields.req.body.files)) {
       logger.info('Found files in req.body.files', {
         count: fields.req.body.files.length,
         files: fields.req.body.files.map(f => ({ 
           name: f.filename, 
           type: f.type, 
           size: f.size,
           hasContent: !!f.content,
           contentLength: f.content ? f.content.length : 0,
           contentPreview: f.content ? f.content.substring(0, 100) + '...' : 'no content'
         }))
       });
       
       // Only add files that are not already in tool_resources to avoid duplicates
       const existingFileIds = new Set(this.attachedFiles.map(f => f.file_id));
       const newFiles = fields.req.body.files.filter(f => !existingFileIds.has(f.file_id));
       
       if (newFiles.length > 0) {
         logger.info('Adding new files from req.body.files', {
           count: newFiles.length,
           newFileIds: newFiles.map(f => f.file_id)
         });
         this.attachedFiles = this.attachedFiles.concat(newFiles);
       } else {
         logger.info('No new files to add from req.body.files (all already in tool_resources)');
       }
     }

    logger.info('Total attached files collected', {
      count: this.attachedFiles.length,
      files: this.attachedFiles.map(f => ({
        name: f.filename || f.name,
        type: f.type,
        size: f.size,
        filepath: f.filepath,
        file_id: f.file_id,
        hasContent: !!f.content,
        contentLength: f.content ? f.content.length : 0,
        contentPreview: f.content ? f.content.substring(0, 100) + '...' : 'no content'
      }))
    });

    // Log all available fields for debugging
    logger.info('All fields received in constructor', {
      fieldKeys: Object.keys(fields),
      fields: Object.keys(fields).reduce((acc, key) => {
        const value = fields[key];
        if (typeof value === 'object' && value !== null) {
          acc[key] = {
            type: typeof value,
            isArray: Array.isArray(value),
            keys: Object.keys(value),
            length: Array.isArray(value) ? value.length : undefined
          };
        } else {
          acc[key] = {
            type: typeof value,
            value: value
          };
        }
        return acc;
      }, {})
    });
    
    // Log req.body details if available
    if (fields.req && fields.req.body) {
      logger.info('req.body details', {
        hasFiles: !!(fields.req.body.files && Array.isArray(fields.req.body.files)),
        filesCount: fields.req.body.files ? fields.req.body.files.length : 0,
        hasAttachments: !!(fields.req.body.attachments && Array.isArray(fields.req.body.attachments)),
        attachmentsCount: fields.req.body.attachments ? fields.req.body.attachments.length : 0,
        bodyKeys: Object.keys(fields.req.body)
      });
    }

    this.description =
      'Upload and process documents (PDF, DOCX, Excel) with automatic personal data detection. ' +
      'Also supports Notion and Confluence imports. Documents are organized in namespaces. ' +
      'Files must be attached directly to the message with their content. The tool will use the attached files from the current message.';

    this.schema = z.object({
      action: z.enum([
        'upload_files',
        'upload_uploaded_files',
        'upload_attached_files',
        'upload_notion',
        'upload_confluence',
        'list_namespaces',
        'create_namespace',
      ]),
      namespace: z.string().min(3).max(32).optional(),
      files: z.array(z.string()).optional(),
      uploaded_files: z.array(z.object({
        file_id: z.string(),
        filename: z.string(),
        filepath: z.string(),
        type: z.string().optional(),
      })).optional(),
      attached_files: z.array(z.object({
        file_id: z.string().optional(),
        filename: z.string(),
        filepath: z.string().optional(),
        type: z.string().optional(),
        content: z.string().optional(),
      })).optional(),
      url: z.string().url().optional(),
      new_namespace: z.string().min(3).max(32).optional(),
    });

    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.supportedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
  }

  async _call(input) {
    logger.info('DocumentLoader _call invoked', { input });
    
    const { action, namespace, files, uploaded_files, url, new_namespace } = this.schema.parse(input);
    
    logger.info('Parsed input parameters', {
      action,
      namespace,
      filesCount: files ? files.length : 0,
      uploadedFilesCount: uploaded_files ? uploaded_files.length : 0,
      url,
      new_namespace
    });

    switch (action) {
      case 'upload_files':
        logger.info('Processing upload_files action');
        // Always try to use attached files first, regardless of input files
        if (this.attachedFiles && this.attachedFiles.length > 0) {
          logger.info('Using attached files from context', { count: this.attachedFiles.length });
          return await this._uploadAttachedFiles(null, namespace);
        } else if (files && files.length > 0 && !files.every(f => !f || f.trim() === '')) {
          logger.info('Using files from input parameter', { count: files.length });
          return await this._uploadFiles(files, namespace);
        } else {
          logger.error('No files provided and no attached files found');
          throw new Error('No files provided and no attached files found in the conversation context');
        }
      case 'upload_uploaded_files':
        logger.info('Processing upload_uploaded_files action', { count: uploaded_files ? uploaded_files.length : 0 });
        return await this._uploadUploadedFiles(uploaded_files, namespace);
      case 'upload_attached_files':
        logger.info('Processing upload_attached_files action', { 
          count: input.attached_files ? input.attached_files.length : 0,
          contextAttachedFiles: this.attachedFiles ? this.attachedFiles.length : 0
        });
        // Use attached files from context if none provided in input
        const filesToUse = input.attached_files || this.attachedFiles;
        return await this._uploadAttachedFiles(filesToUse, namespace);
      case 'upload_notion':
        logger.info('Processing upload_notion action', { url });
        return await this._uploadPage(url, namespace, '/upload/notion/', 'notion.so');
      case 'upload_confluence':
        logger.info('Processing upload_confluence action', { url });
        return await this._uploadPage(url, namespace, '/upload/confluence/', 'wiki.logo.com.tr');
      case 'list_namespaces':
        logger.info('Processing list_namespaces action');
        return await this._request('GET', '/namespaces');
      case 'create_namespace':
        logger.info('Processing create_namespace action', { namespace: new_namespace });
        return await this._request('POST', '/namespaces/create', { namespace: new_namespace });
    }
  }

  async _uploadFiles(filePaths, namespace) {
    logger.info('_uploadFiles called', {
      namespace,
      filePathsCount: filePaths ? filePaths.length : 0,
      filePaths: filePaths
    });

    if (!namespace || !filePaths?.length) {
      logger.error('Namespace or files missing', { namespace, filePathsCount: filePaths ? filePaths.length : 0 });
      throw new Error('Namespace and files are required');
    }

    this._validateNamespace(namespace);

    const formData = new FormData();
    formData.append('namespace', namespace);
    logger.info('FormData created with namespace', { namespace });

    for (const filePath of filePaths) {
      logger.info('Processing file path', {
        filePath,
        type: typeof filePath,
        isString: typeof filePath === 'string',
        isObject: typeof filePath === 'object'
      });

      // Check if this is a local file path or an uploaded file object
      if (typeof filePath === 'string') {
        logger.info('Processing local file path', { filePath });
        
        // Handle local file paths
        if (!fs.existsSync(filePath)) {
          logger.error('Local file not found', { filePath });
          throw new Error(`File not found: ${filePath}`);
        }

        const stats = fs.statSync(filePath);
        logger.info('File stats retrieved', {
          filePath,
          size: stats.size,
          sizeMB: (stats.size / 1024 / 1024).toFixed(2),
          maxSizeMB: (this.maxFileSize / 1024 / 1024).toFixed(2)
        });

        if (stats.size > this.maxFileSize) {
          logger.error('File too large', {
            filePath,
            size: (stats.size / 1024 / 1024).toFixed(2),
            maxSize: (this.maxFileSize / 1024 / 1024).toFixed(2)
          });
          throw new Error(
            `File too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB (max: ${
              this.maxFileSize / 1024 / 1024
            }MB)`
          );
        }

        const fileBuffer = fs.readFileSync(filePath);
        logger.info('File buffer read', {
          filePath,
          bufferSize: fileBuffer.length,
          bufferSizeMB: (fileBuffer.length / 1024 / 1024).toFixed(2)
        });

        const detectedFileType = await fileType.fileTypeFromBuffer(fileBuffer);
        logger.info('File type detected', {
          filePath,
          detectedType: detectedFileType,
          mime: detectedFileType ? detectedFileType.mime : 'unknown',
          ext: detectedFileType ? detectedFileType.ext : 'unknown'
        });

        if (!detectedFileType) {
          logger.error('Could not determine file type', { filePath });
          throw new Error(`Could not determine file type for ${filePath}`);
        }

        if (!this.supportedMimeTypes.includes(detectedFileType.mime)) {
          logger.error('Unsupported file type', {
            filePath,
            detectedMime: detectedFileType.mime,
            supportedTypes: this.supportedMimeTypes
          });
          throw new Error(
            `Unsupported file type: ${detectedFileType.mime} (${detectedFileType.ext || 'unknown extension'})`
          );
        }

        const fileName = path.basename(filePath);
        formData.append('files', fs.createReadStream(filePath), fileName);
        logger.info('Local file added to FormData', {
          filePath,
          fileName
        });

      } else if (filePath && typeof filePath === 'object' && filePath.file) {
        logger.info('Processing uploaded file object', {
          filePath,
          file: {
            name: filePath.file.name,
            type: filePath.file.type,
            size: filePath.file.size
          }
        });
        
        // Handle uploaded file objects from web interface
        const file = filePath.file;
        
        if (file.size > this.maxFileSize) {
          logger.error('Uploaded file too large', {
            fileName: file.name,
            size: (file.size / 1024 / 1024).toFixed(2),
            maxSize: (this.maxFileSize / 1024 / 1024).toFixed(2)
          });
          throw new Error(
            `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: ${
              this.maxFileSize / 1024 / 1024
            }MB)`
          );
        }

        if (!this.supportedMimeTypes.includes(file.type)) {
          logger.error('Unsupported uploaded file type', {
            fileName: file.name,
            type: file.type,
            supportedTypes: this.supportedMimeTypes
          });
          throw new Error(
            `Unsupported file type: ${file.type}`
          );
        }

        formData.append('files', file, file.name);
        logger.info('Uploaded file added to FormData', {
          fileName: file.name
        });

      } else {
        logger.error('Invalid file format', { filePath, type: typeof filePath });
        throw new Error(`Invalid file format: ${safe(filePath)}`);
      }
    }

    logger.info('All files processed, sending request to API', {
      endpoint: `${this.baseUrl}/upload/files/`,
      formDataFields: formData.getHeaders ? Object.keys(formData.getHeaders()) : 'unknown'
    });

    return await this._request('POST', '/upload/files/', formData, false);
  }

  async _uploadUploadedFiles(uploadedFiles, namespace) {
    if (!namespace || !uploadedFiles?.length) {
      throw new Error('Namespace and uploaded files are required');
    }

    this._validateNamespace(namespace);

    const formData = new FormData();
    formData.append('namespace', namespace);

    for (const uploadedFile of uploadedFiles) {
      // Validate file type with fallback to extension
      const effectiveType = uploadedFile.type || extToMime(uploadedFile.filename);
      if (!effectiveType || !this.supportedMimeTypes.includes(effectiveType)) {
        throw new Error(
          `Unsupported file type for ${uploadedFile.filename} (type: ${uploadedFile.type || 'n/a'})`
        );
      }

      // Read the file from the filepath
      if (!fs.existsSync(uploadedFile.filepath)) {
        throw new Error(`Uploaded file not found: ${uploadedFile.filepath}`);
      }

      const fileBuffer = fs.readFileSync(uploadedFile.filepath);
      if (fileBuffer.length > this.maxFileSize) {
        throw new Error(
          `File too large: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB (max: ${
            this.maxFileSize / 1024 / 1024
          }MB) for file ${uploadedFile.filename}`
        );
      }

      // Create a readable stream from the buffer
      const { Readable } = require('stream');
      const stream = Readable.from(fileBuffer);
      
      formData.append('files', stream, uploadedFile.filename);
    }

    return await this._request('POST', '/upload/files/', formData, false);
  }

  async _uploadAttachedFiles(attachedFiles, namespace) {
    logger.info('_uploadAttachedFiles called', {
      namespace,
      providedAttachedFiles: attachedFiles ? attachedFiles.length : 0,
      contextAttachedFiles: this.attachedFiles ? this.attachedFiles.length : 0
    });

    if (!namespace) {
      logger.error('Namespace is required but not provided');
      throw new Error('Namespace is required');
    }

    this._validateNamespace(namespace);

    // Use attached files from context if none provided
    const filesToUpload = attachedFiles || this.attachedFiles;
    
    logger.info('Files to upload determined', {
      count: filesToUpload ? filesToUpload.length : 0,
      files: filesToUpload ? filesToUpload.map(f => ({
        filename: f.filename,
        type: f.type,
        size: f.size,
        filepath: f.filepath,
        file_id: f.file_id,
        hasContent: !!f.content,
        contentLength: f.content ? f.content.length : 0
      })) : []
    });
    
    if (!filesToUpload || filesToUpload.length === 0) {
      logger.error('No attached files found in the conversation context');
      throw new Error('No attached files found in the conversation context');
    }

    const formData = new FormData();
    formData.append('namespace', namespace);
    logger.info('FormData created with namespace', { namespace });

    for (const attachedFile of filesToUpload) {
      logger.info('Processing attached file', {
        filename: attachedFile.filename,
        type: attachedFile.type,
        size: attachedFile.size,
        filepath: attachedFile.filepath,
        file_id: attachedFile.file_id,
        hasContent: !!attachedFile.content,
        contentLength: attachedFile.content ? attachedFile.content.length : 0
      });

      // Validate file type with fallback to extension
      const effectiveType = attachedFile.type || extToMime(attachedFile.filename);
      if (!effectiveType || !this.supportedMimeTypes.includes(effectiveType)) {
        logger.error('Unsupported file type', {
          filename: attachedFile.filename,
          type: attachedFile.type,
          effectiveType,
          supportedTypes: this.supportedMimeTypes
        });
        throw new Error(
          `Unsupported file type for ${attachedFile.filename} (type: ${attachedFile.type || 'n/a'})`
        );
      }

      let fileBuffer;

      // Check if we have direct content (base64) from LibreChat
      if (attachedFile.content) {
        logger.info('Processing file with direct content (base64)', {
          filename: attachedFile.filename,
          contentLength: attachedFile.content.length,
          contentPreview: attachedFile.content.substring(0, 100) + '...'
        });

        try {
          // Decode base64 content
          if (attachedFile.content.startsWith('data:')) {
            // Properly extract header and base64 payload from data URL
            const commaIndex = attachedFile.content.indexOf(',');
            const header = attachedFile.content.substring(0, commaIndex);
            const content = attachedFile.content.substring(commaIndex + 1);
            fileBuffer = Buffer.from(content, 'base64');
            logger.info('Decoded data URL content', {
              filename: attachedFile.filename,
              header,
              bufferSize: fileBuffer.length
            });
          } else {
            fileBuffer = Buffer.from(attachedFile.content, 'base64');
            logger.info('Decoded base64 content', {
              filename: attachedFile.filename,
              bufferSize: fileBuffer.length
            });
          }
        } catch (error) {
          logger.error('Error decoding base64 content', {
            filename: attachedFile.filename,
            error: error.message
          });
          throw new Error(`Error decoding file content: ${error.message}`);
        }
      } else {
        // No direct content found - this should not happen if files are properly attached
        logger.error('No direct content found for file', {
          filename: attachedFile.filename,
          filepath: attachedFile.filepath,
          hasContent: !!attachedFile.content,
          contentLength: attachedFile.content ? attachedFile.content.length : 0
        });
        throw new Error(`No direct content found for file: ${attachedFile.filename}. Files must be attached directly to the message with their content.`);
      }

      if (fileBuffer.length > this.maxFileSize) {
        logger.error('File too large', {
          filename: attachedFile.filename,
          size: (fileBuffer.length / 1024 / 1024).toFixed(2),
          maxSize: (this.maxFileSize / 1024 / 1024).toFixed(2)
        });
        throw new Error(
          `File too large: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB (max: ${
            this.maxFileSize / 1024 / 1024
          }MB) for file ${attachedFile.filename}`
        );
      }

      // Create a readable stream from the buffer
      const { Readable } = require('stream');
      const stream = Readable.from(fileBuffer);
      
      // Add file to FormData with proper filename
      formData.append('files', stream, attachedFile.filename);
      logger.info('File added to FormData', {
        filename: attachedFile.filename,
        source: 'direct_content_from_message',
        bufferSize: fileBuffer.length
      });
    }

    // Log FormData contents for debugging
    logger.info('FormData contents', {
      hasNamespace: formData.has ? formData.has('namespace') : 'unknown',
      namespaceValue: formData.get ? formData.get('namespace') : 'unknown',
      filesCount: formData.getAll ? formData.getAll('files').length : 'unknown',
      fileNames: formData.getAll ? formData.getAll('files').map(f => f.name || 'unknown') : 'unknown',
      formDataKeys: formData.keys ? Array.from(formData.keys()) : 'unknown',
      formDataEntries: formData.entries ? Array.from(formData.entries()).map(([k, v]) => [k, typeof v]) : 'unknown'
    });

    logger.info('All files processed, sending request to API', {
      endpoint: `${this.baseUrl}/upload/files/`,
      formDataFields: formData.getHeaders ? Object.keys(formData.getHeaders()) : 'unknown'
    });

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
     logger.info('_request called', {
       method,
       path,
       fullUrl: `${this.baseUrl}${path}`,
       isJson,
       hasBody: !!body,
       bodyType: body ? (isJson ? 'JSON' : 'FormData') : 'none'
     });

     const url = `${this.baseUrl}${path}`;

     if (body && !isJson) {
       // Use axios for FormData requests
       try {
         const axios = await getAxios();
         logger.info('Using axios for FormData request', { url });
         
         const config = {
           method: method.toLowerCase(),
           url: url,
           data: body,
           headers: body.getHeaders ? body.getHeaders() : {}
         };
         
         logger.info('Axios config', {
           method: config.method,
           url: config.url,
           headers: config.headers
         });
         
         const response = await axios(config);
         
         logger.info('Axios response received', {
           status: response.status,
           statusText: response.statusText,
           headers: response.headers
         });
         
         logger.info('Axios response data', {
           dataKeys: response.data ? Object.keys(response.data) : 'null',
           dataPreview: response.data ? safe(response.data).substring(0, 500) + (safe(response.data).length > 500 ? '...' : '') : 'null'
         });
         
         logger.info('Axios request successful');
         return JSON.stringify(response.data ?? { ok: true });
         
       } catch (error) {
         logger.error('Axios request failed', {
           status: error.response?.status,
           statusText: error.response?.statusText,
           data: error.response?.data,
           message: error.message
         });
         
         const detail = error.response?.data?.detail || error.response?.data?.message || error.message || 'Unknown error';
         throw new Error(`HTTP ${error.response?.status || 'unknown'} ${error.response?.statusText || ''}: ${detail}`);
       }
     } else {
       // Use fetch for JSON requests
       const f = await getFetch();
       const options = { method };

       if (body) {
         if (isJson) {
           options.headers = { 'Content-Type': 'application/json' };
           options.body = JSON.stringify(body);
           logger.info('Request body (JSON)', {
             bodyLength: options.body.length,
             bodyPreview: options.body.substring(0, 500) + (options.body.length > 500 ? '...' : '')
           });
         }
       } else if (method !== 'GET') {
         options.headers = { 'Content-Type': 'application/json' };
       }

       logger.info('Sending fetch request', {
         method,
         url: url,
         headers: options.headers
       });

       let response;
       try {
         response = await f(url, options);
       } catch (e) {
         throw new Error(`Network error calling ${url}: ${e?.message || safe(e)}`);
       }
       
       logger.info('Fetch response received', {
         status: response.status,
         statusText: response.statusText,
         headers: Object.fromEntries(response.headers.entries())
       });

       const text = await response.text();
       logger.info('Raw response text', { 
         textLength: text.length,
         textPreview: text.substring(0, 1000) + (text.length > 1000 ? '...' : '')
       });
       
       let result = null;
       try { 
         result = text ? JSON.parse(text) : null; 
       } catch (e) {
         logger.error('Failed to parse JSON response', { 
           error: e.message,
           text: text.substring(0, 500) 
         });
         result = null;
       }

       logger.info('Response parsed', {
         resultKeys: result ? Object.keys(result) : 'null',
         resultPreview: result ? safe(result).substring(0, 500) + (safe(result).length > 500 ? '...' : '') : 'null'
       });

       if (!response.ok) {
         const detail = result?.detail || result?.message || text || response.statusText;
         logger.error('Request failed', {
           status: response.status,
           statusText: response.statusText,
           detail: detail
         });
         throw new Error(`HTTP ${response.status} ${response.statusText}: ${detail}`);
       }

       logger.info('Fetch request successful');
       return JSON.stringify(result ?? { ok: true });
     }
   }

  _validateNamespace(namespace) {
    if (!namespace?.trim()) throw new Error('Namespace cannot be empty');
    if (!/^[a-zA-Z][a-zA-Z0-9_-]{2,31}$/.test(namespace)) {
      throw new Error('Namespace must start with letter, 3-32 chars, letters/numbers/_/- only');
    }

    // Align with backend validation rules
    const reserved = [
      'http', 'https', 'www', 'com', 'org', 'net', 'ro', 
      'api', 'url', 'page', 'doc', 'document', 'file', 'upload', 'download',
      'notion', 'wiki', 'confluence', 'hotnews'
    ];
    if (reserved.some((word) => namespace.toLowerCase().includes(word))) {
      throw new Error('Namespace contains reserved word');
    }
  }
}

module.exports = DocumentLoaderTool;