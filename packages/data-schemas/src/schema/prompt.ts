import { Schema } from 'mongoose';
import type { IPrompt } from '~/types';

const promptSchema: Schema<IPrompt> = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'PromptGroup',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'chat'],
      required: true,
    },
    workspace: {
      type: String,
      ref: 'Workspace',
      default: null,
      index: true,
    },
    visibility: {
      type: String,
      enum: ['private', 'workspace', 'shared_with', 'global'],
      default: 'private',
      index: true,
    },
    sharedWith: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    pinnedAt: {
      type: Date,
      default: null,
    },
    pinnedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

promptSchema.index({ createdAt: 1, updatedAt: 1 });
promptSchema.index({ workspace: 1, author: 1 }); // For workspace prompt listing
promptSchema.index({ workspace: 1, visibility: 1 }); // For filtering by visibility
promptSchema.index({ workspace: 1, visibility: 1, author: 1 }); // For workspace shared resources
promptSchema.index({ workspace: 1, isPinned: 1 }); // For pinned resources

export default promptSchema;
