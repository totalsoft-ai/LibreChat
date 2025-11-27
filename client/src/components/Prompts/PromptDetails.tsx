import React, { useMemo, useState } from 'react';
import { Pin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import supersub from 'remark-supersub';
import { Label, Button, useToastContext } from '@librechat/client';
import rehypeHighlight from 'rehype-highlight';
import {
  replaceSpecialVars,
  useUpdateVisibilityMutation,
  usePinResourceMutation,
  useUnpinResourceMutation,
} from 'librechat-data-provider';
import type { TPromptGroup } from 'librechat-data-provider';
import { codeNoExecution } from '~/components/Chat/Messages/Content/MarkdownComponents';
import { useLocalize, useAuthContext } from '~/hooks';
import { ShareButton, SharedBadge } from '~/components/Shared';
import CategoryIcon from './Groups/CategoryIcon';
import PromptVariables from './PromptVariables';
import { PromptVariableGfm } from './Markdown';
import Description from './Description';
import Command from './Command';

const PromptDetails = ({ group }: { group?: TPromptGroup }) => {
  const localize = useLocalize();
  const { user } = useAuthContext();
  const { showToast } = useToastContext();

  // Sharing mutations
  const updateVisibilityMutation = useUpdateVisibilityMutation();
  const pinResourceMutation = usePinResourceMutation();
  const unpinResourceMutation = useUnpinResourceMutation();

  // Local state for current visibility
  const [currentVisibility, setCurrentVisibility] = useState<'private' | 'workspace' | 'shared_with' | 'global'>(
    (group?.visibility as 'private' | 'workspace' | 'shared_with' | 'global') || 'private'
  );
  const [isPinned, setIsPinned] = useState(group?.isPinned || false);

  // Check if user is the owner
  const isOwner = group?.author === user?.id || group?.author?._id === user?.id;

  const mainText = useMemo(() => {
    const initialText = group?.productionPrompt?.prompt ?? '';
    return replaceSpecialVars({ text: initialText, user });
  }, [group?.productionPrompt?.prompt, user]);

  /**
   * Handle visibility change from ShareButton
   */
  const handleVisibilityChange = (visibility: 'private' | 'workspace' | 'shared_with' | 'global') => {
    if (!group?._id) return;

    updateVisibilityMutation.mutate(
      {
        resourceType: 'prompt',
        resourceId: group._id,
        payload: { visibility },
      },
      {
        onSuccess: () => {
          setCurrentVisibility(visibility);
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
    if (!group?._id) return;

    const mutation = isPinned ? unpinResourceMutation : pinResourceMutation;
    mutation.mutate(
      {
        resourceType: 'prompt',
        resourceId: group._id,
      },
      {
        onSuccess: () => {
          setIsPinned(!isPinned);
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

  if (!group) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-between p-4 text-text-primary sm:flex-row">
        <div className="mb-1 flex flex-row items-center gap-3 font-bold sm:text-xl md:mb-0 md:text-2xl">
          <div className="mb-1 flex items-center md:mb-0">
            <div className="rounded pr-2">
              {(group.category?.length ?? 0) > 0 ? (
                <CategoryIcon category={group.category ?? ''} />
              ) : null}
            </div>
            <Label className="text-2xl font-bold">{group.name}</Label>
          </div>
          {/* Shared badge - only show if not owner and not private (owner sees ShareButton instead) */}
          {!isOwner && currentVisibility !== 'private' && (
            <SharedBadge visibility={currentVisibility} size="md" />
          )}
        </div>

        {/* Action buttons */}
        {isOwner && (
          <div className="flex items-center gap-2">
            {/* Pin button - only for workspace-shared prompts */}
            {currentVisibility === 'workspace' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={isPinned ? localize('com_workspace_unpin') : localize('com_workspace_pin')}
                onClick={handlePinToggle}
                title={isPinned ? localize('com_workspace_unpin') : localize('com_workspace_pin')}
              >
                <Pin className={isPinned ? 'fill-current' : ''} />
              </Button>
            )}

            {/* Share button */}
            {group._id && (
              <ShareButton
                resourceType="prompt"
                resourceId={group._id}
                currentVisibility={currentVisibility}
                onVisibilityChange={handleVisibilityChange}
                isOwner={isOwner}
              />
            )}
          </div>
        )}
      </div>
      <div className="flex h-full max-h-screen flex-col overflow-y-auto md:flex-row">
        <div className="flex flex-1 flex-col gap-4 p-0 md:max-h-[calc(100vh-150px)] md:p-2">
          <div>
            <h2 className="flex items-center justify-between rounded-t-lg border border-border-light py-2 pl-4 text-base font-semibold text-text-primary">
              {localize('com_ui_prompt_text')}
            </h2>
            <div className="group relative min-h-32 rounded-b-lg border border-border-light p-4 transition-all duration-150">
              <ReactMarkdown
                remarkPlugins={[
                  /** @ts-ignore */
                  supersub,
                  remarkGfm,
                  [remarkMath, { singleDollarTextMath: false }],
                ]}
                rehypePlugins={[
                  /** @ts-ignore */
                  [rehypeKatex],
                  /** @ts-ignore */
                  [rehypeHighlight, { ignoreMissing: true }],
                ]}
                /** @ts-ignore */
                components={{ p: PromptVariableGfm, code: codeNoExecution }}
                className="markdown prose dark:prose-invert light dark:text-gray-70 my-1 break-words"
              >
                {mainText}
              </ReactMarkdown>
            </div>
          </div>
          <PromptVariables promptText={mainText} showInfo={false} />
          <Description initialValue={group.oneliner} disabled={true} />
          <Command initialValue={group.command} disabled={true} />
        </div>
      </div>
    </div>
  );
};

export default PromptDetails;
