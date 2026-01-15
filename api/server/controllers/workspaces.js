const { logger } = require('@librechat/data-schemas');
const Workspace = require('~/models/Workspace');
const Activity = require('~/models/Activity');
const { Conversation, Agent, Prompt, File, Message } = require('~/db/models');
const {
  getWorkspaceActivity,
  getTopContributors,
  getRecentSharedResources,
} = require('~/server/services/ActivityService');
const { processDeleteRequest } = require('~/server/services/Files/process');

/**
 * Normalize workspace members to ensure consistent structure
 * Transforms populated user objects to include both id and user data
 */
const normalizeWorkspaceMembers = (workspace) => {
  if (!workspace || !workspace.members) {
    return workspace;
  }

  const normalized = workspace.toObject ? workspace.toObject() : { ...workspace };

  normalized.members = normalized.members.map((member) => {
    const normalizedMember = { ...member };

    // If user is populated (object), extract id and keep user data
    if (member.user && typeof member.user === 'object') {
      normalizedMember.user = member.user._id || member.user.id || member.user;
      normalizedMember.userData = {
        id: member.user._id || member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar,
        username: member.user.username,
      };
    } else {
      // If user is already a string (ID), keep it as is
      normalizedMember.user = member.user;
    }

    return normalizedMember;
  });

  // Ensure createdBy is always a string ID (not populated object)
  if (normalized.createdBy && typeof normalized.createdBy === 'object') {
    normalized.createdBy = normalized.createdBy._id || normalized.createdBy.id;
  }

  return normalized;
};

/**
 * Get all workspaces for current user
 * GET /api/workspaces
 */
const getUserWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaces = await Workspace.findUserWorkspaces(userId);

    // Normalize all workspaces
    const normalizedWorkspaces = workspaces.map(normalizeWorkspaceMembers);

    res.json({
      workspaces: normalizedWorkspaces,
      count: normalizedWorkspaces.length,
    });
  } catch (error) {
    logger.error('[getUserWorkspaces] Error:', error);
    res.status(500).json({
      message: 'Error retrieving workspaces',
      error: error.message,
    });
  }
};

/**
 * Get single workspace by ID or slug
 * GET /api/workspaces/:identifier
 */
const getWorkspace = async (req, res) => {
  try {
    const { identifier } = req.params;
    const userId = req.user.id;

    // Try to find by workspaceId or slug
    let workspace = await Workspace.findOne({
      $or: [{ workspaceId: identifier }, { slug: identifier }],
      isActive: true,
      isArchived: false,
    })
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name email');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user has access
    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied to this workspace' });
    }

    // Normalize workspace before sending
    const normalizedWorkspace = normalizeWorkspaceMembers(workspace);

    res.json({ workspace: normalizedWorkspace });
  } catch (error) {
    logger.error('[getWorkspace] Error:', error);
    res.status(500).json({
      message: 'Error retrieving workspace',
      error: error.message,
    });
  }
};

/**
 * Create new workspace
 * POST /api/workspaces
 */
const createWorkspace = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, color, settings } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    if (name.length > 100) {
      return res.status(400).json({ message: 'Workspace name must be less than 100 characters' });
    }

    // Check if workspace with this name already exists
    const existingWorkspace = await Workspace.findOne({
      name: name.trim(),
      isArchived: false,
    });

    if (existingWorkspace) {
      return res.status(409).json({
        message: 'A workspace with this name already exists. Please choose a different name.',
        error: 'WORKSPACE_NAME_EXISTS',
      });
    }

    // Generate slug
    const slug = await Workspace.generateSlug(name);

    // Create workspace
    const workspace = new Workspace({
      name: name.trim(),
      description: description?.trim() || '',
      slug,
      color: color || '#3b82f6',
      createdBy: userId,
      members: [
        {
          user: userId,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
      settings: settings || {},
    });

    await workspace.save();

    // Populate for response
    await workspace.populate('members.user', 'name email avatar');
    await workspace.populate('createdBy', 'name email');

    logger.info(`[createWorkspace] Workspace created: ${workspace.workspaceId} by user ${userId}`);

    // Normalize workspace before sending
    const normalizedWorkspace = normalizeWorkspaceMembers(workspace);

    res.status(201).json({
      message: 'Workspace created successfully',
      workspace: normalizedWorkspace,
    });
  } catch (error) {
    logger.error('[createWorkspace] Error:', error);

    // Handle MongoDB duplicate key error (E11000)
    if (error.code === 11000 && error.keyPattern?.name) {
      return res.status(409).json({
        message: 'A workspace with this name already exists.',
        error: 'WORKSPACE_NAME_EXISTS',
      });
    }

    res.status(500).json({
      message: 'Error creating workspace',
      error: error.message,
    });
  }
};

