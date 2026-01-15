import React, { useRef, useState, useEffect } from 'react';
import { Link, Pin } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { OGDialog, OGDialogContent, Button, useToastContext } from '@librechat/client';
import {
  QueryKeys,
  Constants,
  EModelEndpoint,
  PermissionBits,
  LocalStorageKeys,
  AgentListResponse,
  useUpdateVisibilityMutation,
  usePinResourceMutation,
  useUnpinResourceMutation,
} from 'librechat-data-provider';
import type t from 'librechat-data-provider';
import { renderAgentAvatar, clearMessagesCache, cn } from '~/utils';
import { useLocalize, useDefaultConvo, useAuthContext } from '~/hooks';
import { useChatContext } from '~/Providers';
import { ShareButton, SharedBadge } from '~/components/Shared';

interface SupportContact {
  name?: string;
  email?: string;
}

interface AgentWithSupport extends t.Agent {
  support_contact?: SupportContact;
}
interface AgentDetailProps {
  agent: AgentWithSupport; // The agent data to display
  isOpen: boolean; // Whether the detail dialog is open
  onClose: () => void; // Callback when dialog is closed
}

/**
 * Dialog for displaying agent details
 */
const AgentDetail: React.FC<AgentDetailProps> = ({ agent, isOpen, onClose }) => {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const { user } = useAuthContext();
  const dialogRef = useRef<HTMLDivElement>(null);
  const getDefaultConversation = useDefaultConvo();
  const { conversation, newConversation } = useChatContext();

  // Sharing mutations
  const updateVisibilityMutation = useUpdateVisibilityMutation();
  const pinResourceMutation = usePinResourceMutation();
  const unpinResourceMutation = useUnpinResourceMutation();

  // Local state for current visibility
  const [currentVisibility, setCurrentVisibility] = useState<'private' | 'workspace' | 'shared_with' | 'global'>(
    (agent.visibility as 'private' | 'workspace' | 'shared_with' | 'global') || 'private'
  );
  const [isPinned, setIsPinned] = useState(agent.isPinned || false);

  // Sync local state with agent prop when it changes
  useEffect(() => {
    if (agent.visibility) {
      setCurrentVisibility(agent.visibility as 'private' | 'workspace' | 'shared_with' | 'global');
    }
    if (agent.isPinned !== undefined) {
      setIsPinned(agent.isPinned);
    }
  }, [agent.visibility, agent.isPinned]);

  // Check if user is the owner
  const isOwner = agent.author === user?.id || agent.author?._id === user?.id;

  /**
   * Navigate to chat with the selected agent
   */
  const handleStartChat = () => {
    if (agent) {
      const keys = [QueryKeys.agents, { requiredPermission: PermissionBits.EDIT }];
      const listResp = queryClient.getQueryData<AgentListResponse>(keys);
      if (listResp != null) {
        if (!listResp.data.some((a) => a.id === agent.id)) {
          const currentAgents = [agent, ...JSON.parse(JSON.stringify(listResp.data))];
          queryClient.setQueryData<AgentListResponse>(keys, { ...listResp, data: currentAgents });
        }
      }

      localStorage.setItem(`${LocalStorageKeys.AGENT_ID_PREFIX}0`, agent.id);

      clearMessagesCache(queryClient, conversation?.conversationId);
      queryClient.invalidateQueries([QueryKeys.messages]);

      /** Template with agent configuration */
      const template = {
        conversationId: Constants.NEW_CONVO as string,
        endpoint: EModelEndpoint.agents,
        agent_id: agent.id,
        title: localize('com_agents_chat_with', { name: agent.name || localize('com_ui_agent') }),
      };

      const currentConvo = getDefaultConversation({
        conversation: { ...(conversation ?? {}), ...template },
        preset: template,
      });

      newConversation({
        template: currentConvo,
        preset: template,
      });
    }
  };

  /**
   * Copy the agent's shareable link to clipboard
   */
  const handleCopyLink = () => {
    const baseUrl = new URL(window.location.origin);
    const chatUrl = `${baseUrl.origin}/c/new?agent_id=${agent.id}`;
    navigator.clipboard
      .writeText(chatUrl)
      .then(() => {
        showToast({
          message: localize('com_agents_link_copied'),
        });
      })
      .catch(() => {
        showToast({
          message: localize('com_agents_link_copy_failed'),
        });
      });
  };

  /**
   * Handle visibility change from ShareButton
   */
  const handleVisibilityChange = (visibility: 'private' | 'workspace' | 'shared_with' | 'global') => {
    updateVisibilityMutation.mutate(
      {
        resourceType: 'agent',
        resourceId: agent.id,
        payload: { visibility },
      },
      {
        onSuccess: () => {
          setCurrentVisibility(visibility);

          // Update the agent object in cache optimistically
          const updatedAgent = { ...agent, visibility };

          // Update all relevant queries
          queryClient.setQueryData(['agent', agent.id], updatedAgent);

          // Invalidate list queries to refetch with updated data
          queryClient.invalidateQueries([QueryKeys.agents]);
          queryClient.invalidateQueries([QueryKeys.marketplaceAgents]);

          showToast({
            message: localize('com_workspace_visibility_updated'),
          });
        },
        onError: () => {
          showToast({
            message: localize('com_workspace_visibility_update_failed'),
          });
        },
      }
    );
  };

  /**
   * Handle pin/unpin toggle
   */
  const handlePinToggle = () => {
    const newPinnedState = !isPinned;
    const mutation = isPinned ? unpinResourceMutation : pinResourceMutation;
    mutation.mutate(
      {
        resourceType: 'agent',
        resourceId: agent.id,
      },
      {
        onSuccess: () => {
          setIsPinned(newPinnedState);

          // Update the agent object in cache optimistically
          const updatedAgent = {
            ...agent,
            isPinned: newPinnedState,
            pinnedAt: newPinnedState ? new Date().toISOString() : null,
            pinnedBy: newPinnedState ? user?.id : null,
          };

          // Update all relevant queries
          queryClient.setQueryData(['agent', agent.id], updatedAgent);

          // Invalidate list queries to refetch with updated data
          queryClient.invalidateQueries([QueryKeys.agents]);
          queryClient.invalidateQueries([QueryKeys.marketplaceAgents]);

          showToast({
            message: isPinned
              ? localize('com_workspace_resource_unpinned')
              : localize('com_workspace_resource_pinned'),
          });
        },
        onError: () => {
          showToast({
            message: localize('com_workspace_pin_failed'),
          });
        },
      }
    );
  };

  /**
   * Format contact information with mailto links when appropriate
   */
  const formatContact = () => {
    if (!agent?.support_contact) return null;

    const { name, email } = agent.support_contact;

    if (name && email) {
      return (
        <a href={`mailto:${email}`} className="text-primary hover:underline">
          {name}
        </a>
      );
    }

    if (email) {
      return (
        <a href={`mailto:${email}`} className="text-primary hover:underline">
          {email}
        </a>
      );
    }

    if (name) {
      return <span>{name}</span>;
    }

    return null;
  };

  return (
    <OGDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <OGDialogContent ref={dialogRef} className="max-h-[90vh] w-11/12 max-w-lg overflow-y-auto">
        {/* Agent avatar - top center */}
        <div className="mt-6 flex justify-center">{renderAgentAvatar(agent, { size: 'xl' })}</div>

        {/* Agent name - center aligned below image */}
        <div className="mt-3 text-center">
          <h2 className="text-2xl font-bold text-text-primary">
            {agent?.name || localize('com_agents_loading')}
          </h2>
          {/* Shared badge - only show if not owner and not private (owner sees ShareButton instead) */}
          {!isOwner && currentVisibility !== 'private' && (
            <div className="mt-2 flex justify-center">
              <SharedBadge visibility={currentVisibility} size="md" />
            </div>
          )}
        </div>

        {/* Contact info - center aligned below name */}
        {agent?.support_contact && formatContact() && (
          <div className="mt-1 text-center text-sm text-text-secondary">
            {localize('com_agents_contact')}: {formatContact()}
          </div>
        )}

        {/* Agent description - below contact */}
        <div className="mt-4 whitespace-pre-wrap px-6 text-center text-base text-text-primary">
          {agent?.description}
        </div>

        {/* Action buttons row - below description */}
        <div className="mt-4 flex items-center justify-center gap-2 px-6">
          {/* Share button - only for owner */}
          {isOwner && (
            <ShareButton
              resourceType="agent"
              resourceId={agent.id}
              currentVisibility={currentVisibility}
              onVisibilityChange={handleVisibilityChange}
              isOwner={isOwner}
            />
          )}

          {/* Pin button - only for workspace-shared agents */}
          {currentVisibility === 'workspace' && isOwner && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              aria-label={isPinned ? localize('com_workspace_unpin') : localize('com_workspace_pin')}
              onClick={handlePinToggle}
              title={isPinned ? localize('com_workspace_unpin') : localize('com_workspace_pin')}
            >
              <Pin className={cn('h-4 w-4', isPinned && 'fill-current')} />
              {isPinned ? localize('com_workspace_unpin') : localize('com_workspace_pin')}
            </Button>
          )}

          {/* Copy link button */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            aria-label={localize('com_agents_copy_link')}
            onClick={handleCopyLink}
            title={localize('com_agents_copy_link')}
          >
            <Link className="h-4 w-4" />
            {localize('com_agents_copy_link')}
          </Button>
        </div>

        {/* Start chat button */}
        <div className="mb-4 mt-6 flex justify-center">
          <Button className="w-full max-w-xs" onClick={handleStartChat} disabled={!agent}>
            {localize('com_agents_start_chat')}
          </Button>
        </div>
      </OGDialogContent>
    </OGDialog>
  );
};

export default AgentDetail;
