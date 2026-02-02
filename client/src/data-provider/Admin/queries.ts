import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys, dataService } from 'librechat-data-provider';
import type { QueryObserverResult, UseQueryOptions } from '@tanstack/react-query';
import type * as t from 'librechat-data-provider';

// Get admin user endpoint limits
export const useGetAdminUserEndpointLimits = (
  userId: string,
  config?: UseQueryOptions<t.TAdminEndpointLimitsResponse>,
): QueryObserverResult<t.TAdminEndpointLimitsResponse> => {
  return useQuery<t.TAdminEndpointLimitsResponse>(
    ['adminUserEndpointLimits', userId],
    () => dataService.getAdminUserEndpointLimits(userId),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
      ...config,
      enabled: (config?.enabled ?? true) === true && !!userId,
    },
  );
};

// Set endpoint limit mutation
export const useSetEndpointLimitMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      endpoint,
      ...data
    }: {
      userId: string;
      endpoint: string;
    } & t.TEndpointLimitUpdate) => dataService.setEndpointLimit(userId, endpoint, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['adminUserEndpointLimits', variables.userId]);
      queryClient.invalidateQueries([QueryKeys.endpointLimits]);
    },
  });
};

// Delete endpoint limit mutation
export const useDeleteEndpointLimitMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, endpoint }: { userId: string; endpoint: string }) =>
      dataService.deleteEndpointLimit(userId, endpoint),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['adminUserEndpointLimits', variables.userId]);
      queryClient.invalidateQueries([QueryKeys.endpointLimits]);
    },
  });
};

// Bulk set endpoint limits mutation
export const useBulkSetEndpointLimitsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: t.TBulkEndpointLimitsUpdate) => dataService.bulkSetEndpointLimits(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUserEndpointLimits']);
      queryClient.invalidateQueries([QueryKeys.endpointLimits]);
    },
  });
};

// Get users with endpoint limits
export const useGetUsersWithEndpointLimits = (params: {
  page?: number;
  pageSize?: number;
  endpoint?: string;
}) => {
  return useQuery<t.TUsersWithEndpointLimitsResponse>(
    ['usersWithEndpointLimits', params],
    () => dataService.getUsersWithEndpointLimits(params),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
      keepPreviousData: true,
    },
  );
};
