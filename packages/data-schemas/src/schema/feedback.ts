import { Schema, Document } from 'mongoose';

export interface IFeedbackFile {
  file_id: string;
  filepath: string;
  filename?: string;
}

export interface IFeedback extends Document {
  user: Schema.Types.ObjectId;
  message: string;
  category?: 'bug' | 'suggestion' | 'other';
  status: 'new' | 'reviewed';
  files?: IFeedbackFile[];
}

const feedback = new Schema<IFeedback>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['bug', 'suggestion', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['new', 'reviewed'],
      default: 'new',
    },
    files: [
      {
        _id: false,
        file_id: { type: String, required: true },
        filepath: { type: String, required: true },
        filename: { type: String },
      },
    ],
  },
  { timestamps: true },
);

export default feedback;
