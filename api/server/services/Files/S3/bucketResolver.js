const { logger } = require('@librechat/data-schemas');

/**
 * Determines which S3/Minio bucket to use based on file context.
 *
 * Supports dual-bucket mode for separating personal and workspace files:
 * - Personal files (no workspace) → AWS_BUCKET_NAME
 * - Workspace files → AWS_WORKSPACE_BUCKET_NAME
 *
 * If AWS_WORKSPACE_BUCKET_NAME is not set, falls back to single-bucket mode
 * where all files use AWS_BUCKET_NAME (backward compatible).
 *
 * @param {Object} params - Bucket selection parameters
 * @param {string} [params.workspace] - Workspace ID if this is a workspace file
 * @param {MongoFile} [params.file] - File object with workspace metadata
 * @returns {string} - Bucket name to use for S3/Minio operations
 *
 * @example
 * // Single-bucket mode (backward compatible)
 * getBucketName({ workspace: 'ws123' }) // Returns AWS_BUCKET_NAME
 *
 * @example
 * // Dual-bucket mode - workspace file
 * getBucketName({ workspace: 'ws123' }) // Returns AWS_WORKSPACE_BUCKET_NAME
 *
 * @example
 * // Dual-bucket mode - personal file
 * getBucketName({ workspace: null }) // Returns AWS_BUCKET_NAME
 *
 * @example
 * // Using file object
 * getBucketName({ file: { workspace: 'ws456' } }) // Returns AWS_WORKSPACE_BUCKET_NAME
 */
function getBucketName({ workspace, file } = {}) {
  const personalBucket = process.env.AWS_BUCKET_NAME;
  const workspaceBucket = process.env.AWS_WORKSPACE_BUCKET_NAME;

  // Single-bucket mode: backward compatible
  // If workspace bucket is not configured, use personal bucket for everything
  if (!workspaceBucket) {
    return personalBucket;
  }

  // Dual-bucket mode: determine bucket based on workspace context
  const workspaceId = workspace || file?.workspace;

  // Check if this is a workspace file
  // Handle both null and string 'null' (can occur from JSON serialization)
  if (workspaceId && workspaceId !== 'null' && workspaceId !== null) {
    logger.debug(`[getBucketName] Using workspace bucket for workspace: ${workspaceId}`);
    return workspaceBucket;
  }

  // Personal file (no workspace)
  logger.debug('[getBucketName] Using personal bucket');
  return personalBucket;
}

module.exports = { getBucketName };
