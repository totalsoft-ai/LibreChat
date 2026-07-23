const mongoose = require('mongoose');

/**
 * One row per incident that has been alerted on. The unique index is the
 * exactly-once claim: sending an alert first inserts here, so a duplicate
 * insert (another check cycle, or a second backend replica) fails instead of
 * sending a second email for the same incident.
 */
const serviceAlertSchema = new mongoose.Schema(
  {
    component: {
      type: String,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
      // Well past the 7-day alert lookback window, so claims never linger.
      expires: 30 * 24 * 60 * 60,
    },
    recipientsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

serviceAlertSchema.index({ component: 1, startedAt: 1 }, { unique: true });

const ServiceAlert = mongoose.model('ServiceAlert', serviceAlertSchema);

module.exports = ServiceAlert;
