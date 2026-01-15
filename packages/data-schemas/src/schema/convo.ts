import { Schema } from 'mongoose';
import { conversationPreset } from './defaults';
import { IConversation } from '~/types';

const convoSchema: Schema<IConversation> = new Schema(
  {
    conversationId: {
      type: String,
      unique: true,
      required: true,
      index: true,
      meiliIndex: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      meiliIndex: true,
    },
    user: {
      type: String,
      index: true,
      meiliIndex: true,
    },
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    agentOptions: {
      type: Schema.Types.Mixed,
    },
    ...conversationPreset,
    agent_id: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
      meiliIndex: true,
    },
    files: {
      type: [String],
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiredAt: {
      type: Date,
    },
    workspace: {
      type: String,
      ref: 'Workspace',
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

// TTL index for automatic cleanup of expired conversations
convoSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for common query patterns
convoSchema.index({ conversationId: 1, user: 1 }, { unique: true });
convoSchema.index({ user: 1, updatedAt: -1 }); // For conversation listing sorted by updatedAt
convoSchema.index({ user: 1, createdAt: -1 }); // For conversation listing sorted by createdAt
convoSchema.index({ user: 1, isArchived: 1, updatedAt: -1 }); // For archived/active filtering
convoSchema.index({ user: 1, tags: 1, updatedAt: -1 }); // For tag filtering
convoSchema.index({ user: 1, expiredAt: 1 }); // For filtering non-expired conversations
convoSchema.index({ workspace: 1, user: 1, updatedAt: -1 }); // For workspace conversation listing
convoSchema.index({ workspace: 1, isArchived: 1 }); // For workspace archived filtering

export default convoSchema;
