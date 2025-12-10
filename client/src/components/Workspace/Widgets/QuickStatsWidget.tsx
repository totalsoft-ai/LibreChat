import React from 'react';
import { MessageSquare, Users, Bot, Files, Sparkles } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface QuickStatsWidgetProps {
  stats: {
    conversationCount: number;
    agentCount: number;
    promptCount: number;
    fileCount: number;
    memberCount: number;
    lastActivityAt?: string | null;
  };
  className?: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  iconBgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, iconBgColor, iconColor }) => {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-light bg-surface-secondary p-4 transition-colors hover:bg-surface-tertiary">
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', iconBgColor)}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="flex-1">
        <div className="text-sm text-text-secondary">{label}</div>
        <div className="text-2xl font-bold text-text-primary">{value}</div>
      </div>
    </div>
  );
};

export default function QuickStatsWidget({ stats, className = '' }: QuickStatsWidgetProps) {
  const localize = useLocalize();

  return (
    <div className={className}>
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        {localize('com_workspace_quick_stats') || 'Workspace Stats'}
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<MessageSquare className="h-8 w-8" />}
          label={localize('com_workspace_conversations') || 'Conversations'}
          value={stats.conversationCount || 0}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={<Bot className="h-8 w-8" />}
          label={localize('com_workspace_agents') || 'Agents'}
          value={stats.agentCount || 0}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          icon={<Sparkles className="h-8 w-8" />}
          label={localize('com_workspace_prompts') || 'Prompts'}
          value={stats.promptCount || 0}
          iconBgColor="bg-pink-100 dark:bg-pink-900/30"
          iconColor="text-pink-600 dark:text-pink-400"
        />
        <StatCard
          icon={<Users className="h-8 w-8" />}
          label={localize('com_workspace_members') || 'Members'}
          value={stats.memberCount || 0}
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <StatCard
          icon={<Files className="h-8 w-8" />}
          label={localize('com_workspace_files') || 'Files'}
          value={stats.fileCount || 0}
          iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
      </div>
    </div>
  );
}
