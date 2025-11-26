const { logger } = require('@librechat/data-schemas');
const Activity = require('~/models/Activity');

/**
 * Track an activity in a workspace
 * @param {Object} params - Activity parameters
 * @param {string} params.workspaceId - Workspace ObjectId
 * @param {string} params.userId - User ObjectId
 * @param {string} params.type - Activity type
 * @param {string} [params.resourceType] - Type of resource (agent, prompt, file, etc.)
 * @param {string} [params.resourceId] - Resource identifier
 * @param {string} [params.resourceName] - Human-readable resource name
 * @param {Object} [params.metadata] - Additional metadata
 * @returns {Promise<Activity>} Created activity
 */
const trackActivity = async ({
  workspaceId,
  userId,
  type,
  resourceType = null,
  resourceId = null,
  resourceName = null,
  metadata = {},
}) => {
  try {
    // Don't track if no workspace (personal resources)
    if (!workspaceId) {
      return null;
    }

    const activity = await Activity.create({
      workspace: workspaceId,
      user: userId,
      type,
      resourceType,
      resourceId,
      resourceName,
      metadata,
    });

    logger.debug(
      `[ActivityService] Tracked activity: ${type} by user ${userId} in workspace ${workspaceId}`,
    );

    return activity;
  } catch (error) {
    logger.error('[ActivityService] Error tracking activity:', error);
    // Don't throw - activity tracking failures shouldn't break main functionality
    return null;
  }
};

/**
 * Get recent activities in workspace
 * @param {string} workspaceId - Workspace ObjectId
 * @param {number} [limit=10] - Number of activities to return
 * @returns {Promise<Activity[]>} Recent activities with user details
 */
const getWorkspaceActivity = async (workspaceId, limit = 10) => {
  try {
    const activities = await Activity.getRecentActivities(workspaceId, limit);
    return activities;
  } catch (error) {
    logger.error('[ActivityService] Error getting workspace activities:', error);
    return [];
  }
};

/**
 * Get activities by type
 * @param {string} workspaceId - Workspace ObjectId
 * @param {string} type - Activity type
 * @param {number} [limit=10] - Number of activities to return
 * @returns {Promise<Activity[]>} Activities of specific type
 */
const getActivitiesByType = async (workspaceId, type, limit = 10) => {
  try {
    const activities = await Activity.getActivitiesByType(workspaceId, type, limit);
    return activities;
  } catch (error) {
    logger.error('[ActivityService] Error getting activities by type:', error);
    return [];
  }
};

/**
 * Get user's activities in workspace
 * @param {string} workspaceId - Workspace ObjectId
 * @param {string} userId - User ObjectId
 * @param {number} [limit=10] - Number of activities to return
 * @returns {Promise<Activity[]>} User's activities
 */
const getUserActivities = async (workspaceId, userId, limit = 10) => {
  try {
    const activities = await Activity.getUserActivities(workspaceId, userId, limit);
    return activities;
  } catch (error) {
    logger.error('[ActivityService] Error getting user activities:', error);
    return [];
  }
};

/**
 * Get activities for specific resource
 * @param {string} workspaceId - Workspace ObjectId
 * @param {string} resourceType - Type of resource
 * @param {string} resourceId - Resource identifier
 * @param {number} [limit=10] - Number of activities to return
 * @returns {Promise<Activity[]>} Resource activities
 */
const getResourceActivities = async (workspaceId, resourceType, resourceId, limit = 10) => {
  try {
    const activities = await Activity.getResourceActivities(
      workspaceId,
      resourceType,
      resourceId,
      limit,
    );
    return activities;
  } catch (error) {
    logger.error('[ActivityService] Error getting resource activities:', error);
    return [];
  }
};

/**
 * Get top contributors in workspace
 * @param {string} workspaceId - Workspace ObjectId
 * @param {number} [limit=5] - Number of contributors to return
 * @returns {Promise<Object[]>} Top contributors with activity counts
 */
const getTopContributors = async (workspaceId, limit = 5) => {
  try {
    const contributors = await Activity.getTopContributors(workspaceId, limit);
    return contributors;
  } catch (error) {
    logger.error('[ActivityService] Error getting top contributors:', error);
    return [];
  }
};