/**
 * Update workspace
 * PATCH /api/workspaces/:workspaceId
 */
const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;
    const { name, description, color, settings } = req.body;

    const workspace = await Workspace.findOne({ workspaceId });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user has admin or owner permission
    if (!workspace.hasPermission(userId, 'admin')) {
      return res.status(403).json({
        message: 'You do not have permission to update this workspace',
      });
    }

    // Update fields
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Workspace name cannot be empty' });
      }

      // Check if another workspace with this name already exists (excluding current workspace)
      const existingWorkspace = await Workspace.findOne({
        name: name.trim(),
        workspaceId: { $ne: workspaceId }, // Exclude current workspace
        isArchived: false,
      });

      if (existingWorkspace) {
        return res.status(409).json({
          message: 'A workspace with this name already exists.',
          error: 'WORKSPACE_NAME_EXISTS',
        });
      }

      workspace.name = name.trim();

      // Regenerate slug if name changed significantly
      if (name.trim() !== workspace.name) {
        workspace.slug = await Workspace.generateSlug(name);
      }
    }

    if (description !== undefined) {
      workspace.description = description.trim();
    }

    if (color !== undefined) {
      workspace.color = color;
    }

    if (settings !== undefined) {
      workspace.settings = { ...workspace.settings, ...settings };
    }

    await workspace.save();
    await workspace.populate('members.user', 'name email avatar');
    await workspace.populate('createdBy', 'name email');

    logger.info(`[updateWorkspace] Workspace updated: ${workspaceId} by user ${userId}`);

    // Normalize workspace before sending
    const normalizedWorkspace = normalizeWorkspaceMembers(workspace);

    res.json({
      message: 'Workspace updated successfully',
      workspace: normalizedWorkspace,
    });
  } catch (error) {
    logger.error('[updateWorkspace] Error:', error);
    res.status(500).json({
      message: 'Error updating workspace',
      error: error.message,
    });
  }
};

/**
 * Delete (archive) workspace
 * DELETE /api/workspaces/:workspaceId
 */
