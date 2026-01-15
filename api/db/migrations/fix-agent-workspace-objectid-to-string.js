const mongoose = require('mongoose');
const { logger } = require('~/config');

/**
 * Migration script to fix Agent workspace field from ObjectId to workspaceId string
 *
 * This script finds all agents where workspace is a 24-character hex string (ObjectId)
 * and converts them to use workspaceId string instead.
 */
async function fixAgentWorkspaceObjectIdToString() {
  try {
    const Agent = require('~/models/Agent');
    const Workspace = require('~/models/Workspace');

    logger.info('[Migration] Starting Agent workspace ObjectId to string conversion...');

    // Find all agents with workspace field that looks like an ObjectId (24 hex chars)
    const agents = await Agent.find({
      workspace: { $exists: true, $ne: null },
      // Match workspace fields that are 24-character hex strings (ObjectId pattern)
      $expr: {
        $and: [
          { $eq: [{ $type: '$workspace' }, 'string'] },
          { $eq: [{ $strLenCP: '$workspace' }, 24] },
          { $regexMatch: { input: '$workspace', regex: /^[0-9a-fA-F]{24}$/ } },
        ],
      },
    }).lean();

    logger.info(`[Migration] Found ${agents.length} agents with ObjectId workspace`);

    let successCount = 0;
    let failCount = 0;

    for (const agent of agents) {
      try {
        // Try to find workspace by ObjectId
        const workspace = await Workspace.findOne({ _id: agent.workspace }).lean();

        if (workspace && workspace.workspaceId) {
          // Update agent to use workspaceId string
          const result = await Agent.updateOne(
            { id: agent.id },
            { $set: { workspace: workspace.workspaceId } }
          );

          if (result.modifiedCount > 0) {
            logger.info(
              `[Migration] Updated agent ${agent.id} workspace from ObjectId ${agent.workspace} to workspaceId ${workspace.workspaceId}`
            );
            successCount++;
          } else {
            logger.warn(`[Migration] No changes made for agent ${agent.id}`);
          }
        } else {
          logger.warn(
            `[Migration] Could not find workspace with ObjectId ${agent.workspace} for agent ${agent.id}`
          );
          failCount++;
        }
      } catch (error) {
        logger.error(`[Migration] Error processing agent ${agent.id}:`, error);
        failCount++;
      }
    }

    logger.info(
      `[Migration] Agent workspace conversion complete. Success: ${successCount}, Failed: ${failCount}`
    );

    return { success: successCount, failed: failCount };
  } catch (error) {
    logger.error('[Migration] Error during Agent workspace migration:', error);
    throw error;
  }
}

module.exports = fixAgentWorkspaceObjectIdToString;

// Run migration if called directly
if (require.main === module) {
  const connectDb = require('~/lib/db/connectDb');
  connectDb()
    .then(() => fixAgentWorkspaceObjectIdToString())
    .then((result) => {
      logger.info('[Migration] Migration completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('[Migration] Migration failed:', error);
      process.exit(1);
    });
}
