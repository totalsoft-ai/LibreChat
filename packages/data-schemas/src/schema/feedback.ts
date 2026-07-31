import { Schema, Document } from 'mongoose';

export interface IFeedbackImage {
  data: string;
  contentType: string;
  filename?: string;
}

export interface IFeedback extends Document {
  user: Schema.Types.ObjectId;
  message: string;
  category?: 'bug' | 'suggestion' | 'other';
  status: 'new' | 'reviewed';
  images?: IFeedbackImage[];
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
    // Stored inline (base64) rather than via the shared file-upload/storage
    // pipeline, so feedback attachments never leave MongoDB (no S3/MinIO).
    images: [
      {
        _id: false,
        data: { type: String, required: true },
        contentType: { type: String, required: true },
        filename: { type: String },
      },
    ],
  },
  { timestamps: true },
);

export default feedback;
