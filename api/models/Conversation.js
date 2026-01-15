const { logger } = require('@librechat/data-schemas');
const { createTempChatExpirationDate } = require('@librechat/api');
const { getMessages, deleteMessages } = require('./Message');
const { Conversation } = require('~/db/models');
const mongoose = require('mongoose');

/**
 * Searches for a conversation by conversationId and returns a lean document with only conversationId and user.
 * @param {string} conversationId - The conversation's ID.
 * @returns {Promise<{conversationId: string, user: string} | null>} The conversation object with selected fields or null if not found.
 */
const searchConversation = async (conversationId) => {
  try {
    return await Conversation.findOne({ conversationId }, 'conversationId user workspace').lean();
  } catch (error) {
    logger.error('[searchConversation] Error searching conversation', error);
    throw new Error('Error searching conversation');
  }
};

/**
 * Retrieves a single conversation for a given user and conversation ID.
 * @param {string} user - The user's ID.
 * @param {string} conversationId - The conversation's ID.
 * @returns {Promise<TConversation>} The conversation object.
 */
const getConvo = async (user, conversationId) => {
  try {
    return await Conversation.findOne({ user, conversationId }).lean();
  } catch (error) {
    logger.error('[getConvo] Error getting single conversation', error);
    return { message: 'Error getting single conversation' };
  }
};

const deleteNullOrEmptyConversations = async () => {
  try {
    const filter = {
      $or: [
        { conversationId: null },
        { conversationId: '' },
        { conversationId: { $exists: false } },
      ],
    };

    const result = await Conversation.deleteMany(filter);

    // Delete associated messages
    const messageDeleteResult = await deleteMessages(filter);

    logger.info(
      `[deleteNullOrEmptyConversations] Deleted ${result.deletedCount} conversations and ${messageDeleteResult.deletedCount} messages`,
    );

    return {
      conversations: result,
      messages: messageDeleteResult,
    };
  } catch (error) {
    logger.error('[deleteNullOrEmptyConversations] Error deleting conversations', error);
    throw new Error('Error deleting conversations with null or empty conversationId');
  }
};

/**
 * Searches for a conversation by conversationId and returns associated file ids.
 * @param {string} conversationId - The conversation's ID.
 * @returns {Promise<string[] | null>}
 */
const getConvoFiles = async (conversationId) => {
  try {
    return (await Conversation.findOne({ conversationId }, 'files').lean())?.files ?? [];
  } catch (error) {
    logger.error('[getConvoFiles] Error getting conversation files', error);
    throw new Error('Error getting conversation files');
  }
};

