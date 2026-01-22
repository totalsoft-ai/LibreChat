const sharp = require('sharp');

/**
 * Determines the file type of a buffer
 * @param {Buffer} dataBuffer
 * @param {boolean} [returnFileType=false] - Optional. If true, returns the file type instead of the file extension.
 * @returns {Promise<string|null|import('file-type').FileTypeResult>} - Returns the file extension if found, else null
 * */
const determineFileType = async (dataBuffer, returnFileType) => {
  const fileType = await import('file-type');
  const type = await fileType.fileTypeFromBuffer(dataBuffer);
  if (returnFileType) {
    return type;
  }
  return type ? type.ext : null; // Returns extension if found, else null
};

/**
 * Get buffer metadata
 * @param {Buffer} buffer
 * @returns {Promise<{ bytes: number, type: string, dimensions: Record<string, number>, extension: string}>}
 */
const getBufferMetadata = async (buffer) => {
  const fileType = await determineFileType(buffer, true);
  const bytes = buffer.length;
  let extension = fileType ? fileType.ext : 'unknown';

  /** @type {Record<string, number>} */
  let dimensions = {};

  if (fileType && fileType.mime.startsWith('image/') && extension !== 'unknown') {
    const imageMetadata = await sharp(buffer).metadata();
    dimensions = {
      width: imageMetadata.width,
      height: imageMetadata.height,
    };
  }

  return {
    bytes,
    type: fileType?.mime ?? 'unknown',
    dimensions,
    extension,
  };
};

/**
 * Removes UUID prefix from filename and sanitizes it to prevent path traversal attacks
 * Pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx__filename.ext
 * @param {string} fileName - The filename to clean
 * @returns {string} - The cleaned and sanitized filename without UUID prefix
 */
const cleanFileName = (fileName) => {
  if (!fileName || typeof fileName !== 'string') {
    return 'file';
  }

  // Remove UUID pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx__
  let cleaned = fileName.replace(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}__/i,
    '',
  );

  // Security: Prevent path traversal attacks
  // Remove path separators (both forward and backward slashes)
  cleaned = cleaned.replace(/[\/\\]/g, '_');

  // Remove path traversal sequences
  cleaned = cleaned.replace(/\.\./g, '_');

  // Remove leading dots to prevent hidden files
  cleaned = cleaned.replace(/^\.+/, '');

  // Whitelist allowed characters: alphanumeric, dots, dashes, underscores, spaces
  // Replace any other characters with underscores
  cleaned = cleaned.replace(/[^a-zA-Z0-9._\-\s]/g, '_');

  // Remove multiple consecutive underscores
  cleaned = cleaned.replace(/_+/g, '_');

  // Remove leading/trailing underscores and spaces
  cleaned = cleaned.trim().replace(/^_+|_+$/g, '');

  // Ensure filename is not empty after sanitization
  if (!cleaned || cleaned.length === 0) {
    cleaned = 'file';
  }

  // Limit filename length to prevent buffer issues
  const MAX_FILENAME_LENGTH = 255;
  if (cleaned.length > MAX_FILENAME_LENGTH) {
    // Preserve file extension if present
    const lastDotIndex = cleaned.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const extension = cleaned.substring(lastDotIndex);
      const baseName = cleaned.substring(0, MAX_FILENAME_LENGTH - extension.length);
      cleaned = baseName + extension;
    } else {
      cleaned = cleaned.substring(0, MAX_FILENAME_LENGTH);
    }
  }

  return cleaned;
};

module.exports = { determineFileType, getBufferMetadata, cleanFileName };
