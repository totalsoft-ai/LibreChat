const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'conversation_created',
        'agent_created',
        'agent_shared',
        'agent_pinned',
        'prompt_created',
        'prompt_shared',
        'prompt_pinned',
        'file_uploaded',
        'file_shared',
        'member_joined',
        'member_left',
        'workspace_created',
        'workspace_updated',
      ],
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      enum: ['conversation', 'agent', 'prompt', 'file', 'member', 'workspace'],
    },
    resourceId: {
      type: String,
    },
    resourceName: {
      type: String,
    },
    metadata: {
      type: Object,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
      expires: 7776000, // 90 days in seconds
    },
  },
  {
    timestamps: false, // We only need createdAt
  },
);

// Compound indexes for efficient queries
activitySchema.index({ workspace: 1, createdAt: -1 }); // Get recent activities in workspace
activitySchema.index({ workspace: 1, type: 1, createdAt: -1 }); // Get recent activities by type
activitySchema.index({ workspace: 1, user: 1, createdAt: -1 }); // Get user activities in workspace
activitySchema.index({ workspace: 1, resourceType: 1, resourceId: 1 }); // Get activities for specific resource

// Virtual for formatted time ago
activitySchema.virtual('timeAgo').get(function () {
  const now = Date.now();
  const diff = now - this.createdAt.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  }
  if (hours > 0) {
    return `${hours}h ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return 'just now';
});

// Static method to get recent activities in workspace
activitySchema.statics.getRecentActivities = async function (workspaceId, limit = 10) {
  return this.find({ workspace: workspaceId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email avatar username')
    .lean();
};

// Static method to get activities by type
activitySchema.statics.getActivitiesByType = async function (workspaceId, type, limit = 10) {
  return this.find({ workspace: workspaceId, type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email avatar username')
    .lean();
};

// Static method to get user activities
activitySchema.statics.getUserActivities = async function (workspaceId, userId, limit = 10) {
  return this.find({ workspace: workspaceId, user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to get activities for specific resource
activitySchema.statics.getResourceActivities = async function (
  workspaceId,
  resourceType,
  resourceId,
  limit = 10,
) {
  return this.find({ workspace: workspaceId, resourceType, resourceId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email avatar username')
    .lean();
};

// Static method to count activities by user (for top contributors)
activitySchema.statics.getTopContributors = async function (workspaceId, limit = 5) {
  return this.aggregate([
    { $match: { workspace: new mongoose.Types.ObjectId(workspaceId) } },
    {
      $group: {
        _id: '$user',
        activityCount: { $sum: 1 },
        lastActivity: { $max: '$createdAt' },
      },
    },
    { $sort: { activityCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$userDetails.name',
        email: '$userDetails.email',
        avatar: '$userDetails.avatar',
        username: '$userDetails.username',
        activityCount: 1,
        lastActivity: 1,
      },
    },
  ]);
};

// Static method to cleanup old activities (optional, for maintenance)
activitySchema.statics.cleanupOldActivities = async function (daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await this.deleteMany({ createdAt: { $lt: cutoffDate } });
  return result.deletedCount;
};

// Ensure virtuals are included in JSON and Object outputs
activitySchema.set('toJSON', { virtuals: true });
activitySchema.set('toObject', { virtuals: true });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
