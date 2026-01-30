import React from 'react';
import { useGetStartupConfig, useGetUserEndpointLimits } from '~/data-provider';
import { useAuthContext, useLocalize } from '~/hooks';
import EndpointLimitDisplay from './EndpointLimitDisplay';

function Balance() {
  const localize = useLocalize();
  const { isAuthenticated } = useAuthContext();
  const { data: startupConfig } = useGetStartupConfig();

  const isBalanceEnabled = !!isAuthenticated && !!startupConfig?.balance?.enabled;

  const endpointLimitsQuery = useGetUserEndpointLimits({ enabled: isBalanceEnabled });

  const enabledEndpointLimits =
    endpointLimitsQuery.data?.endpointLimits?.filter((limit) => limit.enabled) ?? [];

  return (
    <div className="flex flex-col gap-4 p-4 text-sm text-text-primary">
      {/* Endpoint-Specific Limits Section */}
      {enabledEndpointLimits.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-semibold text-text-primary">
            {localize('com_nav_endpoint_limits_title')}
          </h3>
          <p className="mb-3 text-xs text-text-secondary">
            {localize('com_nav_endpoint_limits_description')}
          </p>
          <div className="flex flex-col gap-3">
            {enabledEndpointLimits.map((limit) => (
              <EndpointLimitDisplay key={limit.endpoint} limit={limit} />
            ))}
          </div>
        </div>
      )}

      {/* Loading state for endpoint limits */}
      {endpointLimitsQuery.isLoading && (
        <div className="text-sm text-text-secondary">
          {localize('com_nav_endpoint_limits_loading')}
        </div>
      )}
    </div>
  );
}

export default React.memo(Balance);
