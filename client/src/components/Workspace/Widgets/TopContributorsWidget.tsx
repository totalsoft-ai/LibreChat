import React from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { useLocalize } from '~/hooks';

interface Contributor {
  userId: string;
  name: string;
  email?: string;
  avatar?: string;
  username?: string;
  activityCount: number;
  lastActivity: string;
}

interface TopContributorsWidgetProps {
  contributors: Contributor[];
  className?: string;
}

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

export default function TopContributorsWidget({
  contributors,
  className = '',
}: TopContributorsWidgetProps) {
  const localize = useLocalize();

  if (!contributors || contributors.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-text-primary">
        <Award className="h-5 w-5" />
        {localize('com_workspace_top_contributors') || 'Top Contributors'}
      </h2>
      <div className="space-y-3">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.userId}
            className="flex items-center gap-3 rounded-lg border border-border-light bg-surface-secondary p-4 transition-colors hover:bg-surface-tertiary"
          >
            {/* Rank badge */}
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-sm font-bold text-white">
              {index + 1}
            </div>

            {/* Avatar */}
            {contributor.avatar ? (
              <img
                src={contributor.avatar}
                alt={contributor.name || contributor.username || 'User'}
                className="h-10 w-10 flex-shrink-0 rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-semibold text-white">
                {(contributor.name || contributor.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            {/* User info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate font-medium text-text-primary">
                  {contributor.name || contributor.username || 'User'}
                </h3>
                <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>{contributor.activityCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                {contributor.email && (
                  <p className="truncate text-xs text-text-tertiary">{contributor.email}</p>
                )}
                <p className="flex-shrink-0 text-xs text-text-tertiary">
                  {localize('com_workspace_last_active') || 'Active'}{' '}
                  {formatTimeAgo(contributor.lastActivity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
