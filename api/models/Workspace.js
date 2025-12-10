const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const workspaceMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member', 'viewer'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const startPageLinksSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'link',
    },
  },
  { _id: false },
);

const startPageSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: 'Welcome to {workspace_name}',
      trim: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    showStats: {
      type: Boolean,
      default: true,
    },
    customLinks: {
      type: [startPageLinksSchema],
      default: [],
    },
  },
  { _id: false },
);

const workspaceSettingsSchema = new mongoose.Schema({
  defaultModel: {
    type: String,
    default: 'gpt-4',
  },
  defaultEndpoint: {
    type: String,
    default: 'openAI',
  },
  tokenBudget: {
    type: Number,
    default: null, // null = unlimited
  },
  allowGuestAccess: {
    type: Boolean,
    default: false,
  },
  requireApprovalForMembers: {
    type: Boolean,
    default: false,
  },
  allowedFileTypes: {
    type: [String],
    default: ['pdf', 'txt', 'doc', 'docx', 'png', 'jpg', 'jpeg'],
  },
  maxFileSize: {
    type: Number,
    default: 10, // MB
  },
  // Model access control
  availableModels: {
    type: [String],
    default: null, // null = all models available
  },
  availableEndpoints: {
    type: [String],
    default: null, // null = all endpoints available
  },
  // Start page configuration
  startPage: {
    type: startPageSchema,
    default: () => ({}),
  },
  // Workspace information (admin/owner editable)
  welcomeMessage: {
    type: String,
    default: '',
    trim: true,
    maxlength: 5000, // Support markdown content
  },
  guidelines: {
    type: String,
    default: '',
    trim: true,
    maxlength: 5000, // Support markdown content
  },
});

const workspaceSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: String,
      unique: true,
      required: true,
      default: () => uuidv4(),
      index: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/,
      index: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: '#3b82f6', // Tailwind blue-500
    },
    members: {
      type: [workspaceMemberSchema],
      default: [],
    },
    settings: {
      type: workspaceSettingsSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Statistics
    stats: {
      conversationCount: {
        type: Number,
        default: 0,
      },
      messageCount: {
        type: Number,
        default: 0,
      },
      tokenUsage: {
        type: Number,
        default: 0,
      },
      lastActivityAt: {
        type: Date,
        default: null,
      },
    },
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
workspaceSchema.index({ 'members.user': 1, isArchived: 1 });
workspaceSchema.index({ createdBy: 1, isArchived: 1 });
workspaceSchema.index({ slug: 1, isActive: 1 });
workspaceSchema.index({ createdAt: -1 });

// Virtual for member count
workspaceSchema.virtual('memberCount').get(function () {
  return this.members ? this.members.length : 0;
});

// Instance methods
workspaceSchema.methods.isMember = function (userId) {
  return this.members.some((member) => member.user.toString() === userId.toString());
};

workspaceSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find((member) => member.user.toString() === userId.toString());
  return member ? member.role : null;
};

workspaceSchema.methods.hasPermission = function (userId, requiredRole) {
  const roleHierarchy = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
  };

  const memberRole = this.getMemberRole(userId);
  if (!memberRole) {
    return false;
  }

  return roleHierarchy[memberRole] >= roleHierarchy[requiredRole];
};

workspaceSchema.methods.addMember = function (userId, role = 'member', invitedBy = null) {
  if (this.isMember(userId)) {
    throw new Error('User is already a member of this workspace');
  }

  this.members.push({
    user: userId,
    role,
    invitedBy,
    joinedAt: new Date(),
  });

  return this.save();
};

workspaceSchema.methods.removeMember = function (userId) {
  if (!this.isMember(userId)) {
    throw new Error('User is not a member of this workspace');
  }

  // Cannot remove the last owner
  if (this.getMemberRole(userId) === 'owner') {
    const ownerCount = this.members.filter((m) => m.role === 'owner').length;
    if (ownerCount === 1) {
      throw new Error('Cannot remove the last owner of the workspace');
    }
  }

  this.members = this.members.filter((member) => member.user.toString() !== userId.toString());

  return this.save();
};

workspaceSchema.methods.updateMemberRole = function (userId, newRole) {
  const member = this.members.find((member) => member.user.toString() === userId.toString());
  if (!member) {
    throw new Error('User is not a member of this workspace');
  }

  // Cannot change role of the last owner
  if (member.role === 'owner' && newRole !== 'owner') {
    const ownerCount = this.members.filter((m) => m.role === 'owner').length;
    if (ownerCount === 1) {
      throw new Error('Cannot change role of the last owner');
    }
  }

  member.role = newRole;
  return this.save();
};

workspaceSchema.methods.updateStats = function (updates) {
  Object.assign(this.stats, updates);
  this.stats.lastActivityAt = new Date();
  return this.save();
};

// Static methods
workspaceSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true, isArchived: false });
};

workspaceSchema.statics.findUserWorkspaces = function (userId) {
  return this.find({
    'members.user': userId,
    isActive: true,
    isArchived: false,
  })
    .populate('members.user', 'name email avatar')
    .populate('createdBy', 'name email')
    .sort({ 'stats.lastActivityAt': -1, createdAt: -1 })
    .lean();
};

workspaceSchema.statics.generateSlug = async function (name) {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Check if slug exists
  let counter = 1;
  let finalSlug = slug;
  while (await this.findOne({ slug: finalSlug })) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  return finalSlug;
};

// Pre-save hooks
workspaceSchema.pre('save', async function (next) {
  // Generate slug if not present
  if (this.isNew && !this.slug) {
    this.slug = await this.constructor.generateSlug(this.name);
  }

  // Ensure at least one owner
  if (this.members.length > 0) {
    const hasOwner = this.members.some((member) => member.role === 'owner');
    if (!hasOwner && this.createdBy) {
      // Make creator the owner if no owner exists
      const creatorMember = this.members.find(
        (m) => m.user.toString() === this.createdBy.toString(),
      );
      if (creatorMember) {
        creatorMember.role = 'owner';
      }
    }
  }

  next();
});

// Ensure virtuals are included in JSON and Object outputs
workspaceSchema.set('toJSON', { virtuals: true });
workspaceSchema.set('toObject', { virtuals: true });

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
