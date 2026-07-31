import { useRef, useState, useCallback } from 'react';
import { v4 } from 'uuid';
import { Paperclip } from 'lucide-react';
import { useToastContext } from '@librechat/client';
import { imageMimeTypes } from 'librechat-data-provider';
import Image from '~/components/Chat/Input/Files/Image';
import { useSubmitFeedback } from '~/data-provider/Feedback';
import type { FeedbackCategory, FeedbackImage } from '~/data-provider/Feedback';
import { useLocalize } from '~/hooks';

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

export default function Feedback() {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitFeedback = useSubmitFeedback({
    onSuccess: () => {
      setMessage('');
      setCategory('suggestion');
      setAttachments([]);
      showToast({ message: localize('com_nav_feedback_success'), status: 'success' });
    },
    onError: () => {
      showToast({ message: localize('com_nav_feedback_error'), status: 'error' });
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
      </div>
    </div>
  );
}
