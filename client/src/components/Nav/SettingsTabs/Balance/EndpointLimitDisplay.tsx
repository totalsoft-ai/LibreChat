import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { formatNumber, formatBalanceDateTime } from '~/utils';
import type { TEndpointLimit } from 'librechat-data-provider';

interface EndpointLimitDisplayProps {
  limit: TEndpointLimit;
}

const CREDIT_THRESHOLDS = [
  { min: 10000, color: 'bg-green-500' },
  { min: 5000, color: 'bg-yellow-500' },
  { min: 1000, color: 'bg-orange-500' },
  { min: 0, color: 'bg-red-500' },
] as const;

const getProgressColor = (credits: number): string =>
  CREDIT_THRESHOLDS.find((threshold) => credits > threshold.min)?.color ?? 'bg-red-500';

function EndpointLimitDisplay({ limit }: EndpointLimitDisplayProps) {
  const localize = useLocalize();

  return (
    <div className="rounded-lg border border-border-medium bg-surface-primary-alt p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold text-text-primary">{limit.endpoint}</h4>
        {!limit.enabled && (
          <span className="rounded-full bg-surface-tertiary px-2 py-1 text-xs text-text-secondary">
            {localize('com_nav_endpoint_limit_disabled')}
          </span>
        )}
      </div>

      {/* Credits Display */}
      <div className="mb-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-text-secondary">
            {localize('com_nav_endpoint_limit_credits')}
          </span>
          <span className="text-lg font-bold text-text-primary">
            {formatNumber(limit.tokenCredits)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-tertiary">
          <div
            className={`h-full transition-all duration-300 ${getProgressColor(limit.tokenCredits)}`}
            style={{ width: limit.tokenCredits > 0 ? '100%' : '0%' }}
          />
        </div>
      </div>

      {/* Auto-refill Info */}
      {limit.autoRefillEnabled && limit.refillAmount && limit.refillAmount > 0 && (
        <div className="mb-2 flex items-center gap-1 rounded bg-surface-secondary p-2 text-xs text-text-secondary">
          <RefreshCcw className="h-3 w-3" />
          <span>
            {localize('com_nav_endpoint_limit_auto_refill')}:{' '}
            <strong>{formatNumber(limit.refillAmount)}</strong>{' '}
            {localize('com_nav_endpoint_limit_every')}{' '}
            <strong>
              {limit.refillIntervalValue} {limit.refillIntervalUnit}
            </strong>
          </span>
        </div>
      )}

      {/* Last Used */}
      <div className="text-xs text-text-secondary">
        {localize('com_nav_endpoint_limit_last_used')}:{' '}
        {limit.lastUsed ? formatBalanceDateTime(limit.lastUsed) : localize('com_nav_endpoint_limit_never')}
      </div>
    </div>
  );
}

export default React.memo(EndpointLimitDisplay);
