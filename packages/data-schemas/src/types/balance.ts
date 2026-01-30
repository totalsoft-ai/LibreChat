import { Document, Types } from 'mongoose';

export interface IEndpointLimit {
  endpoint: string;
  tokenCredits: number;
  enabled: boolean;
  lastUsed: Date;
  autoRefillEnabled?: boolean;
  refillAmount?: number;
  refillIntervalValue?: number;
  refillIntervalUnit?: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  lastRefill?: Date;
  // Budget alerts tracking
  alertsSent?: number[];
  lastAlertReset?: Date;
}

export interface IBalance extends Document {
  user: Types.ObjectId;
  endpointLimits: IEndpointLimit[];
  // Budget alerts tracking (optional - can be removed if not used)
  alertsSent?: number[];
  lastAlertReset?: Date;
  // NOTE: Legacy fields (tokenCredits, autoRefillEnabled, etc.) remain in DB for backward compatibility
  // but are not accessed by the application logic. Only endpointLimits are used for balance tracking.
}
