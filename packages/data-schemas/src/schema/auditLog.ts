import { Schema } from 'mongoose';

export interface IAuditLog {
  _id?: string;
  timestamp: Date;
  action: string;
  resource: string;
  resourceId: string;
  adminUser: Schema.Types.ObjectId | string;
  targetUser?: Schema.Types.ObjectId | string;
  changes?: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE',
        'UPDATE',
        'DELETE',
        'BULK_UPDATE',
        'BULK_DELETE',
      ],
      index: true,
    },
    resource: {
      type: String,
      required: true,
      enum: [
        'ENDPOINT_LIMIT',
        'BALANCE',
        'USER',
        'TRANSACTION',
      ],
      index: true,
    },
    resourceId: {
      type: String,
      required: true,
      index: true,
    },
    adminUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    changes: [
      {
        field: { type: String, required: true },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed },
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: false,
    collection: 'auditlogs',
  },
);

auditLogSchema.index({ adminUser: 1, timestamp: -1 });
auditLogSchema.index({ targetUser: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, timestamp: -1 });

const AUDIT_LOG_RETENTION_DAYS = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '730', 10);
auditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: AUDIT_LOG_RETENTION_DAYS * 24 * 60 * 60 },
);

export default auditLogSchema;
