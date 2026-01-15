const { logger } = require('@librechat/data-schemas');
const { Conversation, Agent, Prompt, File } = require('~/db/models');

/**
 * Migration: Add workspace field to all resource models
 *
 * This migration adds the workspace field to Conversation, Agent, Prompt, and File models.
 * All existing resources will have workspace set to null (personal resources).
 *
 * Run this migration when deploying the Team Workspaces feature.
 *
 * Usage: node api/db/migrations/add-workspace-fields.js
 */

async function addWorkspaceFields() {
  try {
    logger.info('[Migration] Starting workspace field migration...');

    // Add workspace field to all conversations (set to null for personal)
    logger.info('[Migration] Migrating Conversation model...');
    const conversationResult = await Conversation.updateMany(
      { workspace: { $exists: false } },
      { $set: { workspace: null } },
    );
    logger.info(
      `[Migration] Updated ${conversationResult.modifiedCount} conversations (${conversationResult.matchedCount} matched)`,
    );

    // Add workspace field to all agents
    logger.info('[Migration] Migrating Agent model...');
    const agentResult = await Agent.updateMany(
      { workspace: { $exists: false } },
      { $set: { workspace: null } },
    );
    logger.info(
      `[Migration] Updated ${agentResult.modifiedCount} agents (${agentResult.matchedCount} matched)`,
    );

    // Add workspace field to all prompts
    logger.info('[Migration] Migrating Prompt model...');
    const promptResult = await Prompt.updateMany(
      { workspace: { $exists: false } },
      { $set: { workspace: null } },
    );
    logger.info(
      `[Migration] Updated ${promptResult.modifiedCount} prompts (${promptResult.matchedCount} matched)`,
    );

    // Add workspace field to all files
    logger.info('[Migration] Migrating File model...');
    const fileResult = await File.updateMany(
      { workspace: { $exists: false } },
      { $set: { workspace: null } },
    );
    logger.info(
      `[Migration] Updated ${fileResult.modifiedCount} files (${fileResult.matchedCount} matched)`,
    );

    logger.info('[Migration] Workspace field migration completed successfully!');
    logger.info('[Migration] Summary:');
    logger.info(`  - Conversations: ${conversationResult.matchedCount} processed`);
    logger.info(`  - Agents: ${agentResult.matchedCount} processed`);
    logger.info(`  - Prompts: ${promptResult.matchedCount} processed`);
    logger.info(`  - Files: ${fileResult.matchedCount} processed`);

    return {
      success: true,
      conversations: conversationResult,
      agents: agentResult,
      prompts: promptResult,
      files: fileResult,
    };
  } catch (error) {
    logger.error('[Migration] Error during workspace field migration:', error);
    throw error;
  }
}

/**
 * Rollback migration (if needed)
 * This removes the workspace field from all resources
 */
async function rollbackWorkspaceFields() {
  try {
    logger.info('[Migration Rollback] Starting workspace field rollback...');

    await Conversation.updateMany({}, { $unset: { workspace: '' } });
    logger.info('[Migration Rollback] Removed workspace field from Conversations');

    await Agent.updateMany({}, { $unset: { workspace: '' } });
    logger.info('[Migration Rollback] Removed workspace field from Agents');

    await Prompt.updateMany({}, { $unset: { workspace: '' } });
    logger.info('[Migration Rollback] Removed workspace field from Prompts');

    await File.updateMany({}, { $unset: { workspace: '' } });
    logger.info('[Migration Rollback] Removed workspace field from Files');

    logger.info('[Migration Rollback] Workspace field rollback completed successfully!');

    return { success: true };
  } catch (error) {
    logger.error('[Migration Rollback] Error during rollback:', error);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  const mongoose = require('mongoose');
  const { connectDb, disconnectDb } = require('~/db/connect');

  (async () => {
    try {
      await connectDb();
      logger.info('[Migration] Connected to database');

      const args = process.argv.slice(2);
      const isRollback = args.includes('--rollback');

      if (isRollback) {
        await rollbackWorkspaceFields();
      } else {
        await addWorkspaceFields();
      }

      await disconnectDb();
      logger.info('[Migration] Database connection closed');
      process.exit(0);
    } catch (error) {
      logger.error('[Migration] Migration failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  addWorkspaceFields,
  rollbackWorkspaceFields,
};
