import React from 'react';
import {
  MessageSquare,
  Bot,
  FileText,
  Upload,
  UserPlus,
  Pin,
  Share2,
  Briefcase,
  Edit,
} from 'lucide-react';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface ActivityUser {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  username?: string;
}

interface Activity {
  _id: string;
  type: string;
  user: ActivityUser;
  resourceType?: string;
  resourceName?: string;
  createdAt: string;
}

interface RecentActivityWidgetProps {
  activities: Activity[];
  className?: string;
}

const ACTIVITY_CONFIG: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string;
  }
> = {
  conversation_created: {
    icon: MessageSquare,
    label: 'created a conversation',
    color: 'text-blue-600 dark:text-blue-400',
  },
  agent_created: {
    icon: Bot,
    label: 'created an agent',
    color: 'text-purple-600 dark:text-purple-400',
  },
  agent_shared: {
    icon: Share2,
    label: 'shared an agent',
    color: 'text-green-600 dark:text-green-400',
  },
  agent_pinned: {
    icon: Pin,
    label: 'pinned an agent',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  prompt_created: {
    icon: FileText,
    label: 'created a prompt',
    color: 'text-pink-600 dark:text-pink-400',
  },
  prompt_shared: {
    icon: Share2,
    label: 'shared a prompt',
    color: 'text-green-600 dark:text-green-400',
  },
  prompt_pinned: {
    icon: Pin,
    label: 'pinned a prompt',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  file_uploaded: {
    icon: Upload,
    label: 'uploaded a file',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  file_shared: {
    icon: Share2,
    label: 'shared a file',
    color: 'text-green-600 dark:text-green-400',
  },
  member_joined: {
    icon: UserPlus,
    label: 'joined the workspace',
    color: 'text-teal-600 dark:text-teal-400',
  },
  member_left: {
    icon: UserPlus,
    label: 'left the workspace',
    color: 'text-gray-600 dark:text-gray-400',
  },
  workspace_created: {
    icon: Briefcase,
    label: 'created the workspace',
    color: 'text-blue-600 dark:text-blue-400',
  },
  workspace_updated: {
    icon: Edit,
    label: 'updated the workspace',
    color: 'text-orange-600 dark:text-orange-400',
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

export default function RecentActivityWidget({ activities, className = '' }: RecentActivityWidgetProps) {
  const localize = useLocalize();

  if (!activities || activities.length === 0) {
    return (
      <div className={className}>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          {localize('com_workspace_recent_activity') || 'Recent Activity'}
        </h2>
        <div className="rounded-lg border border-border-light bg-surface-secondary p-8 text-center">
          <MessageSquare className="mx-auto mb-2 h-12 w-12 text-text-tertiary" />
          <p className="text-sm text-text-secondary">
            {localize('com_workspace_no_activity') || 'No recent activity yet'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        {localize('com_workspace_recent_activity') || 'Recent Activity'}
      </h2>
      <div className="space-y-3">
        {activities.map((activity) => {
          const config = ACTIVITY_CONFIG[activity.type] || {
            icon: MessageSquare,
            label: activity.type.replace(/_/g, ' '),
            color: 'text-gray-600 dark:text-gray-400',
          };
          const Icon = config.icon;

          return (
            <div
              key={activity._id}
              className="flex items-start gap-3 rounded-lg border border-border-light bg-surface-secondary p-4 transition-colors hover:bg-surface-tertiary"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-surface-tertiary">
                <Icon className={cn('h-5 w-5', config.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">
                      <span className="font-medium">
                        {activity.user.name || activity.user.username || 'User'}
                      </span>{' '}
                      <span className="text-text-secondary">{config.label}</span>
                      {activity.resourceName && (
                        <span className="font-medium"> "{activity.resourceName}"</span>
                      )}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-text-tertiary">
                    {formatTimeAgo(activity.createdAt)}
                  </span>
                </div>
                {activity.user.email && (
                  <p className="mt-0.5 text-xs text-text-tertiary">{activity.user.email}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
