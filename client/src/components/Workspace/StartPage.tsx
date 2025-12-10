import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { getWorkspaceStartPage } from 'librechat-data-provider';
import type { StartPageConfig, WorkspaceStats, StartPageMember } from 'librechat-data-provider';
import { useGetFiles } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { ChatContext } from '~/Providers/ChatContext';
import {
  QuickStatsWidget,
  RecentActivityWidget,
  PinnedResourcesWidget,
  QuickLinksWidget,
  TopContributorsWidget,
  RecentSharedWidget,
  WorkspaceFilesWidget,
} from './Widgets';

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

interface Contributor {
  userId: string;
  name: string;
  email?: string;
  avatar?: string;
  username?: string;
  activityCount: number;
  lastActivity: string;
}

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

interface EnhancedWorkspaceStats extends WorkspaceStats {
  agentCount: number;
  promptCount: number;
  fileCount: number;
}

interface StartPageData {
  workspaceId: string;
  workspaceName: string;
  description?: string;
  avatar?: string;
  color?: string;
  startPage: StartPageConfig;
  stats: EnhancedWorkspaceStats;
  members: StartPageMember[];
  welcomeMessage?: string;
  guidelines?: string;
  // Enhanced start page data
  recentActivity?: Activity[];
  pinnedResources?: {
    agents: PinnedAgent[];
    prompts: PinnedPrompt[];
  };
  topContributors?: Contributor[];
  recentShared?: SharedResource[];
}

