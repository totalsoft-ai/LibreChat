const path = require('path');
const { FileSources } = require('librechat-data-provider');
const { logger } = require('@librechat/data-schemas');
const { getStrategyFunctions } = require('~/server/services/Files/strategies');

const mimeByExtension = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

/**
 * Factory for middleware that serves images stored in blob storage (S3/MinIO) through
 * LibreChat itself, so the browser never needs direct access to the storage endpoint.
 *
 * Mounted under `/images`, so `req.path` is `/{userId}/{filename}`, which maps directly
 * to the storage key `images/{userId}/{filename}`. For non-blob strategies it is a no-op
 * and the request falls through to the static file handler.
 *
 * @param {string} [fileStrategy] - The configured file storage strategy (appConfig.fileStrategy).
 * @returns {import('express').RequestHandler}
 */
function createServeImageFromStorage(fileStrategy) {
  const blobStrategies = new Set([FileSources.s3, FileSources.azure_blob]);

  if (!blobStrategies.has(fileStrategy)) {
    return (_req, _res, next) => next();
  }

  return async function serveImageFromStorage(req, res, next) {
    try {
      // req.path is "/{userId}/{filename}" relative to the /images mount.
      const relativePath = decodeURIComponent(req.path).replace(/^\/+/, '');
      if (!relativePath) {
        return next();
      }

      const key = `images/${relativePath}`;
      const { getDownloadStream } = getStrategyFunctions(fileStrategy);
      if (!getDownloadStream) {
        return next();
      }

      const ext = path.extname(relativePath).toLowerCase();
      res.setHeader('Content-Type', mimeByExtension[ext] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'private, max-age=86400');

      const fileStream = await getDownloadStream(req, key);
      fileStream.on('error', (streamError) => {
        logger.error('[serveImageFromStorage] Stream error:', streamError);
        if (!res.headersSent) {
          res.status(404).send('Not Found');
        } else {
          res.end();
        }
      });
      fileStream.pipe(res);
    } catch (error) {
      logger.error('[serveImageFromStorage] Error serving image from storage:', error);
      if (!res.headersSent) {
        res.status(404).send('Not Found');
      }
    }
  };
}

module.exports = createServeImageFromStorage;
