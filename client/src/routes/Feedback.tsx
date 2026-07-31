import { useRef, useState, useCallback } from 'react';
import { v4 } from 'uuid';
import { Paperclip } from 'lucide-react';
import { useToastContext } from '@librechat/client';
import { imageMimeTypes, mbToBytes, FileSources } from 'librechat-data-provider';
import { useUploadFileMutation, useDeleteFilesMutation } from '~/data-provider';
import Image from '~/components/Chat/Input/Files/Image';
import { useSubmitFeedback } from '~/data-provider/Feedback';
import type { FeedbackCategory } from '~/data-provider/Feedback';
import type { ExtendedFile } from '~/common';
import { useLocalize } from '~/hooks';

const MAX_MESSAGE_LENGTH = 5000;
const MAX_FILES = 3;
const MAX_FILE_SIZE = mbToBytes(10);

export default function Feedback() {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Map<string, ExtendedFile>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useUploadFileMutation({
    onSuccess: (data, formData) => {
      // Keyed by the client-generated temp id; the server assigns its own
      // canonical `file_id` (returned here), so we must adopt it for any
      // later reference (submit/delete) to this attachment.
      const tempId = formData.get('file_id') as string;
      setAttachments((prev) => {
        if (!prev.has(tempId)) {
          return prev;
        }
        const next = new Map(prev);
        const current = next.get(tempId) as ExtendedFile;
        next.set(tempId, {
          ...current,
          progress: 1,
          file_id: data.file_id,
          filepath: data.filepath,
          filename: data.filename,
          type: data.type,
          source: data.source,
        });
        return next;
      });
    },
    onError: (_error, formData) => {
      const tempId = formData.get('file_id') as string;
      setAttachments((prev) => {
        const next = new Map(prev);
        next.delete(tempId);
        return next;
      });
      showToast({ message: localize('com_nav_feedback_attachment_error'), status: 'error' });
    },
  });

  const deleteFile = useDeleteFilesMutation();

  const submitFeedback = useSubmitFeedback({
    onSuccess: () => {
      setMessage('');
      setCategory('suggestion');
      setAttachments(new Map());
      showToast({ message: localize('com_nav_feedback_success'), status: 'success' });
    },
    onError: () => {
      showToast({ message: localize('com_nav_feedback_error'), status: 'error' });
    },
  });

  const trimmedLength = message.trim().length;
  const canSubmit = trimmedLength > 0 && trimmedLength <= MAX_MESSAGE_LENGTH;
  const isUploading = Array.from(attachments.values()).some((file) => file.progress < 1);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      e.target.value = '';

      for (const file of selected) {
        if (attachments.size >= MAX_FILES) {
          showToast({
            message: localize('com_nav_feedback_attachment_limit', { 0: MAX_FILES }),
            status: 'warning',
          });
          break;
        }
        if (!imageMimeTypes.test(file.type)) {
          showToast({ message: localize('com_nav_feedback_attachment_type'), status: 'error' });
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          showToast({ message: localize('com_nav_feedback_attachment_size'), status: 'error' });
          continue;
        }

        const file_id = v4();
        const preview = URL.createObjectURL(file);
        setAttachments((prev) => {
          const next = new Map(prev);
          next.set(file_id, {
            file_id,
            file,
            preview,
            size: file.size,
            type: file.type,
            progress: 0,
          });
          return next;
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_id', file_id);
        formData.append('endpoint', 'default');
        uploadFile.mutate(formData);
      }
    },
    [attachments.size, localize, showToast, uploadFile],
  );

  const handleRemoveAttachment = useCallback(
    (tempId: string) => {
      const attachment = attachments.get(tempId);
      setAttachments((prev) => {
        const next = new Map(prev);
        next.delete(tempId);
        return next;
      });
      if (attachment?.filepath && attachment.file_id) {
        deleteFile.mutate({
          files: [
            {
              file_id: attachment.file_id,
              filepath: attachment.filepath,
              embedded: false,
              source: attachment.source ?? FileSources.local,
            },
          ],
        });
      }
    },
    [attachments, deleteFile],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitFeedback.isLoading || isUploading) {
      return;
    }
    const files = Array.from(attachments.values())
      .filter((file) => file.progress === 1)
      .map((file) => file.file_id);
    submitFeedback.mutate({ message: message.trim(), category, files });
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{localize('com_nav_feedback')}</h1>
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
                disabled={attachments.size >= MAX_FILES}
                className="flex items-center gap-1.5 rounded-md border border-border-light px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover disabled:opacity-40"
              >
                <Paperclip className="icon-sm" aria-hidden="true" />
                {localize('com_nav_feedback_attach_image')}
              </button>

              {attachments.size > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.from(attachments.entries()).map(([tempId, attachment]) => (
                    <Image
                      key={tempId}
                      imageBase64={attachment.preview}
                      progress={attachment.progress}
                      onDelete={() => handleRemoveAttachment(tempId)}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || submitFeedback.isLoading || isUploading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
            >
              {submitFeedback.isLoading
                ? localize('com_nav_feedback_submitting')
                : localize('com_nav_feedback_submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
