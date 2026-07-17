const mongoose = require('mongoose');

const RETENTION_DAYS = parseInt(process.env.HEALTH_CHECK_RETENTION_DAYS, 10) || 180;

const serviceHealthCheckSchema = new mongoose.Schema(
  {
    component: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ok', 'degraded', 'down', 'unknown'],
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    details: {
      type: Object,
      default: {},
    },
    checkedAt: {
      type: Date,
      default: Date.now,
      index: true,
      expires: RETENTION_DAYS * 24 * 60 * 60,
    },
  },
  {
    timestamps: false,
  },
);

serviceHealthCheckSchema.index({ component: 1, checkedAt: -1 });

const ServiceHealthCheck = mongoose.model('ServiceHealthCheck', serviceHealthCheckSchema);

module.exports = ServiceHealthCheck;
