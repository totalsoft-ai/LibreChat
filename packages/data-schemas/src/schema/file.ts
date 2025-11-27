import mongoose, { Schema } from 'mongoose';
import { FileSources } from 'librechat-data-provider';
import type { IMongoFile } from '~/types';

const file: Schema<IMongoFile> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    conversationId: {
      type: String,
      ref: 'Conversation',
      index: true,
    },
    file_id: {
      type: String,
      index: true,
      required: true,
    },
    temp_file_id: {
      type: String,
    },
    bytes: {
      type: Number,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    filepath: {
      type: String,
      required: true,
    },
    object: {
      type: String,
      required: true,
      default: 'file',
    },
    embedded: {
      type: Boolean,
    },
    type: {
      type: String,
      required: true,
    },
    text: {
      type: String,
    },
    context: {
      type: String,
    },
    usage: {
      type: Number,
      required: true,
      default: 0,
    },
    source: {
      type: String,
      default: FileSources.local,
    },
    model: {
      type: String,
    },
    width: Number,
    height: Number,
    metadata: {
      fileIdentifier: String,
    },
    expiresAt: {
      type: Date,
      expires: 3600, // 1 hour in seconds
    },
    isGlobalLibrary: {
      type: Boolean,
      default: false,
      index: true,
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

file.index({ createdAt: 1, updatedAt: 1 });
file.index({ user: 1, isGlobalLibrary: 1, embedded: 1 });
file.index({ workspace: 1, user: 1 }); // For workspace file listing
file.index({ workspace: 1, visibility: 1 }); // For filtering by visibility
file.index({ workspace: 1, visibility: 1, user: 1 }); // For workspace shared resources
file.index({ workspace: 1, isPinned: 1 }); // For pinned resources

export default file;
