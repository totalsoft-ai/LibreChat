import React from 'react';
import { Share2, Bot, FileText, Upload, User } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface SharedByUser {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  username?: string;
}

interface SharedResource {
  type: string;
  id: string;
  name: string;
  sharedBy: SharedByUser;
  sharedAt: string;
  activityType: string;
}

interface RecentSharedWidgetProps {
  sharedResources: SharedResource[];
  className?: string;
  onResourceClick?: (resourceType: string, resourceId: string) => void;
}

const RESOURCE_CONFIG: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  agent: {
    icon: Bot,
    label: 'Agent',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  prompt: {
    icon: FileText,
    label: 'Prompt',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
  },
  file: {
    icon: Upload,
    label: 'File',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
};

const formatTimeAgo = (dateString: string): string => {
  const now = Date.now();
  const diff = now - new Date(dateString).getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  }
  if (hours > 0) {
    return `${hours}h ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return 'just now';
};

export default function RecentSharedWidget({
  sharedResources,
  className = '',
  onResourceClick,
}: RecentSharedWidgetProps) {
  const localize = useLocalize();

  if (!sharedResources || sharedResources.length === 0) {
    return (
      <div className={className}>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-text-primary">
          <Share2 className="h-5 w-5" />
          {localize('com_workspace_recent_shared') || 'Recently Shared'}
        </h2>
        <div className="rounded-lg border border-border-light bg-surface-secondary p-8 text-center">
          <Share2 className="mx-auto mb-2 h-12 w-12 text-text-tertiary" />
          <p className="text-sm text-text-secondary">
            {localize('com_workspace_no_shared') || 'No shared resources yet'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-text-primary">
        <Share2 className="h-5 w-5" />
        {localize('com_workspace_recent_shared') || 'Recently Shared'}
      </h2>
      <div className="space-y-3">
        {sharedResources.map((resource) => {
          const config = RESOURCE_CONFIG[resource.type] || {
            icon: Share2,
            label: resource.type,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-900/30',
          };
          const Icon = config.icon;

          return (
            <div
              key={`${resource.type}-${resource.id}`}
              onClick={() => onResourceClick?.(resource.type, resource.id)}
              className={cn(
                'flex items-start gap-3 rounded-lg border border-border-light bg-surface-secondary p-4 transition-colors',
                onResourceClick && 'cursor-pointer hover:bg-surface-tertiary',
              )}
            >
              <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg', config.bgColor)}>
                <Icon className={cn('h-5 w-5', config.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium text-text-primary">{resource.name}</h3>
                      <span className={cn('text-xs font-medium', config.color)}>
                        {config.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
                      <User className="h-3 w-3" />
                      <span>
                        {localize('com_workspace_shared_by') || 'Shared by'}{' '}
                        <span className="font-medium">
                          {resource.sharedBy.name || resource.sharedBy.username || 'User'}
                        </span>
                      </span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-xs text-text-tertiary">
                    {formatTimeAgo(resource.sharedAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
