const mongoose = require('mongoose');
const { logger } = require('~/config');

/**
 * Migration script to fix workspace field from ObjectId to workspaceId string
 * for Agent, Prompt, and File models
 *
 * This script finds all documents where workspace is a 24-character hex string (ObjectId)
 * and converts them to use workspaceId string instead.
 */
async function fixAllWorkspaceObjectIdToString() {
  try {
    const Agent = require('~/models/Agent');
    const Prompt = require('~/models/Prompt');
    const File = require('~/models/File');
    const Workspace = require('~/models/Workspace');

    logger.info('[Migration] Starting workspace ObjectId to string conversion for all models...');

    const models = [
      { name: 'Agent', model: Agent, idField: 'id' },
      { name: 'Prompt', model: Prompt, idField: '_id' },
      { name: 'File', model: File, idField: '_id' },
    ];

    const results = {
      Agent: { success: 0, failed: 0 },
      Prompt: { success: 0, failed: 0 },
      File: { success: 0, failed: 0 },
    };

    for (const { name, model, idField } of models) {
      logger.info(`[Migration] Processing ${name} model...`);

      // Find all documents with workspace field that looks like an ObjectId (24 hex chars)
      const documents = await model.find({
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

      logger.info(`[Migration] Found ${documents.length} ${name} documents with ObjectId workspace`);

      for (const doc of documents) {
        try {
          // Try to find workspace by ObjectId
          const workspace = await Workspace.findOne({ _id: doc.workspace }).lean();

          if (workspace && workspace.workspaceId) {
            // Update document to use workspaceId string
            const filter = {};
            filter[idField] = doc[idField];

            const result = await model.updateOne(
              filter,
              { $set: { workspace: workspace.workspaceId } }
            );

            if (result.modifiedCount > 0) {
              logger.info(
                `[Migration] Updated ${name} ${doc[idField]} workspace from ObjectId ${doc.workspace} to workspaceId ${workspace.workspaceId}`
              );
              results[name].success++;
            } else {
              logger.warn(`[Migration] No changes made for ${name} ${doc[idField]}`);
            }
          } else {
            logger.warn(
              `[Migration] Could not find workspace with ObjectId ${doc.workspace} for ${name} ${doc[idField]}`
            );
            results[name].failed++;
          }
        } catch (error) {
          logger.error(`[Migration] Error processing ${name} ${doc[idField]}:`, error);
          results[name].failed++;
        }
      }

      logger.info(
        `[Migration] ${name} conversion complete. Success: ${results[name].success}, Failed: ${results[name].failed}`
      );
    }

    logger.info('[Migration] All models processed successfully');
    logger.info('[Migration] Summary:', results);

    return results;
  } catch (error) {
    logger.error('[Migration] Error during workspace migration:', error);
    throw error;
  }
}

module.exports = fixAllWorkspaceObjectIdToString;

// Run migration if called directly
if (require.main === module) {
  const connectDb = require('~/lib/db/connectDb');
  connectDb()
    .then(() => fixAllWorkspaceObjectIdToString())
    .then((results) => {
      logger.info('[Migration] Migration completed:', results);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('[Migration] Migration failed:', error);
      process.exit(1);
    });
}
