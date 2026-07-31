import { request } from 'librechat-data-provider';
import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

export type FeedbackCategory = 'bug' | 'suggestion' | 'other';

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
