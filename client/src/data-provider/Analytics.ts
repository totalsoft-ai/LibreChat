import { request } from 'librechat-data-provider';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, QueryObserverResult } from '@tanstack/react-query';

export type Period = 'daily' | 'weekly' | 'monthly';
export type Window = 'day' | 'week' | 'month';
export type ExtendedWindow = Window | 'all';

export type Pagination = { page: number; pageSize: number; total: number; totalPages: number };

export type StatRow = {
  period: string;
  messageCount: number;
  conversationCount: number;
};

export type TokenUsageRow = {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUSD: number;
};

export type HealthRow = {
  period: string;
  conversationCount: number;
  errorCount: number;
  noResponseCount: number;
  abandonedCount: number;
};

export type ActiveUsersRow = {
  userId: string;
  name: string;
  email: string;
  messageCount: number;
  conversationCount: number;
};

export type AnalyticsStats = { data: StatRow[]; pagination: Pagination };
export type TokenUsageStats = { data: TokenUsageRow[]; pagination: Pagination };
export type HealthTotals = { conversations: number; errors: number; noResponse: number; abandoned: number };
export type HealthStats = { data: HealthRow[]; totals: HealthTotals; pagination: Pagination };
export type ActiveUsersStats = { data: ActiveUsersRow[]; pagination: Pagination };

export type FeedbackRow = {
  period: string;
  thumbsUp: number;
  thumbsDown: number;
  total: number;
  likeRate: number;
};

export type FeedbackStats = { data: FeedbackRow[]; pagination: Pagination };

export type CategoryDistributionRow = {
  category: string;
  label: string;
  conversationCount: number;
};

export type CategoryDistributionStats = { data: CategoryDistributionRow[]; pagination: Pagination };

export const useGetAnalyticsStats = (
  period: Period,
  page: number,
  pageSize: number,
  config?: UseQueryOptions<AnalyticsStats>,
): QueryObserverResult<AnalyticsStats> => {
  return useQuery<AnalyticsStats>(
    ['analytics', period, page, pageSize],
    () => request.get(`/api/admin/analytics/stats?period=${period}&page=${page}&pageSize=${pageSize}`),
    { refetchOnWindowFocus: false, ...config },
  );
};

export const useGetHealthStats = (
  period: Period,
  page: number,
  pageSize: number,
  config?: UseQueryOptions<HealthStats>,
): QueryObserverResult<HealthStats> => {
  return useQuery<HealthStats>(
    ['analytics-health', period, page, pageSize],
    () => request.get(`/api/admin/analytics/health?period=${period}&page=${page}&pageSize=${pageSize}`),
    { refetchOnWindowFocus: false, ...config },
  );
};

export const useGetActiveUsersStats = (
  window: Window,
  page: number,
  pageSize: number,
  config?: UseQueryOptions<ActiveUsersStats>,
): QueryObserverResult<ActiveUsersStats> => {
  return useQuery<ActiveUsersStats>(
    ['analytics-active-users', window, page, pageSize],
    () => request.get(`/api/admin/analytics/active-users?window=${window}&page=${page}&pageSize=${pageSize}`),
    { refetchOnWindowFocus: false, ...config },
  );
};

export const useGetFeedbackStats = (
  period: Period,
  page: number,
  pageSize: number,
  config?: UseQueryOptions<FeedbackStats>,
): QueryObserverResult<FeedbackStats> => {
  return useQuery<FeedbackStats>(
    ['analytics-feedback', period, page, pageSize],
    () => request.get(`/api/admin/analytics/feedback?period=${period}&page=${page}&pageSize=${pageSize}`),
    { refetchOnWindowFocus: false, ...config },
  );
};

export const useGetCategoryDistribution = (
  window: ExtendedWindow,
  page: number,
  pageSize: number,
  config?: UseQueryOptions<CategoryDistributionStats>,
): QueryObserverResult<CategoryDistributionStats> => {
  return useQuery<CategoryDistributionStats>(
    ['analytics-category-distribution', window, page, pageSize],
    () => request.get(`/api/admin/analytics/category-distribution?window=${window}&page=${page}&pageSize=${pageSize}`),
    { refetchOnWindowFocus: false, ...config },
  );
};

export const useGetTokenUsageStats = (
  window: Window,
  page: number,
  pageSize: number,
  config?: UseQueryOptions<TokenUsageStats>,
): QueryObserverResult<TokenUsageStats> => {
  return useQuery<TokenUsageStats>(
    ['analytics-token-usage', window, page, pageSize],
    () => request.get(`/api/admin/analytics/token-usage?window=${window}&page=${page}&pageSize=${pageSize}`),
    { refetchOnWindowFocus: false, ...config },
  );
};
