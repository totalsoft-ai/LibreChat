import { useRef, useState, useCallback } from 'react';
import { v4 } from 'uuid';
import { Paperclip } from 'lucide-react';
import { Spinner, useToastContext } from '@librechat/client';
import { useQueryClient } from '@tanstack/react-query';
import { imageMimeTypes } from 'librechat-data-provider';
import Image from '~/components/Chat/Input/Files/Image';
import {
  useSubmitFeedback,
  useGetFeedbackList,
  useUpdateFeedbackStatusMutation,
} from '~/data-provider/Feedback';
import type {
  FeedbackCategory,
  FeedbackStatus,
  FeedbackImage,
  FeedbackListItem,
} from '~/data-provider/Feedback';
import { useAuthContext, useLocalize } from '~/hooks';

const MAX_MESSAGE_LENGTH = 5000;
const MAX_IMAGES = 3;
// Original file size sanity cap, before client-side compression kicks in.
const MAX_SOURCE_FILE_BYTES = 20 * 1024 * 1024;
// Post-compression cap: keeps a full submit (message + images) safely under
// the app's 3mb JSON body limit, since images are sent inline as base64.
const MAX_IMAGE_BYTES = 600 * 1024;
const CANVAS_MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

type Attachment = FeedbackImage & { id: string; preview: string };
type CategoryFilter = 'all' | FeedbackCategory;
type StatusFilter = 'all' | FeedbackStatus;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    img.src = url;
  });
}

/** Downscales and re-encodes an image as JPEG so it stays small enough to store inline. */
async function compressImage(file: File): Promise<{ dataUrl: string; contentType: string }> {
  const img = await loadImageFromFile(file);
  const scale = Math.min(1, CANVAS_MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas not supported');
  }
  ctx.drawImage(img, 0, 0, width, height);

  return { dataUrl: canvas.toDataURL('image/jpeg', JPEG_QUALITY), contentType: 'image/jpeg' };
}

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

export default function Feedback() {
  const localize = useLocalize();
  const { user } = useAuthContext();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';

  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const submitFeedback = useSubmitFeedback({
    onSuccess: () => {
      setMessage('');
      setCategory('suggestion');
      setAttachments([]);
      showToast({ message: localize('com_nav_feedback_success'), status: 'success' });
      if (isAdmin) {
        queryClient.invalidateQueries(['admin-feedback-list']);
      }
    },
    onError: () => {
      showToast({ message: localize('com_nav_feedback_error'), status: 'error' });
    },
  });

  const { data, isLoading, isError } = useGetFeedbackList(
    {
      page,
      pageSize: 20,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
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

  const trimmedLength = message.trim().length;
  const canSubmit = trimmedLength > 0 && trimmedLength <= MAX_MESSAGE_LENGTH;

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      e.target.value = '';

      for (const file of selected) {
        if (attachments.length >= MAX_IMAGES) {
          showToast({
            message: localize('com_nav_feedback_attachment_limit', { 0: MAX_IMAGES }),
            status: 'warning',
          });
          break;
        }
        if (!imageMimeTypes.test(file.type)) {
          showToast({ message: localize('com_nav_feedback_attachment_type'), status: 'error' });
          continue;
        }
        if (file.size > MAX_SOURCE_FILE_BYTES) {
          showToast({ message: localize('com_nav_feedback_attachment_size'), status: 'error' });
          continue;
        }

        try {
          const { dataUrl, contentType } = await compressImage(file);
          const data = dataUrl.slice(dataUrl.indexOf(',') + 1);
          const approxBytes = Math.ceil((data.length * 3) / 4);
          if (approxBytes > MAX_IMAGE_BYTES) {
            showToast({ message: localize('com_nav_feedback_attachment_size'), status: 'error' });
            continue;
          }

          setAttachments((prev) => [
            ...prev,
            { id: v4(), preview: dataUrl, data, contentType, filename: file.name },
          ]);
        } catch {
          showToast({ message: localize('com_nav_feedback_attachment_error'), status: 'error' });
        }
      }
    },
    [attachments.length, localize, showToast],
  );

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitFeedback.isLoading) {
      return;
    }
    const images = attachments.map(({ data, contentType, filename }) => ({
      data,
      contentType,
      filename,
    }));
    submitFeedback.mutate({ message: message.trim(), category, images });
  };

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {localize('com_nav_feedback')}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                {localize('com_nav_feedback_description')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="feedback-category"
                  className="mb-1 block text-sm font-medium text-text-primary"
                >
                  {localize('com_nav_feedback_category_label')}
                </label>
                <select
                  id="feedback-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full rounded-md border border-border-light bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="suggestion">
                    {localize('com_nav_feedback_category_suggestion')}
                  </option>
                  <option value="bug">{localize('com_nav_feedback_category_bug')}</option>
                  <option value="other">{localize('com_nav_feedback_category_other')}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="feedback-message"
                  className="mb-1 block text-sm font-medium text-text-primary"
                >
                  {localize('com_nav_feedback_message_label')}
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={localize('com_nav_feedback_message_placeholder')}
                  rows={6}
                  maxLength={MAX_MESSAGE_LENGTH}
                  className="w-full resize-none rounded-md border border-border-light bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-1 text-right text-xs text-text-secondary">
                  {trimmedLength}/{MAX_MESSAGE_LENGTH}
                </div>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachments.length >= MAX_IMAGES}
                  className="flex items-center gap-1.5 rounded-md border border-border-light px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover disabled:opacity-40"
                >
                  <Paperclip className="icon-sm" aria-hidden="true" />
                  {localize('com_nav_feedback_attach_image')}
                </button>

                {attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <Image
                        key={attachment.id}
                        imageBase64={attachment.preview}
                        progress={1}
                        onDelete={() => handleRemoveAttachment(attachment.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit || submitFeedback.isLoading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
              >
                {submitFeedback.isLoading
                  ? localize('com_nav_feedback_submitting')
                  : localize('com_nav_feedback_submit')}
              </button>
            </form>
          </div>

          {isAdmin && (
            <div className="space-y-4 border-t border-border-light pt-8">
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {localize('com_nav_feedback_admin')}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {localize('com_nav_feedback_admin_description')}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value as CategoryFilter);
                    setPage(1);
                  }}
                  className="w-full rounded-md border border-border-light bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
                >
                  <option value="all">{localize('com_nav_feedback_admin_all_categories')}</option>
                  <option value="bug">{localize('com_nav_feedback_category_bug')}</option>
                  <option value="suggestion">
                    {localize('com_nav_feedback_category_suggestion')}
                  </option>
                  <option value="other">{localize('com_nav_feedback_category_other')}</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setPage(1);
                  }}
                  className="w-full rounded-md border border-border-light bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
                >
                  <option value="all">{localize('com_nav_feedback_admin_all_statuses')}</option>
                  <option value="new">{localize('com_nav_feedback_admin_status_new')}</option>
                  <option value="reviewed">
                    {localize('com_nav_feedback_admin_status_reviewed')}
                  </option>
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
          )}
        </div>
      </div>
    </div>
  );
}
