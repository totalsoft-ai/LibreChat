import React from 'react';
import { Bot, FileText, Pin, ExternalLink, User } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface ResourceAuthor {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  username?: string;
}

interface PinnedAgent {
  id: string;
  name: string;
  description?: string;
  author: ResourceAuthor;
  createdAt: string;
  updatedAt: string;
}

interface PinnedPrompt {
  id: string;
  name: string;
  prompt?: string;
  author: ResourceAuthor;
  createdAt: string;
  updatedAt: string;
}

interface PinnedResourcesWidgetProps {
  pinnedResources: {
    agents: PinnedAgent[];
    prompts: PinnedPrompt[];
  };
  className?: string;
  onAgentClick?: (agentId: string) => void;
  onPromptClick?: (promptId: string) => void;
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

export default function PinnedResourcesWidget({
  pinnedResources,
  className = '',
  onAgentClick,
  onPromptClick,
}: PinnedResourcesWidgetProps) {
  const localize = useLocalize();
  const { agents, prompts } = pinnedResources;

  const hasPinnedResources = agents.length > 0 || prompts.length > 0;

  if (!hasPinnedResources) {
    return (
      <div className={className}>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-text-primary">
          <Pin className="h-5 w-5" />
          {localize('com_workspace_pinned_resources') || 'Pinned Resources'}
        </h2>
        <div className="rounded-lg border border-border-light bg-surface-secondary p-8 text-center">
          <Pin className="mx-auto mb-2 h-12 w-12 text-text-tertiary" />
          <p className="text-sm text-text-secondary">
            {localize('com_workspace_no_pinned') || 'No pinned resources yet'}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {localize('com_workspace_pin_info') || 'Pin important agents and prompts to feature them here'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-text-primary">
        <Pin className="h-5 w-5" />
        {localize('com_workspace_pinned_resources') || 'Pinned Resources'}
      </h2>

      <div className="space-y-6">
        {/* Pinned Agents */}
        {agents.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-text-secondary">
              <Bot className="h-4 w-4" />
              {localize('com_workspace_agents') || 'Agents'} ({agents.length})
            </h3>
            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => onAgentClick?.(agent.id)}
                  className={cn(
                    'group flex items-start gap-3 rounded-lg border border-border-light bg-surface-secondary p-4 transition-colors',
                    onAgentClick && 'cursor-pointer hover:bg-surface-tertiary',
                  )}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-text-primary">{agent.name}</h4>
                        {agent.description && (
                          <p className="mt-1 text-sm text-text-secondary">
                            {truncateText(agent.description, 100)}
                          </p>
                        )}
                      </div>
                      {onAgentClick && (
                        <ExternalLink className="h-4 w-4 flex-shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                      <User className="h-3 w-3" />
                      <span>{agent.author.name || agent.author.username || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pinned Prompts */}
        {prompts.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-text-secondary">
              <FileText className="h-4 w-4" />
              {localize('com_workspace_prompts') || 'Prompts'} ({prompts.length})
            </h3>
            <div className="space-y-2">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => onPromptClick?.(prompt.id)}
                  className={cn(
                    'group flex items-start gap-3 rounded-lg border border-border-light bg-surface-secondary p-4 transition-colors',
                    onPromptClick && 'cursor-pointer hover:bg-surface-tertiary',
                  )}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
                    <FileText className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-text-primary">{prompt.name}</h4>
                        {prompt.prompt && (
                          <p className="mt-1 text-sm text-text-secondary">
                            {truncateText(prompt.prompt, 100)}
                          </p>
                        )}
                      </div>
                      {onPromptClick && (
                        <ExternalLink className="h-4 w-4 flex-shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                      <User className="h-3 w-3" />
                      <span>{prompt.author.name || prompt.author.username || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