module.exports = {
  getConvoFiles,
  searchConversation,
  deleteNullOrEmptyConversations,
  /**
   * Saves a conversation to the database.
   * @param {Object} req - The request object.
   * @param {string} conversationId - The conversation's ID.
   * @param {Object} metadata - Additional metadata to log for operation.
   * @returns {Promise<TConversation>} The conversation object.
   */
  saveConvo: async (req, { conversationId, newConversationId, workspace, ...convo }, metadata) => {
    try {
      if (metadata?.context) {
        logger.debug(`[saveConvo] ${metadata.context}`);
      }

      const messages = await getMessages({ conversationId }, '_id');
      const update = { ...convo, messages, user: req.user.id };

      if (newConversationId) {
        update.conversationId = newConversationId;
      }

      // Normalize workspace field
      // The Conversation schema expects `workspace` as a workspaceId string.
      // Avoid sending nested workspace objects or mixing ObjectId with workspaceId.
      if (workspace) {
        const Workspace = require('~/models/Workspace');
        try {
          if (typeof workspace === 'string' && workspace.length > 0) {
            // If a 24-char ObjectId string was provided, try to resolve to workspaceId
            const looksLikeObjectId = mongoose.Types.ObjectId.isValid(workspace) && workspace.length === 24;
            if (looksLikeObjectId) {
              const wsById = await Workspace.findOne({ _id: workspace, isActive: true, isArchived: false }).lean();
              if (wsById) {
                update.workspace = wsById.workspaceId;
              } else {
                // Fallback: use the provided string assuming it's already the workspaceId
                update.workspace = workspace;
              }
            } else {
              // Treat as workspaceId and verify it exists
              const ws = await Workspace.findOne({ workspaceId: workspace, isActive: true, isArchived: false }).lean();
              if (ws) {
                update.workspace = ws.workspaceId; // store string workspaceId
              } else {
                logger.warn(`[saveConvo] Invalid workspace: ${workspace}`);
                // Remove workspace from update so it doesn't create a conflicting nested object
                delete update.workspace;
              }
            }
          } else if (workspace && typeof workspace === 'object') {
            // If we received a whole workspace object, only keep the workspaceId string
            const wsId = workspace.workspaceId || workspace.workspaceId?.toString();
            if (wsId) {
              // Validate workspace exists
              const ws = await Workspace.findOne({ workspaceId: wsId, isActive: true, isArchived: false }).lean();
              if (ws) {
                update.workspace = ws.workspaceId;
              } else {
                delete update.workspace;
              }
            } else {
              // If no workspaceId in object, remove the property
              delete update.workspace;
            }
          }
        } catch (err) {
          logger.error(`[saveConvo] Error resolving workspace ${workspace}:`, err);
          // If error resolving workspace, drop workspace property from update
          delete update.workspace;
        }
      }

      if (req?.body?.isTemporary) {
        try {
          const appConfig = req.config;
          update.expiredAt = createTempChatExpirationDate(appConfig?.interfaceConfig);
        } catch (err) {
          logger.error('Error creating temporary chat expiration date:', err);
          logger.info(`---\`saveConvo\` context: ${metadata?.context}`);
          update.expiredAt = null;
        }
      } else {
        update.expiredAt = null;
      }

      /** @type {{ $set: Partial<TConversation>; $unset?: Record<keyof TConversation, number> }} */
      const updateOperation = { $set: update };
      if (metadata && metadata.unsetFields && Object.keys(metadata.unsetFields).length > 0) {
        updateOperation.$unset = metadata.unsetFields;
      }

      /** Note: the resulting Model object is necessary for Meilisearch operations */
      // Ensure no nested workspace paths are present to avoid conflicting update paths
      // e.g. workspace and workspace.some nested keys in the same $set
      if (update && typeof update === 'object') {
        // Remove keys like 'workspace._id' or 'workspace.name' if present
        Object.keys(update).forEach((k) => {
          if (k.startsWith('workspace.') || k.includes('workspace.')) {
            delete update[k];
          }
        });
      }

      // Prevent conflicts: if workspace is being set, remove it from unset
      if (update.workspace !== undefined && updateOperation.$unset) {
        delete updateOperation.$unset.workspace;
        // If unset is now empty, remove it entirely
        if (Object.keys(updateOperation.$unset).length === 0) {
          delete updateOperation.$unset;
        }
      }

      const conversation = await Conversation.findOneAndUpdate(
        { conversationId, user: req.user.id },
        updateOperation,
        {
          new: true,
          upsert: true,
          // Select only necessary fields to reduce memory usage
          select:
            'conversationId title user endpoint model agent_id assistant_id spec iconURL createdAt updatedAt messages',
        },
      );

      return conversation.toObject();
    } catch (error) {
      logger.error('[saveConvo] Error saving conversation', error);
      if (metadata && metadata?.context) {
        logger.info(`[saveConvo] ${metadata.context}`);
      }
      return { message: 'Error saving conversation' };
    }
  },
  bulkSaveConvos: async (conversations) => {
    try {
      const bulkOps = conversations.map((convo) => ({
        updateOne: {
          filter: { conversationId: convo.conversationId, user: convo.user },
          update: convo,
          upsert: true,
          timestamps: false,
        },
      }));

      const result = await Conversation.bulkWrite(bulkOps);
      return result;
    } catch (error) {
      logger.error('[saveBulkConversations] Error saving conversations in bulk', error);
      throw new Error('Failed to save conversations in bulk.');
    }
  },
  getConvosByCursor: async (
    user,
    { cursor, limit = 25, isArchived = false, tags, search, order = 'desc', workspace } = {},
  ) => {
    const filters = [{ user }];

    // Workspace filtering
    if (workspace !== undefined) {
      if (workspace === null || workspace === 'personal') {
        // Filter for personal conversations (no workspace)
        filters.push({ $or: [{ workspace: null }, { workspace: { $exists: false } }] });
      } else {
        // Filter for specific workspace
        // Convert workspaceId string to ObjectId if needed
        let workspaceFilter = workspace;
        if (typeof workspace === 'string' && workspace.length > 0) {
          // Validate that the workspace exists and is active
          try {
            const Workspace = require('~/models/Workspace');
            const ws = await Workspace.findOne({
              workspaceId: workspace,
              isActive: true,
              isArchived: false,
            });
            if (!ws) {
              // Workspace not found, return empty results
              return { conversations: [], nextCursor: null };
            }
            // Use workspaceId string as stored in the Conversation schema
            workspaceFilter = ws.workspaceId;
          } catch (error) {
            logger.error('[getConvosByCursor] Error validating workspace:', error);
            // On error, return empty results
            return { conversations: [], nextCursor: null };
          }
        }
        filters.push({ workspace: workspaceFilter });
      }
    }

    if (isArchived) {
      filters.push({ isArchived: true });
    } else {
      filters.push({ $or: [{ isArchived: false }, { isArchived: { $exists: false } }] });
    }

    if (Array.isArray(tags) && tags.length > 0) {
      filters.push({ tags: { $in: tags } });
    }

    filters.push({ $or: [{ expiredAt: null }, { expiredAt: { $exists: false } }] });

    if (search) {
      try {
        const meiliResults = await Conversation.meiliSearch(search, { filter: `user = "${user}"` });
        const matchingIds = Array.isArray(meiliResults.hits)
          ? meiliResults.hits.map((result) => result.conversationId)
          : [];
        if (!matchingIds.length) {
          return { conversations: [], nextCursor: null };
        }
        filters.push({ conversationId: { $in: matchingIds } });
      } catch (error) {
        logger.error('[getConvosByCursor] Error during meiliSearch', error);
        return { message: 'Error during meiliSearch' };
      }
    }

    if (cursor) {
      filters.push({ updatedAt: { $lt: new Date(cursor) } });
    }

    const query = filters.length === 1 ? filters[0] : { $and: filters };

    try {
      const convos = await Conversation.find(query)
        .select(
          'conversationId endpoint title createdAt updatedAt user model agent_id assistant_id spec iconURL',
        )
        .sort({ updatedAt: order === 'asc' ? 1 : -1 })
        .limit(limit + 1)
        .lean();

      let nextCursor = null;
      if (convos.length > limit) {
        const lastConvo = convos.pop();
        nextCursor = lastConvo.updatedAt.toISOString();
      }

      return { conversations: convos, nextCursor };
    } catch (error) {
      logger.error('[getConvosByCursor] Error getting conversations', error);
      return { message: 'Error getting conversations' };
    }
  },
  getConvosQueried: async (user, convoIds, cursor = null, limit = 25, workspace = undefined) => {
    try {
      if (!convoIds?.length) {
        return { conversations: [], nextCursor: null, convoMap: {} };
      }

      const conversationIds = convoIds.map((convo) => convo.conversationId);

      const filter = {
        user,
        conversationId: { $in: conversationIds },
        $or: [{ expiredAt: { $exists: false } }, { expiredAt: null }],
      };

      // Add workspace filtering if provided
      if (workspace !== undefined) {
        if (workspace === null || workspace === 'personal') {
          filter.$and = [{ $or: [{ workspace: null }, { workspace: { $exists: false } }] }];
        } else if (typeof workspace === 'string' && workspace.length > 0) {
          filter.workspace = workspace;
        }
      }

      const results = await Conversation.find(filter)
        .select(
          'conversationId endpoint title createdAt updatedAt user model agent_id assistant_id spec iconURL',
        )
        .lean();

      results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      let filtered = results;
      if (cursor && cursor !== 'start') {
        const cursorDate = new Date(cursor);
        filtered = results.filter((convo) => new Date(convo.updatedAt) < cursorDate);
      }

      const limited = filtered.slice(0, limit + 1);
      let nextCursor = null;
      if (limited.length > limit) {
        const lastConvo = limited.pop();
        nextCursor = lastConvo.updatedAt.toISOString();
      }

      const convoMap = {};
      limited.forEach((convo) => {
        convoMap[convo.conversationId] = convo;
      });

      return { conversations: limited, nextCursor, convoMap };
    } catch (error) {
      logger.error('[getConvosQueried] Error getting conversations', error);
      return { message: 'Error fetching conversations' };
    }
  },
  getConvo,
  /* chore: this method is not properly error handled */
  getConvoTitle: async (user, conversationId) => {
    try {
      const convo = await getConvo(user, conversationId);
      /* ChatGPT Browser was triggering error here due to convo being saved later */
      if (convo && !convo.title) {
        return null;
      } else {
        // TypeError: Cannot read properties of null (reading 'title')
        return convo?.title || 'New Chat';
      }
    } catch (error) {
      logger.error('[getConvoTitle] Error getting conversation title', error);
      return { message: 'Error getting conversation title' };
    }
  },
  /**
   * Asynchronously deletes conversations and associated messages for a given user and filter.
   *
   * @async
   * @function
   * @param {string|ObjectId} user - The user's ID.
   * @param {Object} filter - Additional filter criteria for the conversations to be deleted.
   * @returns {Promise<{ n: number, ok: number, deletedCount: number, messages: { n: number, ok: number, deletedCount: number } }>}
   *          An object containing the count of deleted conversations and associated messages.
   * @throws {Error} Throws an error if there's an issue with the database operations.
   *
   * @example
   * const user = 'someUserId';
   * const filter = { someField: 'someValue' };
   * const result = await deleteConvos(user, filter);
   * logger.error(result); // { n: 5, ok: 1, deletedCount: 5, messages: { n: 10, ok: 1, deletedCount: 10 } }
   */
  deleteConvos: async (user, filter) => {
    try {
      const userFilter = { ...filter, user };
      const conversations = await Conversation.find(userFilter).select('conversationId');
      const conversationIds = conversations.map((c) => c.conversationId);

      if (!conversationIds.length) {
        throw new Error('Conversation not found or already deleted.');
      }

      const deleteConvoResult = await Conversation.deleteMany(userFilter);

      const deleteMessagesResult = await deleteMessages({
        conversationId: { $in: conversationIds },
      });

      return { ...deleteConvoResult, messages: deleteMessagesResult };
    } catch (error) {
      logger.error('[deleteConvos] Error deleting conversations and messages', error);
      throw error;
    }
  },
};
