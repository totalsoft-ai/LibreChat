import { request } from 'librechat-data-provider';
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  QueryObserverResult,
} from '@tanstack/react-query';

export type FeedbackCategory = 'bug' | 'suggestion' | 'other';
export type FeedbackStatus = 'new' | 'reviewed';

export type FeedbackImage = {
  data: string;
  contentType: string;
  filename?: string;
};

export type FeedbackPayload = {
  message: string;
  category: FeedbackCategory;
  images?: FeedbackImage[];
};

export type FeedbackResponse = {
  id: string;
};

export const useSubmitFeedback = (
  config?: UseMutationOptions<FeedbackResponse, unknown, FeedbackPayload>,
): UseMutationResult<FeedbackResponse, unknown, FeedbackPayload> => {
  return useMutation((payload: FeedbackPayload) => request.post('/api/feedback', payload), config);
};

export type FeedbackListItem = {
  _id: string;
  message: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  images?: FeedbackImage[];
  createdAt: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
    username?: string;
  };
};

export type FeedbackListParams = {
  page?: number;
  pageSize?: number;
  category?: FeedbackCategory;
  status?: FeedbackStatus;
};

export type FeedbackListResponse = {
  data: FeedbackListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export const useGetFeedbackList = (
  params: FeedbackListParams,
  config?: UseQueryOptions<FeedbackListResponse>,
): QueryObserverResult<FeedbackListResponse> => {
  return useQuery<FeedbackListResponse>(
    ['admin-feedback-list', params],
    () => request.get('/api/admin/feedback', { params }),
    { keepPreviousData: true, ...config },
  );
};

export const useUpdateFeedbackStatusMutation = (
  config?: UseMutationOptions<FeedbackListItem, unknown, { id: string; status: FeedbackStatus }>,
): UseMutationResult<FeedbackListItem, unknown, { id: string; status: FeedbackStatus }> => {
  return useMutation(
    ({ id, status }) => request.patch(`/api/admin/feedback/${id}/status`, { status }),
    config,
  );
};
