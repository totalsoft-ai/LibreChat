import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Users } from 'lucide-react';
import { getWorkspaceStartPage } from 'librechat-data-provider';
import type { StartPageConfig, WorkspaceStats, StartPageMember } from 'librechat-data-provider';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

const ROLE_LABELS: Record<string, string> = {
  viewer: 'Viewer',
  member: 'Member',
  admin: 'Admin',
  owner: 'Owner',
};

const ROLE_COLORS: Record<string, string> = {
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  member: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  owner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
};

interface StartPageData {
  workspaceId: string;
  workspaceName: string;
  description?: string;
  avatar?: string;
  color?: string;
  startPage: StartPageConfig;
  stats: WorkspaceStats;
  members: StartPageMember[];
  welcomeMessage?: string;
  guidelines?: string;
}

export default function StartPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const localize = useLocalize();
  const [dontShowAgain, setDontShowAgain] = useState(false);

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
    members,
    welcomeMessage,
    guidelines,
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
        className="border-b border-border-light px-6 py-8"
        style={{ backgroundColor: color ? `${color}10` : undefined }}
      >
        <div className="mx-auto max-w-4xl">
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
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
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

          {/* Stats */}
          {startPage.showStats && stats && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border-light bg-surface-secondary p-4">
                <div className="text-sm text-text-secondary">Conversations</div>
                <div className="text-2xl font-bold text-text-primary">
                  {stats.conversationCount || 0}
                </div>
              </div>
              <div className="rounded-lg border border-border-light bg-surface-secondary p-4">
                <div className="text-sm text-text-secondary">Messages</div>
                <div className="text-2xl font-bold text-text-primary">
                  {stats.messageCount || 0}
                </div>
              </div>
              <div className="rounded-lg border border-border-light bg-surface-secondary p-4">
                <div className="text-sm text-text-secondary">Tokens Used</div>
                <div className="text-2xl font-bold text-text-primary">
                  {stats.tokenUsage ? (stats.tokenUsage / 1000).toFixed(1) + 'K' : '0'}
                </div>
              </div>
            </div>
          )}

          {/* Team Members */}
          {members && members.length > 0 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-text-primary">
                <Users className="h-5 w-5" />
                Team Members ({members.length})
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 rounded-lg border border-border-light bg-surface-secondary p-4"
                  >
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name || member.username || 'User'}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-semibold text-white">
                        {(member.name || member.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-text-primary">
                        {member.name || member.username || 'User'}
                      </div>
                      {member.email && (
                        <div className="truncate text-xs text-text-secondary">{member.email}</div>
                      )}
                      <div className="mt-1">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                            ROLE_COLORS[member.role] || ROLE_COLORS.member,
                          )}
                        >
                          {ROLE_LABELS[member.role] || member.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Links */}
          {startPage.customLinks && startPage.customLinks.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-text-primary">Quick Links</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {startPage.customLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border-light bg-surface-secondary p-4 transition-colors hover:bg-surface-tertiary"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-tertiary">
                      {link.icon === 'document' && (
                        <svg
                          className="h-5 w-5 text-text-secondary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                      {link.icon === 'link' && (
                        <svg
                          className="h-5 w-5 text-text-secondary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      )}
                      {!link.icon && (
                        <svg
                          className="h-5 w-5 text-text-secondary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{link.title}</div>
                      <div className="text-xs text-text-secondary">{link.url}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
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

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 border-t border-border-light pt-8">
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
