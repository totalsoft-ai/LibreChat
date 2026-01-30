import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys, dataService } from 'librechat-data-provider';
import type { QueryObserverResult, UseQueryOptions } from '@tanstack/react-query';
import type * as t from 'librechat-data-provider';

// Get admin user model limits
export const useGetAdminUserModelLimits = (
  userId: string,
  config?: UseQueryOptions<t.TAdminModelLimitsResponse>,
): QueryObserverResult<t.TAdminModelLimitsResponse> => {
  return useQuery<t.TAdminModelLimitsResponse>(
    ['adminUserModelLimits', userId],
    () => dataService.getAdminUserModelLimits(userId),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
      ...config,
      enabled: (config?.enabled ?? true) === true && !!userId,
    },
  );
};

// Set model limit mutation
export const useSetModelLimitMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      model,
      ...data
    }: {
      userId: string;
      model: string;
    } & t.TModelLimitUpdate) => dataService.setModelLimit(userId, model, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['adminUserModelLimits', variables.userId]);
      queryClient.invalidateQueries([QueryKeys.modelLimits]);
    },
  });
};

// Delete model limit mutation
export const useDeleteModelLimitMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, model }: { userId: string; model: string }) =>
      dataService.deleteModelLimit(userId, model),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['adminUserModelLimits', variables.userId]);
      queryClient.invalidateQueries([QueryKeys.modelLimits]);
    },
  });
};

// Bulk set model limits mutation
export const useBulkSetModelLimitsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: t.TBulkModelLimitsUpdate) => dataService.bulkSetModelLimits(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUserModelLimits']);
      queryClient.invalidateQueries([QueryKeys.modelLimits]);
    },
  });
};

// Get users with model limits
export const useGetUsersWithModelLimits = (params: {
  page?: number;
  pageSize?: number;
  model?: string;
}) => {
  return useQuery<t.TUsersWithModelLimitsResponse>(
    ['usersWithModelLimits', params],
    () => dataService.getUsersWithModelLimits(params),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
      keepPreviousData: true,
    },
  );
};
