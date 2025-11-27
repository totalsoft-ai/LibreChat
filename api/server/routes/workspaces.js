const express = require('express');
const {
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
} = require('~/server/controllers/workspaces');
const { requireJwtAuth } = require('~/server/middleware');

const router = express.Router();

// All routes require authentication
router.use(requireJwtAuth);

/**
 * @route GET /api/workspaces
 * @desc Get all workspaces for current user
 * @access Private
 */
router.get('/', getUserWorkspaces);

/**
 * @route POST /api/workspaces
 * @desc Create new workspace
 * @access Private
 */
router.post('/', createWorkspace);

/**
 * @route GET /api/workspaces/:identifier
 * @desc Get single workspace by ID or slug
 * @access Private
 */
router.get('/:identifier', getWorkspace);

/**
 * @route PATCH /api/workspaces/:workspaceId
 * @desc Update workspace
 * @access Private (Admin/Owner only)
 */
router.patch('/:workspaceId', updateWorkspace);

/**
 * @route DELETE /api/workspaces/:workspaceId
 * @desc Delete (archive) workspace
 * @access Private (Owner only)
 */
router.delete('/:workspaceId', deleteWorkspace);

/**
 * @route GET /api/workspaces/:workspaceId/stats
 * @desc Get workspace statistics
 * @access Private (Members only)
 */
router.get('/:workspaceId/stats', getWorkspaceStats);

/**
 * @route POST /api/workspaces/:workspaceId/leave
 * @desc Leave workspace (self-remove)
 * @access Private (Members only)
 */
router.post('/:workspaceId/leave', leaveWorkspace);

/**
 * @route POST /api/workspaces/:workspaceId/members
 * @desc Add member to workspace
 * @access Private (Admin/Owner only)
 */
router.post('/:workspaceId/members', addMember);

/**
 * @route PATCH /api/workspaces/:workspaceId/members/:memberUserId
 * @desc Update member role
 * @access Private (Admin/Owner only)
 */
router.patch('/:workspaceId/members/:memberUserId', updateMemberRole);

/**
 * @route DELETE /api/workspaces/:workspaceId/members/:memberUserId
 * @desc Remove member from workspace
 * @access Private (Admin/Owner only, or self)
 */
router.delete('/:workspaceId/members/:memberUserId', removeMember);

/**
 * @route PUT /api/workspaces/:workspaceId/settings/models
 * @desc Update workspace available models
 * @access Private (Owner only)
 */
router.put('/:workspaceId/settings/models', updateWorkspaceModels);

/**
 * @route PUT /api/workspaces/:workspaceId/settings/start-page
 * @desc Update workspace start page
 * @access Private (Admin/Owner only)
 */
router.put('/:workspaceId/settings/start-page', updateWorkspaceStartPage);

/**
 * @route PUT /api/workspaces/:workspaceId/settings/information
 * @desc Update workspace information (description, welcome message, guidelines)
 * @access Private (Admin/Owner only)
 */
router.put('/:workspaceId/settings/information', updateWorkspaceInformation);

/**
 * @route GET /api/workspaces/:workspaceId/start-page
 * @desc Get workspace start page
 * @access Private (Members only)
 */
router.get('/:workspaceId/start-page', getWorkspaceStartPage);

module.exports = router;
