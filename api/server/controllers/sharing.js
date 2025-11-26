const { logger } = require('@librechat/data-schemas');
const { Agent, Prompt, File } = require('~/db/models');
const Workspace = require('~/models/Workspace');

/**
 * Get model for resource type
 */
const getModelForResource = (resourceType) => {
  const models = {
    agent: Agent,
    prompt: Prompt,
    file: File,
  };
  return models[resourceType];
};

/**
 * Find resource by ID using the appropriate field
 * Agents and Prompts use custom ID fields (id), Files use _id
 */
const findResourceById = async (resourceType, resourceId) => {
  const Model = getModelForResource(resourceType);

  if (resourceType === 'agent') {
    // Agents use 'id' field (e.g., 'agent_WQs-364xoQFzR-fSmAggH')
    return await Model.findOne({ id: resourceId });
  } else if (resourceType === 'prompt') {
    // Prompts use 'id' field (e.g., 'prompt_xyz')
    return await Model.findOne({ id: resourceId });
  } else {
    // Files use MongoDB _id
    return await Model.findById(resourceId);
  }
};

/**
 * Share a resource with workspace
 * POST /api/:resourceType/:resourceId/share
 */
const shareResource = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const userId = req.user.id;
    const { visibility, sharedWith } = req.body;

    // Validate resource type
    if (!['agent', 'prompt', 'file'].includes(resourceType)) {
      return res.status(400).json({ message: 'Invalid resource type' });
    }

    // Validate visibility
    if (!['private', 'workspace', 'shared_with', 'global'].includes(visibility)) {
      return res.status(400).json({ message: 'Invalid visibility value' });
    }

    const resource = await findResourceById(resourceType, resourceId);

    if (!resource) {
      return res.status(404).json({ message: `${resourceType} not found` });
    }

    // Check if user is the author/owner
    const authorField = resourceType === 'file' ? 'user' : 'author';
    if (resource[authorField].toString() !== userId) {
      return res.status(403).json({
        message: 'Only resource owner can change sharing settings',
      });
    }

    // Verify workspace membership if sharing with workspace
    if (visibility === 'workspace' && resource.workspace) {
      const workspace = await Workspace.findById(resource.workspace);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }

      if (!workspace.isMember(userId)) {
        return res.status(403).json({
          message: 'You must be a workspace member to share resources',
        });
      }
    }

    // Update visibility
    resource.visibility = visibility;

    // Update sharedWith if provided
    if (visibility === 'shared_with' && sharedWith && Array.isArray(sharedWith)) {
      resource.sharedWith = sharedWith;
    } else if (visibility !== 'shared_with') {
      resource.sharedWith = [];
    }

    await resource.save();

    logger.info(
      `[shareResource] ${resourceType} ${resourceId} shared as ${visibility} by user ${userId}`,
    );

    res.json({
      message: `${resourceType} sharing settings updated successfully`,
      resource: {
        id: resource._id || resource.id,
        visibility: resource.visibility,
        sharedWith: resource.sharedWith,
      },
    });
  } catch (error) {
    logger.error('[shareResource] Error:', error);
    res.status(500).json({
      message: 'Error updating sharing settings',
      error: error.message,
    });
  }
};

/**
 * Unshare a resource (set to private)
 * POST /api/:resourceType/:resourceId/unshare
 */
const unshareResource = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const userId = req.user.id;

    if (!['agent', 'prompt', 'file'].includes(resourceType)) {
      return res.status(400).json({ message: 'Invalid resource type' });
    }

    const resource = await findResourceById(resourceType, resourceId);

    if (!resource) {
      return res.status(404).json({ message: `${resourceType} not found` });
    }

    // Check if user is the author/owner
    const authorField = resourceType === 'file' ? 'user' : 'author';
    if (resource[authorField].toString() !== userId) {
      return res.status(403).json({
        message: 'Only resource owner can change sharing settings',
      });
    }

    // Set to private
    resource.visibility = 'private';
    resource.sharedWith = [];

    await resource.save();

    logger.info(`[unshareResource] ${resourceType} ${resourceId} set to private by user ${userId}`);

    res.json({
      message: `${resourceType} unshared successfully`,
      resource: {
        id: resource._id || resource.id,
        visibility: resource.visibility,
      },
    });
  } catch (error) {
    logger.error('[unshareResource] Error:', error);
    res.status(500).json({
      message: 'Error unsharing resource',
      error: error.message,
    });
  }
};

/**
 * Update resource visibility
 * PATCH /api/:resourceType/:resourceId/visibility
 */
