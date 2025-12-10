import React, { useCallback } from 'react';
import { v4 } from 'uuid';
import { Upload, FileText, Image, File as FileIcon, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';
import { useGetFiles, useDeleteFilesMutation, useUploadFileMutation } from '~/data-provider';

interface WorkspaceFilesWidgetProps {
  workspaceId: string;
  className?: string;
}

const FILE_TYPE_CONFIG = {
  image: {
    icon: Image,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  document: {
    icon: FileText,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  default: {
    icon: FileIcon,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
  },
};

const getFileTypeConfig = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'md'];

  if (ext && imageExts.includes(ext)) {
    return FILE_TYPE_CONFIG.image;
  }
  if (ext && docExts.includes(ext)) {
    return FILE_TYPE_CONFIG.document;
  }
  return FILE_TYPE_CONFIG.default;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatTimeAgo = (dateString: string): string => {
  const now = Date.now();
  const diff = now - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

export default function WorkspaceFilesWidget({ workspaceId, className = '' }: WorkspaceFilesWidgetProps) {
  const localize = useLocalize();

  // Fetch workspace files
  const { data: files = [], isLoading, refetch } = useGetFiles(workspaceId);

  // Upload mutation
  const uploadMutation = useUploadFileMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Delete mutation
  const deleteMutation = useDeleteFilesMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      Array.from(selectedFiles).forEach((file) => {
        const file_id = v4();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_id', file_id);
        formData.append('endpoint', 'default');
        formData.append('tool_resource', 'file_search');
        formData.append('workspace', workspaceId);
        uploadMutation.mutate(formData);
      });
    }
    // Reset input
    e.target.value = '';
  }, [workspaceId, uploadMutation]);

  const handleDelete = useCallback((file: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent onClick

    // Confirm deletion
    if (window.confirm(`${localize('com_ui_delete_confirm') || 'Are you sure you want to delete'} "${file.filename}"?`)) {
      deleteMutation.mutate({
        files: [{ file_id: file.file_id, filepath: file.filepath }],
      });
    }
  }, [deleteMutation, localize]);

  // Sort files by creation date (newest first)
  const sortedFiles = Array.isArray(files) ? [...files].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  }).slice(0, 10) : []; // Show max 10 recent files

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">
          {localize('com_workspace_files') || 'Workspace Files'}
        </h2>
        <label
          htmlFor="workspace-file-upload"
          className="cursor-pointer rounded-lg bg-btn-primary px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-btn-primary-hover"
        >
          <Upload className="inline-block h-4 w-4 mr-1" />
          Upload
          <input
            id="workspace-file-upload"
            type="file"
            className="hidden"
            multiple
            onChange={handleFileInputChange}
          />
        </label>
      </div>

      {/* Files Display Area */}
      <div
        className={cn(
          'relative min-h-[200px] rounded-lg border border-border-light bg-surface-secondary transition-all',
          uploadMutation.isLoading && 'opacity-50',
        )}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-text-secondary">
              {localize('com_ui_loading') || 'Loading...'}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Upload className="mb-3 h-12 w-12 text-text-tertiary" />
            <p className="text-sm font-medium text-text-primary">
              No files yet
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Click upload button to add files
            </p>
          </div>
        )}

        {/* Files List */}
        {!isLoading && sortedFiles.length > 0 && (
          <div className="space-y-2 p-3">
            {sortedFiles.map((file: any) => {
              const config = getFileTypeConfig(file.filename || file.file_id || '');
              const IconComponent = config.icon;

              return (
                <div
                  key={file.file_id || file._id}
                  className="group flex items-center gap-3 rounded-lg border border-border-light bg-surface-primary p-3 transition-colors hover:bg-surface-tertiary"
                >
                  {/* File Icon */}
                  <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg', config.bgColor)}>
                    <IconComponent className={cn('h-5 w-5', config.color)} />
                  </div>

                  {/* File Info */}
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-medium text-text-primary text-sm">
                      {file.filename || file.file_id || 'Unknown'}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      {file.bytes && <span>{formatFileSize(file.bytes)}</span>}
                      {file.createdAt && (
                        <>
                          <span>•</span>
                          <span>{formatTimeAgo(file.createdAt)}</span>
                        </>
                      )}
                      {/* Embedding status badge for RAG-indexed files */}
                      {file.filepath === 'vectordb' && (
                        <>
                          <span>•</span>
                          {file.embedded === true ? (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              Indexed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                              <Clock className="h-3 w-3" />
                              Processing...
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons (visible on hover) */}
                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => handleDelete(file, e)}
                      className="rounded p-1.5 hover:bg-surface-hover transition-colors"
                      title={localize('com_ui_delete') || 'Delete'}
                    >
                      <Trash2 className="h-4 w-4 text-text-secondary hover:text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Progress */}
        {uploadMutation.isLoading && (
          <div className="absolute bottom-3 left-3 right-3 rounded-lg border border-border-light bg-surface-primary p-3">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 animate-pulse text-btn-primary" />
              <span className="text-sm text-text-secondary">
                Uploading...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
