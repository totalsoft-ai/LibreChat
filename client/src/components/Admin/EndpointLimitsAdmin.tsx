import React, { useState } from 'react';
import { useLocalize } from '~/hooks';
import {
  useGetAdminUserEndpointLimits,
  useSetEndpointLimitMutation,
  useDeleteEndpointLimitMutation,
} from '~/data-provider/Admin/queries';

function EndpointLimitsAdmin() {
  const localize = useLocalize();
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [showLimits, setShowLimits] = useState(false);

  // Form state
  const [endpoint, setEndpoint] = useState('');
  const [tokenCredits, setTokenCredits] = useState('10000');
  const [enabled, setEnabled] = useState(true);
  const [autoRefillEnabled, setAutoRefillEnabled] = useState(false);
  const [refillAmount, setRefillAmount] = useState('5000');
  const [refillIntervalValue, setRefillIntervalValue] = useState('7');
  const [refillIntervalUnit, setRefillIntervalUnit] = useState<
    'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
  >('days');

  const { data, isLoading, refetch } = useGetAdminUserEndpointLimits(userId, {
    enabled: !!userId && showLimits,
  });

  const setLimitMutation = useSetEndpointLimitMutation();
  const deleteLimitMutation = useDeleteEndpointLimitMutation();

  const handleLoadUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      return;
    }

    // Simulate getting userId from email (in real app, you'd have an API endpoint for this)
    // For now, we'll use the email as userId
    setUserId(userEmail);
    setShowLimits(true);
  };

  const handleSetLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !endpoint.trim()) {
      return;
    }

    try {
      await setLimitMutation.mutateAsync({
        userId,
        endpoint: endpoint.trim(),
        tokenCredits: parseInt(tokenCredits),
        enabled,
        autoRefillEnabled,
        refillAmount: autoRefillEnabled ? parseInt(refillAmount) : undefined,
        refillIntervalValue: autoRefillEnabled ? parseInt(refillIntervalValue) : undefined,
        refillIntervalUnit: autoRefillEnabled ? refillIntervalUnit : undefined,
      });

      // Reset form
      setEndpoint('');
      setTokenCredits('10000');
      setEnabled(true);
      setAutoRefillEnabled(false);
      refetch();
    } catch (error) {
      console.error('Failed to set endpoint limit:', error);
    }
  };

  const handleDelete = async (endpointName: string) => {
    if (!userId) {
      return;
    }

    if (window.confirm(`Delete limit for ${endpointName}?`)) {
      try {
        await deleteLimitMutation.mutateAsync({ userId, endpoint: endpointName });
        refetch();
      } catch (error) {
        console.error('Failed to delete endpoint limit:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl p-6">
      <h2 className="mb-6 text-2xl font-bold text-text-primary">
        {localize('com_admin_endpoint_limits_title')}
      </h2>

      {/* User Search */}
      <form onSubmit={handleLoadUser} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder={localize('com_admin_endpoint_limits_user_email')}
            className="flex-1 rounded border border-border-medium bg-surface-primary px-3 py-2 text-text-primary placeholder-text-secondary focus:border-border-heavy focus:outline-none"
          />
          <button
            type="submit"
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            {localize('com_admin_endpoint_limits_load_user')}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {isLoading && <div className="text-text-secondary">{localize('com_ui_loading')}...</div>}

      {/* User Limits Display */}
      {showLimits && data && (
        <div className="space-y-6">
          {/* Global Balance */}
          <div className="rounded-lg border border-border-medium bg-surface-primary-alt p-4">
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              {localize('com_nav_balance_global')}
            </h3>
            <p className="text-2xl font-bold text-text-primary">
              {data.globalBalance.tokenCredits.toLocaleString()} credits
            </p>
            {data.globalBalance.autoRefillEnabled && (
              <p className="mt-1 text-sm text-text-secondary">
                Auto-refill: {data.globalBalance.refillAmount?.toLocaleString()} every{' '}
                {data.globalBalance.refillIntervalValue} {data.globalBalance.refillIntervalUnit}
              </p>
            )}
          </div>

          {/* Existing Endpoint Limits */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-text-primary">
              {localize('com_nav_endpoint_limits_title')}
            </h3>

            {data.endpointLimits.length === 0 ? (
              <p className="text-text-secondary">{localize('com_admin_endpoint_limits_none')}</p>
            ) : (
              <div className="space-y-2">
                {data.endpointLimits.map((limit) => (
                  <div
                    key={limit.endpoint}
                    className="flex items-center justify-between rounded border border-border-medium bg-surface-primary p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{limit.endpoint}</span>
                        {!limit.enabled && (
                          <span className="rounded bg-surface-tertiary px-2 py-0.5 text-xs text-text-secondary">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">
                        {limit.tokenCredits.toLocaleString()} credits
                        {limit.autoRefillEnabled &&
                          ` • Auto-refill: ${limit.refillAmount?.toLocaleString()} / ${limit.refillIntervalValue} ${limit.refillIntervalUnit}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(limit.endpoint)}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                      disabled={deleteLimitMutation.isLoading}
                    >
                      {localize('com_ui_delete')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          <div className="rounded-lg border border-border-medium bg-surface-primary-alt p-4">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">
              {localize('com_admin_endpoint_limits_add')}
            </h3>

            <form onSubmit={handleSetLimit} className="space-y-4">
              {/* Endpoint Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  {localize('com_admin_endpoint_limits_endpoint_name')} *
                </label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="gpt-4, claude-3-opus, etc."
                  className="w-full rounded border border-border-medium bg-surface-primary px-3 py-2 text-text-primary placeholder-text-secondary focus:border-border-heavy focus:outline-none"
                  required
                />
              </div>

              {/* Token Credits */}
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">
                  {localize('com_admin_endpoint_limits_token_credits')} *
                </label>
                <input
                  type="number"
                  value={tokenCredits}
                  onChange={(e) => setTokenCredits(e.target.value)}
                  className="w-full rounded border border-border-medium bg-surface-primary px-3 py-2 text-text-primary focus:border-border-heavy focus:outline-none"
                  required
                  min="0"
                />
              </div>

              {/* Enabled Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="enabled" className="text-sm text-text-primary">
                  {localize('com_admin_endpoint_limits_enabled')}
                </label>
              </div>

              {/* Auto-refill Section */}
              <div className="space-y-3 rounded border border-border-light p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoRefill"
                    checked={autoRefillEnabled}
                    onChange={(e) => setAutoRefillEnabled(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="autoRefill" className="text-sm font-medium text-text-primary">
                    {localize('com_admin_endpoint_limits_auto_refill')}
                  </label>
                </div>

                {autoRefillEnabled && (
                  <div className="space-y-3 pl-6">
                    <div>
                      <label className="mb-1 block text-sm text-text-primary">
                        {localize('com_nav_balance_refill_amount')}
                      </label>
                      <input
                        type="number"
                        value={refillAmount}
                        onChange={(e) => setRefillAmount(e.target.value)}
                        className="w-full rounded border border-border-medium bg-surface-primary px-3 py-2 text-text-primary focus:border-border-heavy focus:outline-none"
                        min="0"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-sm text-text-primary">
                          {localize('com_nav_balance_interval')}
                        </label>
                        <input
                          type="number"
                          value={refillIntervalValue}
                          onChange={(e) => setRefillIntervalValue(e.target.value)}
                          className="w-full rounded border border-border-medium bg-surface-primary px-3 py-2 text-text-primary focus:border-border-heavy focus:outline-none"
                          min="1"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-sm text-text-primary">Unit</label>
                        <select
                          value={refillIntervalUnit}
                          onChange={(e) =>
                            setRefillIntervalUnit(
                              e.target.value as
                                | 'seconds'
                                | 'minutes'
                                | 'hours'
                                | 'days'
                                | 'weeks'
                                | 'months',
                            )
                          }
                          className="w-full rounded border border-border-medium bg-surface-primary px-3 py-2 text-text-primary focus:border-border-heavy focus:outline-none"
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                          <option value="months">Months</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={setLimitMutation.isLoading}
                className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {setLimitMutation.isLoading
                  ? localize('com_ui_loading')
                  : localize('com_admin_endpoint_limits_set_limit')}
              </button>

              {setLimitMutation.isError && (
                <p className="text-sm text-red-600">{localize('com_admin_endpoint_limits_error')}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EndpointLimitsAdmin;