const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const workspace = await Workspace.findOne({ workspaceId });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owners can delete workspace
    if (!workspace.hasPermission(userId, 'owner')) {
      return res.status(403).json({
        message: 'Only workspace owners can delete the workspace',
      });
    }

    // Extract workspace IDs for cleanup queries (before deletion)
    const workspaceIdString = workspace.workspaceId;
    const workspaceObjectIdString = workspace._id?.toString();

    // Clean up workspace resources - delete conversations/messages and unlink others from workspace
    // IMPORTANT: Workspace document deletion moved to END to ensure namespace resolution works during file deletion

    try {
      // Get all conversations related to this workspace. Older records may use ObjectId as string,
      // while some use workspaceId string. Query both for compatibility.
      const workspaceConversations = await Conversation.find(
        { workspace: { $in: [workspaceIdString, workspaceObjectIdString] } },
        { conversationId: 1 },
      ).lean();
      const conversationIds = workspaceConversations.map((c) => c.conversationId);

      // Get all files related to this workspace for physical deletion
      const workspaceFiles = await File.find({
        workspace: { $in: [workspaceIdString, workspaceObjectIdString] },
      }).lean();

      // Delete physical files from storage (local/S3/Firebase/Azure) and RAG vectorstore
      const fileDeletionResults = { deleted: [], failed: [], totalDeleted: 0, totalFailed: 0 };
      if (workspaceFiles.length > 0) {
        try {
          const result = await processDeleteRequest({
            req,
            files: workspaceFiles,
          });

          fileDeletionResults.deleted = result.deleted || [];
          fileDeletionResults.failed = result.failed || [];
          fileDeletionResults.totalDeleted = result.totalDeleted || 0;
          fileDeletionResults.totalFailed = result.totalFailed || 0;

          logger.info(
            `[deleteWorkspace] Physical files deleted: ${result.totalDeleted}/${result.totalRequested}, ` +
              `failed: ${result.totalFailed}`,
          );
        } catch (error) {
          logger.error('[deleteWorkspace] Error during physical file deletion:', error);
          // Continue with other deletions even if file deletion fails
        }
      }

      // Delete all conversations in this workspace
      const conversationResult = await Conversation.deleteMany({
        workspace: { $in: [workspaceIdString, workspaceObjectIdString] },
      });
      logger.info(
        `[deleteWorkspace] Deleted ${conversationResult.deletedCount} conversations from workspace ${workspaceId}`,
      );

      // Delete associated messages (if conversations were found)
      let messageDeleteCount = 0;
      if (conversationIds.length > 0) {
        const messageDeleteResult = await Message.deleteMany({
          conversationId: { $in: conversationIds },
        });
        messageDeleteCount = messageDeleteResult.deletedCount;
        logger.info(
          `[deleteWorkspace] Deleted ${messageDeleteCount} messages from ${conversationIds.length} conversations`,
        );
      }

      // Delete agents from workspace
      const agentResult = await Agent.deleteMany({
        workspace: { $in: [workspaceIdString, workspaceObjectIdString] },
      });
      logger.info(
        `[deleteWorkspace] Deleted ${agentResult.deletedCount} agents from workspace ${workspaceId}`,
      );

      // Delete prompts from workspace
      const promptResult = await Prompt.deleteMany({
        workspace: { $in: [workspaceIdString, workspaceObjectIdString] },
      });
      logger.info(
        `[deleteWorkspace] Deleted ${promptResult.deletedCount} prompts from workspace ${workspaceId}`,
      );

      // Note: Files already deleted by processDeleteRequest above (physical + RAG + MongoDB)

      // Remove activity logs tied to this workspace
      const activityResult = await Activity.deleteMany({ workspace: workspace._id });
      logger.info(
        `[deleteWorkspace] Deleted ${activityResult.deletedCount} activity records for workspace ${workspaceId}`,
      );

      // FINAL STEP: Delete workspace document from MongoDB (moved from line 311)
      // This ensures workspace exists during file cleanup for proper namespace resolution
      await Workspace.deleteOne({ _id: workspace._id });

      logger.info(`[deleteWorkspace] Workspace deleted: ${workspaceId} by user ${userId}`);

      // Return comprehensive deletion summary
      res.json({
        message: 'Workspace deleted successfully',
        workspaceId,
        deletionSummary: {
          workspace: 1,
          conversations: conversationResult.deletedCount,
          messages: messageDeleteCount,
          agents: agentResult.deletedCount,
          prompts: promptResult.deletedCount,
          files: {
            total: workspaceFiles.length,
            physicalDeleted: fileDeletionResults.totalDeleted,
            physicalFailed: fileDeletionResults.totalFailed,
            failedFiles: fileDeletionResults.failed,
          },
          activities: activityResult.deletedCount,
        },
      });
    } catch (cleanupError) {
      logger.error('[deleteWorkspace] Error during resource cleanup:', cleanupError);
      // Workspace NOT deleted if cleanup fails - provides atomic-like behavior and allows retry
      res.status(500).json({
        message: 'Error deleting workspace resources',
        workspaceId,
        error: cleanupError.message,
      });
    }
  } catch (error) {
    logger.error('[deleteWorkspace] Error:', error);
    res.status(500).json({
      message: 'Error deleting workspace',
      error: error.message,
    });
  }
};

/**
 * Add member to workspace
 * POST /api/workspaces/:workspaceId/members
 */
const addMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;
    const { memberUserId, role } = req.body;

    if (!memberUserId) {
      return res.status(400).json({ message: 'Member user ID is required' });
    }

    const workspace = await Workspace.findOne({ workspaceId });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user has admin permission
    if (!workspace.hasPermission(userId, 'admin')) {
      return res.status(403).json({
        message: 'You do not have permission to add members',
      });
    }

    // Validate role
    const validRoles = ['admin', 'member', 'viewer'];
    const memberRole = role && validRoles.includes(role) ? role : 'member';

    // Add member
    await workspace.addMember(memberUserId, memberRole, userId);
    await workspace.populate('members.user', 'name email avatar');

    logger.info(
      `[addMember] Member ${memberUserId} added to workspace ${workspaceId} by user ${userId}`,
    );

    // Normalize workspace before sending
    const normalizedWorkspace = normalizeWorkspaceMembers(workspace);

    res.json({
      message: 'Member added successfully',
      workspace: normalizedWorkspace,
    });
  } catch (error) {
    logger.error('[addMember] Error:', error);
    res.status(500).json({
      message: error.message || 'Error adding member',
    });
  }
};

/**
 * Update member role
 * PATCH /api/workspaces/:workspaceId/members/:memberUserId
 */