const updateVisibility = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const userId = req.user.id;
    const { visibility, sharedWith } = req.body;

    if (!['agent', 'prompt', 'file'].includes(resourceType)) {
      return res.status(400).json({ message: 'Invalid resource type' });
    }

    if (!['private', 'workspace', 'shared_with', 'global'].includes(visibility)) {
      return res.status(400).json({ message: 'Invalid visibility value' });
    }

    const resource = await findResourceById(resourceType, resourceId);

    if (!resource) {
      return res.status(404).json({ message: `${resourceType} not found` });
    }

    // Check if user is the author/owner
    const authorField = resourceType === 'file' ? 'user' : 'author';
    if (resource[authorField].toString() !== userId) {
      return res.status(403).json({
        message: 'Only resource owner can change visibility settings',
      });
    }

    resource.visibility = visibility;

    if (visibility === 'shared_with' && sharedWith && Array.isArray(sharedWith)) {
      resource.sharedWith = sharedWith;
    } else {
      resource.sharedWith = [];
    }

    await resource.save();

    logger.info(
      `[updateVisibility] ${resourceType} ${resourceId} visibility updated to ${visibility}`,
    );

    res.json({
      message: 'Visibility updated successfully',
      resource: {
        id: resource._id || resource.id,
        visibility: resource.visibility,
        sharedWith: resource.sharedWith,
      },
    });
  } catch (error) {
    logger.error('[updateVisibility] Error:', error);
    res.status(500).json({
      message: 'Error updating visibility',
      error: error.message,
    });
  }
};

/**
 * Get shared resources in workspace
 * GET /api/:resourceType/workspace/:workspaceId/shared
 */
const getSharedResources = async (req, res) => {
  try {
    const { resourceType, workspaceId } = req.params;
    const userId = req.user.id;

    if (!['agent', 'prompt', 'file'].includes(resourceType)) {
      return res.status(400).json({ message: 'Invalid resource type' });
    }

    // Verify workspace membership
    const workspace = await Workspace.findOne({ workspaceId });
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied to this workspace' });
    }

    const Model = getModelForResource(resourceType);
    const authorField = resourceType === 'file' ? 'user' : 'author';

    // Query for resources visible to user in this workspace
    const query = {
      workspace: workspace._id,
      $or: [
        { [authorField]: userId }, // User's own resources
        { visibility: 'workspace' }, // Workspace-wide shared
        { visibility: 'shared_with', sharedWith: userId }, // Shared with user specifically
      ],
    };

    const resources = await Model.find(query)
      .populate(authorField, 'name email avatar username')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      resources,
      count: resources.length,
    });
  } catch (error) {
    logger.error('[getSharedResources] Error:', error);
    res.status(500).json({
      message: 'Error retrieving shared resources',
      error: error.message,
    });
  }
};

/**
 * Pin a resource to workspace start page
 * POST /api/:resourceType/:resourceId/pin
 */
const pinResource = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const userId = req.user.id;

    if (!['agent', 'prompt', 'file'].includes(resourceType)) {
      return res.status(400).json({ message: 'Invalid resource type' });
    }

    const resource = await findResourceById(resourceType, resourceId);

    if (!resource) {
      return res.status(404).json({ message: `${resourceType} not found` });
    }

    // Verify workspace membership and admin/owner role
    if (!resource.workspace) {
      return res.status(400).json({ message: 'Resource not in a workspace' });
    }

    const workspace = await Workspace.findOne({ workspaceId: resource.workspace });
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (!workspace.hasPermission(userId, 'admin')) {
      return res.status(403).json({
        message: 'Only workspace admins/owners can pin resources',
      });
    }

    // Pin the resource
    resource.isPinned = true;
    resource.pinnedAt = new Date();
    resource.pinnedBy = userId;

    await resource.save();

    logger.info(`[pinResource] ${resourceType} ${resourceId} pinned by user ${userId}`);

    res.json({
      message: `${resourceType} pinned successfully`,
      resource: {
        id: resource._id || resource.id,
        isPinned: resource.isPinned,
        pinnedAt: resource.pinnedAt,
      },
    });
  } catch (error) {
    logger.error('[pinResource] Error:', error);
    res.status(500).json({
      message: 'Error pinning resource',
      error: error.message,
    });
  }
};

/**
 * Unpin a resource from workspace start page
 * DELETE /api/:resourceType/:resourceId/pin
 */
const unpinResource = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const userId = req.user.id;

    if (!['agent', 'prompt', 'file'].includes(resourceType)) {
      return res.status(400).json({ message: 'Invalid resource type' });
    }

    const resource = await findResourceById(resourceType, resourceId);

    if (!resource) {
      return res.status(404).json({ message: `${resourceType} not found` });
    }

    // Verify workspace membership and admin/owner role
    if (!resource.workspace) {
      return res.status(400).json({ message: 'Resource not in a workspace' });
    }

    const workspace = await Workspace.findOne({ workspaceId: resource.workspace });
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (!workspace.hasPermission(userId, 'admin')) {
      return res.status(403).json({
        message: 'Only workspace admins/owners can unpin resources',
      });
    }

    // Unpin the resource
    resource.isPinned = false;
    resource.pinnedAt = null;
    resource.pinnedBy = null;

    await resource.save();

    logger.info(`[unpinResource] ${resourceType} ${resourceId} unpinned by user ${userId}`);

    res.json({
      message: `${resourceType} unpinned successfully`,
      resource: {
        id: resource._id || resource.id,
        isPinned: resource.isPinned,
      },
    });
  } catch (error) {
    logger.error('[unpinResource] Error:', error);
    res.status(500).json({
      message: 'Error unpinning resource',
      error: error.message,
    });
  }
};

module.exports = {
  shareResource,
  unshareResource,
  updateVisibility,
  getSharedResources,
  pinResource,
  unpinResource,
};
