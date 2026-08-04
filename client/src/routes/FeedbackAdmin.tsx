import { useState } from 'react';
import { Spinner, useToastContext } from '@librechat/client';
import { useQueryClient } from '@tanstack/react-query';
import { useGetFeedbackList, useUpdateFeedbackStatusMutation } from '~/data-provider/Feedback';
import type {
  FeedbackCategory,
  FeedbackStatus,
  FeedbackListItem,
  FeedbackImage,
} from '~/data-provider/Feedback';
import { useAuthContext, useLocalize } from '~/hooks';

type CategoryFilter = 'all' | FeedbackCategory;
type StatusFilter = 'all' | FeedbackStatus;

function formatDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString();
}

function userLabel(user: FeedbackListItem['user']) {
  if (!user) {
    return '—';
  }
  return user.name || user.username || user.email || '—';
}

function ImageThumbnail({ image }: { image: FeedbackImage }) {
  const src = `data:${image.contentType};base64,${image.data}`;
  return (
    <button
      type="button"
      onClick={() => window.open(src, '_blank', 'noopener,noreferrer')}
      className="h-12 w-12 overflow-hidden rounded-md border border-border-light"
      title={image.filename}
    >
      <img src={src} alt={image.filename ?? 'attachment'} className="h-full w-full object-cover" />
    </button>
  );
}

export default function FeedbackAdmin() {
  const localize = useLocalize();
  const { user } = useAuthContext();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const isAdmin = user?.role === 'ADMIN';

  const { data, isLoading, isError } = useGetFeedbackList(
    {
      page,
      pageSize: 20,
      category: category === 'all' ? undefined : category,
      status: status === 'all' ? undefined : status,
    },
    { enabled: isAdmin },
  );

  const updateStatus = useUpdateFeedbackStatusMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-feedback-list']);
    },
    onError: () => {
      showToast({ message: localize('com_nav_feedback_admin_update_error'), status: 'error' });
    },
  });

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold text-text-primary">
            {localize('com_nav_feedback_admin_access_denied_title')}
          </h1>
          <p className="text-text-secondary">
            {localize('com_nav_feedback_admin_access_denied_body')}
          </p>
        </div>
      </div>
    );
  }

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {localize('com_nav_feedback_admin')}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {localize('com_nav_feedback_admin_description')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as CategoryFilter);
                setPage(1);
              }}
              className="w-full rounded-md border border-border-light bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
            >
              <option value="all">{localize('com_nav_feedback_admin_all_categories')}</option>
              <option value="bug">{localize('com_nav_feedback_category_bug')}</option>
              <option value="suggestion">{localize('com_nav_feedback_category_suggestion')}</option>
              <option value="other">{localize('com_nav_feedback_category_other')}</option>
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as StatusFilter);
                setPage(1);
              }}
              className="w-full rounded-md border border-border-light bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
            >
              <option value="all">{localize('com_nav_feedback_admin_all_statuses')}</option>
              <option value="new">{localize('com_nav_feedback_admin_status_new')}</option>
              <option value="reviewed">{localize('com_nav_feedback_admin_status_reviewed')}</option>
            </select>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          )}
          {!isLoading && isError && (
            <p className="text-sm text-red-500">{localize('com_nav_feedback_admin_error')}</p>
          )}
          {!isLoading && !isError && (
            <div className="overflow-hidden rounded-lg border border-border-light bg-surface-primary">
              {items.length === 0 ? (
                <p className="p-4 text-sm text-text-secondary">
                  {localize('com_nav_feedback_admin_empty')}
                </p>
              ) : (
                <>
                  <div className="divide-y divide-border-light">
                    {items.map((item) => (
                      <div key={item._id} className="flex flex-col gap-2 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                            <span className="rounded-full bg-surface-secondary px-2 py-0.5 font-medium capitalize">
                              {item.category}
                            </span>
                            <span>{userLabel(item.user)}</span>
                            <span>·</span>
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus.mutate({
                                id: item._id,
                                status: item.status === 'new' ? 'reviewed' : 'new',
                              })
                            }
                            disabled={updateStatus.isLoading}
                            className="rounded-md border border-border-light px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-40"
                          >
                            {item.status === 'new'
                              ? localize('com_nav_feedback_admin_mark_reviewed')
                              : localize('com_nav_feedback_admin_mark_new')}
                          </button>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-text-primary">
                          {item.message}
                        </p>
                        {item.images && item.images.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.images.map((image, index) => (
                              <ImageThumbnail key={index} image={image} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border-light px-4 py-3">
                      <span className="text-xs text-text-secondary">
                        {localize('com_nav_feedback_admin_total', { 0: pagination.total })}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={pagination.page === 1}
                          className="rounded px-2 py-1 text-sm text-text-secondary hover:bg-surface-hover disabled:opacity-40"
                        >
                          ‹
                        </button>
                        <span className="px-2 text-sm text-text-primary">
                          {pagination.page} / {pagination.totalPages}
                        </span>
                        <button
                          onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                          disabled={pagination.page >= pagination.totalPages}
                          className="rounded px-2 py-1 text-sm text-text-secondary hover:bg-surface-hover disabled:opacity-40"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