const updateMemberRole = async (req, res) => {
  try {
    const { workspaceId, memberUserId } = req.params;
    const userId = req.user.id;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const validRoles = ['owner', 'admin', 'member', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const workspace = await Workspace.findOne({ workspaceId });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only the workspace creator can have the owner role
    if (role === 'owner' && memberUserId !== workspace.createdBy.toString()) {
      return res.status(403).json({
        message: 'Only the workspace creator can be assigned the owner role',
      });
    }

    // Check if user has admin permission (or owner for changing to owner)
    const requiredPermission = role === 'owner' ? 'owner' : 'admin';
    if (!workspace.hasPermission(userId, requiredPermission)) {
      return res.status(403).json({
        message: 'You do not have permission to update member roles',
      });
    }

    await workspace.updateMemberRole(memberUserId, role);
    await workspace.populate('members.user', 'name email avatar');

    logger.info(
      `[updateMemberRole] Member ${memberUserId} role updated to ${role} in workspace ${workspaceId}`,
    );

    // Normalize workspace before sending
    const normalizedWorkspace = normalizeWorkspaceMembers(workspace);

    res.json({
      message: 'Member role updated successfully',
      workspace: normalizedWorkspace,
    });
  } catch (error) {
    logger.error('[updateMemberRole] Error:', error);
    res.status(500).json({
      message: error.message || 'Error updating member role',
    });
  }
};

/**
 * Remove member from workspace
 * DELETE /api/workspaces/:workspaceId/members/:memberUserId
 */
const removeMember = async (req, res) => {
  try {
    const { workspaceId, memberUserId } = req.params;
    const userId = req.user.id;

    const workspace = await Workspace.findOne({ workspaceId });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check permissions: admin can remove, or user can remove themselves
    const isAdmin = workspace.hasPermission(userId, 'admin');
    const isSelf = userId === memberUserId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        message: 'You do not have permission to remove this member',
      });
    }

    await workspace.removeMember(memberUserId);
    await workspace.populate('members.user', 'name email avatar');

    logger.info(
      `[removeMember] Member ${memberUserId} removed from workspace ${workspaceId} by user ${userId}`,
    );

    // Normalize workspace before sending
    const normalizedWorkspace = normalizeWorkspaceMembers(workspace);

    res.json({
      message: 'Member removed successfully',
      workspace: normalizedWorkspace,
    });
  } catch (error) {
    logger.error('[removeMember] Error:', error);
    res.status(500).json({
      message: error.message || 'Error removing member',
    });
  }
};

/**
 * Get workspace statistics
 * GET /api/workspaces/:workspaceId/stats
 */
const getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const workspace = await Workspace.findOne({ workspaceId });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user has access
    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied to this workspace' });
    }

    // Get detailed stats in parallel for better performance
    // Use workspaceId string instead of ObjectId for consistency with schema
    const [conversationCount, agentCount, promptCount, fileCount, recentConversations] =
      await Promise.all([
        Conversation.countDocuments({ workspace: workspaceId }),
        Agent.countDocuments({ workspace: workspaceId }),
        Prompt.countDocuments({ workspace: workspaceId }),
        File.countDocuments({ workspace: workspaceId }),
        Conversation.find({ workspace: workspaceId })
          .sort({ updatedAt: -1 })
          .limit(5)
          .select('conversationId title updatedAt')
          .lean(),
      ]);

    const stats = {
      memberCount: workspace.memberCount,
      conversationCount,
      agentCount,
      promptCount,
      fileCount,
      tokenUsage: workspace.stats.tokenUsage,
      lastActivityAt: workspace.stats.lastActivityAt,
      recentConversations,
    };

    res.json({ stats });
  } catch (error) {
    logger.error('[getWorkspaceStats] Error:', error);
    res.status(500).json({
      message: 'Error retrieving workspace statistics',
      error: error.message,
    });
  }
};

/**
 * Leave workspace (self-remove)
 * POST /api/workspaces/:workspaceId/leave
 */
const leaveWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const workspace = await Workspace.findOne({ workspaceId });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (!workspace.isMember(userId)) {
      return res.status(400).json({ message: 'You are not a member of this workspace' });
    }

    // Cannot leave if you're the last owner
    const memberRole = workspace.getMemberRole(userId);
    if (memberRole === 'owner') {
      const ownerCount = workspace.members.filter((m) => m.role === 'owner').length;
      if (ownerCount === 1) {
        return res.status(400).json({
          message:
            'Cannot leave workspace as the last owner. Transfer ownership or delete the workspace.',
        });
      }
    }

    await workspace.removeMember(userId);

    logger.info(`[leaveWorkspace] User ${userId} left workspace ${workspaceId}`);

    res.json({
      message: 'Successfully left workspace',
      workspaceId,
    });
  } catch (error) {
    logger.error('[leaveWorkspace] Error:', error);
    res.status(500).json({
      message: error.message || 'Error leaving workspace',
    });
  }
};

