const { logger } = require('@librechat/data-schemas');
const Workspace = require('~/models/Workspace');

/**
 * Middleware to check if user has access to workspace
 * Attaches workspace object to req.workspace
 */
const checkWorkspaceAccess = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    const workspace = await Workspace.findOne({
      workspaceId,
      isActive: true,
      isArchived: false,
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied to this workspace' });
    }

    // Attach workspace and user role to request
    req.workspace = workspace;
    req.workspaceRole = workspace.getMemberRole(userId);

    next();
  } catch (error) {
    logger.error('[checkWorkspaceAccess] Error:', error);
    res.status(500).json({ message: 'Error checking workspace access' });
  }
};

/**
 * Middleware to check if user has specific permission level
 * Must be used after checkWorkspaceAccess
 */
const requireWorkspacePermission = (requiredRole) => {
  return (req, res, next) => {
    if (!req.workspace) {
      return res.status(500).json({ message: 'Workspace not loaded' });
    }

    const userId = req.user.id;
    if (!req.workspace.hasPermission(userId, requiredRole)) {
      return res.status(403).json({
        message: `You need ${requiredRole} permission to perform this action`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if resource belongs to workspace
 * Checks if conversation/agent/prompt/file belongs to the workspace
 */
const checkResourceWorkspace = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const resourceId = req.params[resourceIdParam] || req.body[resourceIdParam];

      if (!resourceId) {
        return res.status(400).json({ message: 'Resource ID is required' });
      }

      const Model = require(`~/db/models`)[resourceModel];
      if (!Model) {
        return res.status(500).json({ message: 'Invalid resource model' });
      }

      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({ message: `${resourceModel} not found` });
      }

      // Check if resource belongs to workspace
      if (resource.workspace && resource.workspace.toString() !== workspaceId) {
        return res.status(403).json({
          message: `This ${resourceModel.toLowerCase()} does not belong to this workspace`,
        });
      }

      // Attach resource to request
      req.workspaceResource = resource;

      next();
    } catch (error) {
      logger.error('[checkResourceWorkspace] Error:', error);
      res.status(500).json({ message: 'Error checking resource workspace' });
    }
  };
};

/**
 * Middleware to check if workspace has budget available
 * Can be used to limit API usage per workspace
 */
const checkWorkspaceBudget = async (req, res, next) => {
  try {
    const workspace = req.workspace;

    if (!workspace) {
      return res.status(500).json({ message: 'Workspace not loaded' });
    }

    // Check if budget is set
    const tokenBudget = workspace.settings.tokenBudget;
    if (tokenBudget === null || tokenBudget === undefined) {
      // No budget limit
      return next();
    }

    // Check if budget exceeded
    if (workspace.stats.tokenUsage >= tokenBudget) {
      return res.status(403).json({
        message: 'Workspace token budget exceeded',
        tokenUsage: workspace.stats.tokenUsage,
        tokenBudget,
      });
    }

    next();
  } catch (error) {
    logger.error('[checkWorkspaceBudget] Error:', error);
    res.status(500).json({ message: 'Error checking workspace budget' });
  }
};

/**
 * Helper to get workspace from conversation, agent, prompt, or file
 * Used to determine workspace context from resource
 */
const getWorkspaceFromResource = async (resourceType, resourceId) => {
  try {
    const Model = require(`~/db/models`)[resourceType];
    if (!Model) {
      return null;
    }

    const resource = await Model.findById(resourceId).select('workspace');
    if (!resource || !resource.workspace) {
      return null;
    }

    const workspace = await Workspace.findOne({
      workspaceId: resource.workspace,
      isActive: true,
      isArchived: false,
    });

    return workspace;
  } catch (error) {
    logger.error('[getWorkspaceFromResource] Error:', error);
    return null;
  }
};

/**
 * Middleware to check if user can access resource based on visibility settings
 * Verifies resource visibility (private, workspace, shared_with)
 */
const checkResourceVisibility = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.resourceId || req.params.file_id || req.params.agent_id || req.params.promptId;
      const userId = req.user.id;

      if (!resourceId) {
        return res.status(400).json({ message: 'Resource ID is required' });
      }

      const Model = require(`~/db/models`)[resourceModel];
      if (!Model) {
        return res.status(500).json({ message: 'Invalid resource model' });
      }

      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({ message: `${resourceModel} not found` });
      }

      // Determine author field (different for files vs other resources)
      const authorField = resourceModel === 'File' ? 'user' : 'author';
      const resourceAuthor = resource[authorField]?.toString();

      // Owner always has access
      if (resourceAuthor === userId) {
        return next();
      }

      // Check visibility settings
      const visibility = resource.visibility || 'private';

      if (visibility === 'private') {
        return res.status(403).json({ message: 'Access denied to this resource' });
      }

      if (visibility === 'workspace') {
        // Check if user is in the workspace
        if (!resource.workspace) {
          return res.status(403).json({ message: 'Resource not in a workspace' });
        }

        const workspace = await Workspace.findById(resource.workspace);
        if (!workspace || !workspace.isMember(userId)) {
          return res.status(403).json({ message: 'Access denied to this workspace resource' });
        }

        return next();
      }

      if (visibility === 'shared_with') {
        // Check if user is in sharedWith list
        const sharedWith = resource.sharedWith || [];
        if (sharedWith.some(id => id.toString() === userId)) {
          return next();
        }

        return res.status(403).json({ message: 'Resource not shared with you' });
      }

      // Default deny
      return res.status(403).json({ message: 'Access denied to this resource' });
    } catch (error) {
      logger.error('[checkResourceVisibility] Error:', error);
      res.status(500).json({ message: 'Error checking resource visibility' });
    }
  };
};

module.exports = {
  checkWorkspaceAccess,
  requireWorkspacePermission,
  checkResourceWorkspace,
  checkWorkspaceBudget,
  getWorkspaceFromResource,
  checkResourceVisibility,
};
