import { Schema } from 'mongoose';

export interface INotification {
  _id?: string;
  user: Schema.Types.ObjectId | string;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  data?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'BUDGET_ALERT',
        'BALANCE_LOW',
        'REFILL_SUCCESS',
        'LIMIT_UPDATED',
        'SYSTEM_MESSAGE',
      ],
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  },
);

// Compound indexes
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1, createdAt: -1 });

// TTL index - delete read notifications older than 90 days
const NOTIFICATION_RETENTION_DAYS = parseInt(process.env.NOTIFICATION_RETENTION_DAYS || '90', 10);
notificationSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60,
    partialFilterExpression: { read: true },
  },
);

export default notificationSchema;