/**
 * Update workspace available models (owner only)
 * PUT /api/workspaces/:workspaceId/settings/models
 */
const updateWorkspaceModels = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;
    const { availableModels, availableEndpoints } = req.body;

    const workspace = await Workspace.findOne({ workspaceId });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner can configure models
    if (!workspace.hasPermission(userId, 'owner')) {
      return res.status(403).json({
        message: 'Only workspace owners can configure available models',
      });
    }

    // Update settings
    if (availableModels !== undefined) {
      workspace.settings.availableModels = availableModels;
    }
    if (availableEndpoints !== undefined) {
      workspace.settings.availableEndpoints = availableEndpoints;
    }

    await workspace.save();

    logger.info(
      `[updateWorkspaceModels] Models configuration updated for workspace ${workspaceId}`,
    );

    res.json({
      message: 'Workspace models configuration updated successfully',
      settings: {
        availableModels: workspace.settings.availableModels,
        availableEndpoints: workspace.settings.availableEndpoints,
      },
    });
  } catch (error) {
    logger.error('[updateWorkspaceModels] Error:', error);
    res.status(500).json({
      message: error.message || 'Error updating workspace models',
    });
  }
};

/**
 * Update workspace start page (owner/admin)
 * PUT /api/workspaces/:workspaceId/settings/start-page
 */
const updateWorkspaceStartPage = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;
    const { enabled, title, content, showStats, customLinks } = req.body;

    const workspace = await Workspace.findOne({ workspaceId });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Owner or admin can configure start page
    if (!workspace.hasPermission(userId, 'admin')) {
      return res.status(403).json({
        message: 'Only workspace owners/admins can configure start page',
      });
    }

    // Update start page settings
    if (enabled !== undefined) {
      workspace.settings.startPage.enabled = enabled;
    }
    if (title !== undefined) {
      workspace.settings.startPage.title = title;
    }
    if (content !== undefined) {
      workspace.settings.startPage.content = content;
    }
    if (showStats !== undefined) {
      workspace.settings.startPage.showStats = showStats;
    }
    if (customLinks !== undefined) {
      workspace.settings.startPage.customLinks = customLinks;
    }

    await workspace.save();

    logger.info(`[updateWorkspaceStartPage] Start page updated for workspace ${workspaceId}`);

    res.json({
      message: 'Workspace start page updated successfully',
      startPage: workspace.settings.startPage,
    });
  } catch (error) {
    logger.error('[updateWorkspaceStartPage] Error:', error);
    res.status(500).json({
      message: error.message || 'Error updating workspace start page',
    });
  }
};

/**
 * Update workspace information (owner/admin)
 * PUT /api/workspaces/:workspaceId/settings/information
 */
const updateWorkspaceInformation = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;
    const { description, welcomeMessage, guidelines } = req.body;

    const workspace = await Workspace.findOne({ workspaceId });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Owner or admin can update workspace information
    if (!workspace.hasPermission(userId, 'admin')) {
      return res.status(403).json({
        message: 'Only workspace owners/admins can update workspace information',
      });
    }

    // Update description (main workspace field)
    if (description !== undefined) {
      workspace.description = description;
    }

    // Update welcome message and guidelines (in settings)
    if (welcomeMessage !== undefined) {
      workspace.settings.welcomeMessage = welcomeMessage;
    }
    if (guidelines !== undefined) {
      workspace.settings.guidelines = guidelines;
    }

    await workspace.save();

    logger.info(`[updateWorkspaceInformation] Information updated for workspace ${workspaceId}`);

    res.json({
      message: 'Workspace information updated successfully',
      information: {
        description: workspace.description,
        welcomeMessage: workspace.settings.welcomeMessage,
        guidelines: workspace.settings.guidelines,
      },
    });
  } catch (error) {
    logger.error('[updateWorkspaceInformation] Error:', error);
    res.status(500).json({
      message: error.message || 'Error updating workspace information',
    });
  }
};

/**
 * Get workspace start page (all members)
 * GET /api/workspaces/:workspaceId/start-page
 */
