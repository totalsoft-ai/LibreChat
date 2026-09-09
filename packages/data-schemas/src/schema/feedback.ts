import { Schema, Document } from 'mongoose';

export interface IFeedbackImage {
  data: string;
  contentType: string;
  filename?: string;
}

export interface IFeedbackResponse {
  text: string;
  respondedBy: Schema.Types.ObjectId;
  respondedAt: Date;
}

export interface IFeedback extends Document {
  user: Schema.Types.ObjectId;
  message: string;
  category?: 'bug' | 'suggestion' | 'other';
  status: 'new' | 'reviewed';
  images?: IFeedbackImage[];
  response?: IFeedbackResponse;
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
    response: {
      type: {
        text: { type: String, required: true },
        respondedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        respondedAt: { type: Date, required: true },
      },
      required: false,
    },
  },
  { timestamps: true },
);

export default feedback;