export default function StartPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const localize = useLocalize();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // RAG Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data, isLoading, error } = useQuery<StartPageData>(
    ['workspaceStartPage', workspaceId],
    () => getWorkspaceStartPage(workspaceId!),
    {
      enabled: !!workspaceId,
      staleTime: 30 * 1000, // 30 seconds - reduced for fresher stats
      refetchOnMount: 'always', // Always refetch when component mounts
      refetchOnWindowFocus: true, // Refetch when window regains focus
    },
  );

  // Query for indexed files in workspace (for RAG search)
  const { data: allFiles = [] } = useGetFiles(workspaceId || '');
  const indexedFiles = allFiles.filter(
    (file: any) => file.embedded === true && file.filepath === 'vectordb'
  );

  useEffect(() => {
    // Check if user has seen this start page before
    const seenKey = `workspace_${workspaceId}_start_page_seen`;
    const hasSeen = localStorage.getItem(seenKey);

    if (hasSeen === 'true' && data?.startPage?.enabled) {
      // Already seen, redirect to main workspace
      navigate(`/c/new`, { replace: true });
    }
  }, [workspaceId, navigate, data?.startPage?.enabled]);

  const handleStartChatting = () => {
    if (dontShowAgain && workspaceId) {
      const seenKey = `workspace_${workspaceId}_start_page_seen`;
      localStorage.setItem(seenKey, 'true');
    }
    navigate(`/c/new`, { replace: true });
  };

  const handleAgentClick = (agentId: string) => {
    navigate(`/agents?agent_id=${agentId}`);
  };

  const handlePromptClick = (promptId: string) => {
    navigate(`/d/prompts/${promptId}`);
  };

  const handleResourceClick = (resourceType: string, resourceId: string) => {
    if (resourceType === 'agent') {
      navigate(`/agents?agent_id=${resourceId}`);
    } else if (resourceType === 'prompt') {
      navigate(`/d/prompts/${resourceId}`);
    } else if (resourceType === 'file') {
      navigate(`/d/files/${resourceId}`);
    }
  };

  // RAG Search handler
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !workspaceId || indexedFiles.length === 0) {
      return;
    }

    setIsSearching(true);
    setSearchResults(null);

    try {
      // Navigate to new conversation with workspace context and search query
      // The agent will automatically use file_search tool with workspace files
      navigate(`/c/new`, {
        state: {
          workspaceId: workspaceId,
          initialMessage: searchQuery,
          fileSearchEnabled: true,
        },
      });
    } catch (error) {
      console.error('Search failed:', error);
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-text-secondary">Error loading workspace start page</div>
      </div>
    );
  }

  const {
    workspaceName,
    description,
    avatar,
    color,
    startPage,
    stats,
    welcomeMessage,
    guidelines,
    recentActivity = [],
    pinnedResources = { agents: [], prompts: [] },
    topContributors = [],
    recentShared = [],
  } = data;

  if (!startPage.enabled) {
    // Start page disabled, redirect
    navigate(`/c/new`, { replace: true });
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-primary">
      {/* Header */}
      <div
        className="border-b border-border-light px-6 py-6"
        style={{ backgroundColor: color ? `${color}10` : undefined }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            {avatar ? (
              <img src={avatar} alt={workspaceName} className="h-16 w-16 rounded-lg" />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-lg text-2xl font-bold text-white"
                style={{ backgroundColor: color || '#3b82f6' }}
              >
                {workspaceName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{startPage.title}</h1>
              <p className="text-text-secondary">{workspaceName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Description */}
          {description && (
            <div className="rounded-lg border border-border-light bg-surface-secondary p-6">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">About This Workspace</h2>
              <p className="text-sm text-text-secondary">{description}</p>
            </div>
          )}

          {/* Welcome Message */}
          {welcomeMessage && (
            <div className="rounded-lg border border-border-light bg-surface-secondary p-6">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">Welcome Message</h2>
              <ReactMarkdown
                className="prose prose-sm dark:prose-invert max-w-none"
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      className="text-text-link hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              >
                {welcomeMessage}
              </ReactMarkdown>
            </div>
          )}

          {/* Welcome Content (Legacy - from start page config) */}
          {startPage.content && (
            <div className="rounded-lg border border-border-light bg-surface-secondary p-6">
              <ReactMarkdown
                className="prose prose-sm dark:prose-invert max-w-none"
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      className="text-text-link hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              >
                {startPage.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Quick Stats Widget */}
          {startPage.showStats && stats && (
            <QuickStatsWidget
              stats={{
                ...stats,
                memberCount: data.members?.length || 0,
              }}
            />
          )}

          {/* Two Column Layout for Widgets */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Recent Activity Widget */}
              {recentActivity && recentActivity.length > 0 && (
                <RecentActivityWidget activities={recentActivity} />
              )}

              {/* Top Contributors Widget */}
              {topContributors && topContributors.length > 0 && (
                <TopContributorsWidget contributors={topContributors} />
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Pinned Resources Widget */}
              {pinnedResources &&
                (pinnedResources.agents.length > 0 || pinnedResources.prompts.length > 0) && (
                  <PinnedResourcesWidget
                    pinnedResources={pinnedResources}
                    onAgentClick={handleAgentClick}
                    onPromptClick={handlePromptClick}
                  />
                )}

              {/* Recent Shared Widget */}
              {recentShared && recentShared.length > 0 && (
                <RecentSharedWidget
                  sharedResources={recentShared}
                  onResourceClick={handleResourceClick}
                />
              )}
            </div>
          </div>

          {/* Quick Links Widget */}
          {startPage.customLinks && startPage.customLinks.length > 0 && (
            <QuickLinksWidget customLinks={startPage.customLinks} />
          )}

          {/* Guidelines & Best Practices */}
          {guidelines && (
            <div className="rounded-lg border border-border-light bg-surface-secondary p-6">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">
                Guidelines & Best Practices
              </h2>
              <ReactMarkdown
                className="prose prose-sm dark:prose-invert max-w-none"
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      className="text-text-link hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              >
                {guidelines}
              </ReactMarkdown>
            </div>
          )}

          {/* RAG Search Section - Ask Questions About Workspace Files */}
          {indexedFiles.length > 0 && (
            <div className="rounded-lg border border-border-light bg-surface-secondary p-6">
              <h2 className="mb-3 text-lg font-semibold text-text-primary">
                Ask About Workspace Files
              </h2>
              <p className="mb-4 text-sm text-text-secondary">
                Search across {indexedFiles.length} indexed document{indexedFiles.length !== 1 ? 's' : ''} using AI.
                Get instant answers with source citations.
              </p>

              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask a question about your workspace files..."
                    className="flex-1 rounded-lg border border-border-medium bg-surface-primary px-4 py-3 text-sm text-text-primary placeholder-text-secondary focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    disabled={isSearching}
                  />
                  <button
                    type="submit"
                    disabled={!searchQuery.trim() || isSearching}
                    className="rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    This will start a new conversation with AI-powered search enabled.
                    The AI will search through your indexed workspace files and provide answers with citations.
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Workspace Files Widget */}
          {workspaceId && <WorkspaceFilesWidget workspaceId={workspaceId} />}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 border-t border-border-light pb-8 pt-8">
            <button
              onClick={handleStartChatting}
              className="rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
            >
              Start Chatting
            </button>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-border-medium"
              />
              Don't show this page again
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