const getWorkspaceStartPage = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const workspace = await Workspace.findOne({ workspaceId, isActive: true, isArchived: false })
      .select(
        'name description avatar color settings.startPage settings.welcomeMessage settings.guidelines stats members',
      )
      .populate({
        path: 'members.user',
        select: 'name email username avatar',
      })
      .lean();

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user has access
    const fullWorkspace = await Workspace.findOne({ workspaceId });
    if (!fullWorkspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied to this workspace' });
    }

    // Replace {workspace_name} placeholder in title
    const startPage = workspace.settings?.startPage || {};
    if (startPage.title) {
      startPage.title = startPage.title.replace('{workspace_name}', workspace.name);
    }

    // Normalize members data
    const members = (workspace.members || []).map((member) => {
      const userData = member.user;
      return {
        userId: typeof userData === 'string' ? userData : userData?._id || userData?.id,
        name: typeof userData === 'object' ? userData.name : undefined,
        email: typeof userData === 'object' ? userData.email : undefined,
        username: typeof userData === 'object' ? userData.username : undefined,
        avatar: typeof userData === 'object' ? userData.avatar : undefined,
        role: member.role,
        joinedAt: member.joinedAt,
      };
    });

    // Calculate stats dynamically and fetch activity data in parallel for optimal performance
    const [
      conversationCount,
      messageCount,
      tokenUsage,
      agentCount,
      promptCount,
      fileCount,
      recentActivity,
      pinnedAgents,
      pinnedPrompts,
      topContributors,
      recentShared,
    ] = await Promise.all([
      // Use workspaceId string instead of ObjectId
      Conversation.countDocuments({ workspace: workspaceId }),
      // For message count, we need to count messages in conversations belonging to this workspace
      Conversation.find({ workspace: workspaceId })
        .select('conversationId')
        .lean()
        .then(async (convos) => {
          const conversationIds = convos.map((c) => c.conversationId);
          if (conversationIds.length === 0) {
            return 0;
          }
          return await Message.countDocuments({ conversationId: { $in: conversationIds } });
        }),
      // Token usage would ideally come from Transaction model aggregation
      // For now, use the stored value (can be enhanced later)
      Promise.resolve(workspace.stats?.tokenUsage || 0),
      // Resource counts - use workspaceId string for consistency
      Agent.countDocuments({ workspace: workspaceId }),
      Prompt.countDocuments({ workspace: workspaceId }),
      File.countDocuments({ workspace: workspaceId }),
      // Activity data
      getWorkspaceActivity(fullWorkspace._id.toString(), 10),
      // Pinned resources - use workspaceId string
      Agent.find({ workspace: workspaceId, isPinned: true })
        .select('id name description author createdAt updatedAt')
        .populate('author', 'name email username avatar')
        .sort({ pinnedAt: -1 })
        .limit(5)
        .lean(),
      Prompt.find({ workspace: workspaceId, isPinned: true })
        .select('id name prompt author createdAt updatedAt')
        .populate('author', 'name email username avatar')
        .sort({ pinnedAt: -1 })
        .limit(5)
        .lean(),
      // Top contributors and recent shared resources
      getTopContributors(fullWorkspace._id.toString(), 5),
      getRecentSharedResources(fullWorkspace._id.toString(), 5),
    ]);

    const stats = {
      conversationCount,
      messageCount,
      tokenUsage,
      agentCount,
      promptCount,
      fileCount,
      lastActivityAt: workspace.stats?.lastActivityAt || null,
    };

    res.json({
      workspaceId: workspaceId,
      workspaceName: workspace.name,
      description: workspace.description,
      avatar: workspace.avatar,
      color: workspace.color,
      startPage,
      stats,
      members,
      welcomeMessage: workspace.settings?.welcomeMessage || '',
      guidelines: workspace.settings?.guidelines || '',
      // Enhanced start page data
      recentActivity,
      pinnedResources: {
        agents: pinnedAgents,
        prompts: pinnedPrompts,
      },
      topContributors,
      recentShared,
    });
  } catch (error) {
    logger.error('[getWorkspaceStartPage] Error:', error);
    res.status(500).json({
      message: error.message || 'Error retrieving workspace start page',
    });
  }
};

module.exports = {
  getUserWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  updateMemberRole,
  removeMember,
  getWorkspaceStats,
  leaveWorkspace,
  updateWorkspaceModels,
  updateWorkspaceStartPage,
  updateWorkspaceInformation,
  getWorkspaceStartPage,
};
