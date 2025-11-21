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
  },
  {
    timestamps: true,
  },
);

promptSchema.index({ createdAt: 1, updatedAt: 1 });
promptSchema.index({ workspace: 1, author: 1 }); // For workspace prompt listing

export default promptSchema;
