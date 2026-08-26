const cron = require('node-cron');
const { logger } = require('@librechat/data-schemas');
const { FileContext } = require('librechat-data-provider');
const { getFiles, deleteFile: deleteFileRecord } = require('~/models/File');
const { getStrategyFunctions } = require('~/server/services/Files/strategies');

/**
 * Computes the cutoff date before which message-attachment images are considered expired.
 * @param {number} retentionDays
 * @returns {Date}
 */
function calculateCutoffDate(retentionDays) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);
  return cutoff;
}

/**
 * Finds and deletes chat image attachments (DB record + underlying storage object)
 * older than the configured retention window. Only targets message-attachment images;
 * agent files, code-interpreter outputs, avatars, etc. are left untouched.
 *
 * @param {number} [retentionDays] - Defaults to IMAGE_ATTACHMENT_RETENTION_DAYS (or 15).
 * @returns {Promise<{ processed: number, errors: number, cutoffDate: Date }>}
 */
async function sweepExpiredImageAttachments(retentionDays) {
  const days = retentionDays ?? (parseInt(process.env.IMAGE_ATTACHMENT_RETENTION_DAYS, 10) || 15);
  const cutoffDate = calculateCutoffDate(days);

  const expiredFiles = await getFiles({
    context: FileContext.message_attachment,
    type: { $regex: '^image/' },
    createdAt: { $lt: cutoffDate },
  });

  if (!expiredFiles || expiredFiles.length === 0) {
    logger.debug(
      `[ImageRetention] No expired image attachments found (retention: ${days} days, cutoff: ${cutoffDate.toISOString()})`,
    );
    return { processed: 0, errors: 0, cutoffDate };
  }

  logger.info(
    `[ImageRetention] Found ${expiredFiles.length} expired image attachment(s) (retention: ${days} days, cutoff: ${cutoffDate.toISOString()})`,
  );

  let processed = 0;
  let errors = 0;

  for (const file of expiredFiles) {
    try {
      const { deleteFile: deleteFromStorage } = getStrategyFunctions(file.source);
      if (deleteFromStorage) {
        /** Synthetic request: strategy delete functions only need `req.user.id` for the
         * ownership check (and `req.user` for RAG lookups, which don't apply to images). */
        const syntheticReq = { user: { id: file.user?.toString?.() ?? file.user } };
        await deleteFromStorage(syntheticReq, file);
      } else {
        logger.warn(
          `[ImageRetention] No delete function for source "${file.source}", skipping storage cleanup for file ${file.file_id}`,
        );
      }

      await deleteFileRecord(file.file_id);
      processed++;
    } catch (error) {
      errors++;
      logger.error(`[ImageRetention] Error deleting expired file ${file.file_id}:`, error);
    }
  }

  logger.info(`[ImageRetention] Completed: ${processed} deleted, ${errors} errors`);
  return { processed, errors, cutoffDate };
}

/**
 * Starts the scheduled job that sweeps and deletes expired chat image attachments.
 * Disabled unless IMAGE_ATTACHMENT_RETENTION_ENABLED is explicitly set.
 */
function startImageRetentionCron() {
  const cronSchedule = process.env.IMAGE_ATTACHMENT_RETENTION_CRON || '0 3 * * *';
  const timezone = process.env.IMAGE_ATTACHMENT_RETENTION_TIMEZONE || 'UTC';

  logger.info(
    `[ImageRetention] Starting image retention cron job with schedule: ${cronSchedule} (timezone: ${timezone})`,
  );

  cron.schedule(
    cronSchedule,
    async () => {
      try {
        await sweepExpiredImageAttachments();
      } catch (error) {
        logger.error('[ImageRetention] Error in cron job:', error);
      }
    },
    { timezone },
  );

  logger.info('[ImageRetention] Cron job started successfully');
}

module.exports = {
  startImageRetentionCron,
  sweepExpiredImageAttachments,
  calculateCutoffDate,
};