/**
 * Get recently shared resources in workspace
 * @param {string} workspaceId - Workspace ObjectId
 * @param {number} [limit=5] - Number of resources to return
 * @returns {Promise<Object[]>} Recently shared resources
 */
const getRecentSharedResources = async (workspaceId, limit = 5) => {
  try {
    const sharedActivities = await Activity.find({
      workspace: workspaceId,
      type: { $in: ['agent_shared', 'prompt_shared', 'file_shared'] },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email avatar username')
      .lean();

    // Transform to include resource details
    const resources = sharedActivities.map((activity) => ({
      type: activity.resourceType,
      id: activity.resourceId,
      name: activity.resourceName,
      sharedBy: activity.user,
      sharedAt: activity.createdAt,
      activityType: activity.type,
    }));

    return resources;
  } catch (error) {
    logger.error('[ActivityService] Error getting recent shared resources:', error);
    return [];
  }
};

/**
 * Track conversation creation
 * Helper function for common activity type
 */
const trackConversationCreated = async (workspaceId, userId, conversationId, conversationTitle) => {
  return trackActivity({
    workspaceId,
    userId,
    type: 'conversation_created',
    resourceType: 'conversation',
    resourceId: conversationId,
    resourceName: conversationTitle || 'New Conversation',
  });
};

/**
 * Track agent sharing
 * Helper function for common activity type
 */
const trackAgentShared = async (workspaceId, userId, agentId, agentName) => {
  return trackActivity({
    workspaceId,
    userId,
    type: 'agent_shared',
    resourceType: 'agent',
    resourceId: agentId,
    resourceName: agentName,
  });
};

/**
 * Track prompt sharing
 * Helper function for common activity type
 */
const trackPromptShared = async (workspaceId, userId, promptId, promptName) => {
  return trackActivity({
    workspaceId,
    userId,
    type: 'prompt_shared',
    resourceType: 'prompt',
    resourceId: promptId,
    resourceName: promptName,
  });
};

/**
 * Track file upload
 * Helper function for common activity type
 */
const trackFileUploaded = async (workspaceId, userId, fileId, fileName) => {
  return trackActivity({
    workspaceId,
    userId,
    type: 'file_uploaded',
    resourceType: 'file',
    resourceId: fileId,
    resourceName: fileName,
  });
};

/**
 * Track member joined
 * Helper function for common activity type
 */
const trackMemberJoined = async (workspaceId, userId, memberName) => {
  return trackActivity({
    workspaceId,
    userId,
    type: 'member_joined',
    resourceType: 'member',
    resourceName: memberName,
  });
};

/**
 * Track resource pinned
 * Helper function for common activity type
 */
const trackResourcePinned = async (workspaceId, userId, resourceType, resourceId, resourceName) => {
  const typeMap = {
    agent: 'agent_pinned',
    prompt: 'prompt_pinned',
  };

  return trackActivity({
    workspaceId,
    userId,
    type: typeMap[resourceType] || `${resourceType}_pinned`,
    resourceType,
    resourceId,
    resourceName,
  });
};

/**
 * Cleanup old activities (for maintenance jobs)
 * @param {number} [daysOld=90] - Delete activities older than this many days
 * @returns {Promise<number>} Number of activities deleted
 */
const cleanupOldActivities = async (daysOld = 90) => {
  try {
    const deletedCount = await Activity.cleanupOldActivities(daysOld);
    logger.info(`[ActivityService] Cleaned up ${deletedCount} old activities`);
    return deletedCount;
  } catch (error) {
    logger.error('[ActivityService] Error cleaning up old activities:', error);
    return 0;
  }
};

module.exports = {
  // Core functions
  trackActivity,
  getWorkspaceActivity,
  getActivitiesByType,
  getUserActivities,
  getResourceActivities,
  getTopContributors,
  getRecentSharedResources,

  // Helper functions
  trackConversationCreated,
  trackAgentShared,
  trackPromptShared,
  trackFileUploaded,
  trackMemberJoined,
  trackResourcePinned,

  // Maintenance
  cleanupOldActivities,
};
