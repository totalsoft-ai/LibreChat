import { Schema } from 'mongoose';
import type * as t from '~/types';

// Sub-schema for endpoint-specific limits
const endpointLimitSchema = new Schema<t.IEndpointLimit>(
  {
    endpoint: { type: String, required: true },
    tokenCredits: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    lastUsed: { type: Date, default: Date.now },
    autoRefillEnabled: { type: Boolean, default: false },
    refillAmount: { type: Number, default: 0 },
    refillIntervalValue: { type: Number, default: 30 },
    refillIntervalUnit: {
      type: String,
      enum: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months'],
      default: 'days',
    },
    lastRefill: { type: Date, default: Date.now },
    // Budget alerts tracking
    alertsSent: { type: [Number], default: [] },
    lastAlertReset: { type: Date, default: Date.now },
  },
  { _id: false },
);

const balanceSchema = new Schema<t.IBalance>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  // Endpoint-specific limits (ACTIVE - used by application)
  endpointLimits: {
    type: [endpointLimitSchema],
    default: [],
  },
  // ============================================================================
  // LEGACY FIELDS - Kept for backward compatibility with existing documents
  // These are NOT used by the application logic and should NOT be set for new records
  // Only endpointLimits are used for balance tracking
  // ============================================================================
  // 1000 tokenCredits = 1 mill ($0.001 USD)
  tokenCredits: {
    type: Number,
    required: false,
    // NO DEFAULT - will not be added to new documents
  },
  // Automatic refill settings (global - DEPRECATED)
  autoRefillEnabled: {
    type: Boolean,
    required: false,
    // NO DEFAULT
  },
  refillIntervalValue: {
    type: Number,
    required: false,
    // NO DEFAULT
  },
  refillIntervalUnit: {
    type: String,
    enum: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months'],
    required: false,
    // NO DEFAULT
  },
  lastRefill: {
    type: Date,
    required: false,
    // NO DEFAULT
  },
  // amount to add on each refill (global - DEPRECATED)
  refillAmount: {
    type: Number,
    required: false,
    // NO DEFAULT
  },
  // Global budget alerts tracking (DEPRECATED)
  alertsSent: {
    type: [Number],
    required: false,
    // NO DEFAULT
  },
  lastAlertReset: {
    type: Date,
    required: false,
    // NO DEFAULT
  },
});

// Index for efficient queries on endpoint limits
balanceSchema.index({ user: 1, 'endpointLimits.endpoint': 1 });

export default balanceSchema;
