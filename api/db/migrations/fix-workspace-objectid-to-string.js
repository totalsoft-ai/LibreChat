/**
 * Migration script to convert workspace field from ObjectId to workspaceId string
 *
 * Problem: Some conversations were stored with workspace as MongoDB ObjectId instead of workspaceId string
 * Solution: Find all conversations with ObjectId workspace values and convert them to workspaceId strings
 *
 * Usage: node api/db/migrations/fix-workspace-objectid-to-string.js
 */

const mongoose = require('mongoose');
const { Conversation } = require('../../db/models');
const { logger } = require('@librechat/data-schemas');

async function migrateWorkspaceFields() {
  try {
    logger.info('[Migration] Starting workspace ObjectId to string migration...');

    // Get Workspace model
    const Workspace = mongoose.model('Workspace');

    // Find all conversations that have a workspace field
    const conversationsWithWorkspace = await Conversation.find({
      workspace: { $exists: true, $ne: null },
    }).lean();

    logger.info(`[Migration] Found ${conversationsWithWorkspace.length} conversations with workspace field`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const convo of conversationsWithWorkspace) {
      const workspaceValue = convo.workspace;

      // Check if workspace looks like an ObjectId (24 hex characters)
      const isObjectIdFormat =
        typeof workspaceValue === 'string' &&
        /^[0-9a-fA-F]{24}$/.test(workspaceValue) &&
        workspaceValue.length === 24;

      if (isObjectIdFormat) {
        try {
          // Try to find workspace by ObjectId
          const workspace = await Workspace.findById(workspaceValue).lean();

          if (workspace && workspace.workspaceId) {
            // Update conversation with workspaceId string
            await Conversation.updateOne(
              { _id: convo._id },
              { $set: { workspace: workspace.workspaceId } }
            );
            migratedCount++;
            logger.info(`[Migration] Converted conversation ${convo.conversationId}: ${workspaceValue} -> ${workspace.workspaceId}`);
          } else {
            logger.warn(`[Migration] Workspace not found for ObjectId ${workspaceValue} in conversation ${convo.conversationId}`);
            skippedCount++;
          }
        } catch (error) {
          logger.error(`[Migration] Error processing conversation ${convo.conversationId}:`, error);
          errorCount++;
        }
      } else {
        // Already a workspaceId string or invalid format
        skippedCount++;
      }
    }

    logger.info('[Migration] Workspace migration completed:');
    logger.info(`  - Migrated: ${migratedCount}`);
    logger.info(`  - Skipped: ${skippedCount}`);
    logger.info(`  - Errors: ${errorCount}`);

    return { migratedCount, skippedCount, errorCount };
  } catch (error) {
    logger.error('[Migration] Fatal error during migration:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  const connectDb = require('../connectDb');

  connectDb()
    .then(async () => {
      logger.info('[Migration] Database connected');
      const result = await migrateWorkspaceFields();
      logger.info('[Migration] Migration finished:', result);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('[Migration] Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateWorkspaceFields;
