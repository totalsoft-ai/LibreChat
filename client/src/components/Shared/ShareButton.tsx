import React, { useState } from 'react';
import { Users, Lock, Building2, ChevronDown, Globe } from 'lucide-react';
import * as Ariakit from '@ariakit/react';
import { DropdownPopup } from '@librechat/client';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

export type VisibilityType = 'private' | 'workspace' | 'shared_with' | 'global';

interface ShareButtonProps {
  resourceType: 'agent' | 'prompt' | 'file';
  resourceId: string;
  currentVisibility?: VisibilityType;
  onVisibilityChange: (visibility: VisibilityType) => void;
  isOwner?: boolean;
  className?: string;
  disabled?: boolean;
}

const VISIBILITY_ICONS = {
  private: Lock,
  workspace: Building2,
  shared_with: Users,
  global: Globe,
};

const VISIBILITY_LABELS = {
  private: 'com_nav_share_private',
  workspace: 'com_nav_share_workspace',
  shared_with: 'com_nav_share_specific',
  global: 'com_nav_share_global',
};

const VISIBILITY_DESCRIPTIONS = {
  private: 'com_nav_share_private_desc',
  workspace: 'com_nav_share_workspace_desc',
  shared_with: 'com_nav_share_specific_desc',
  global: 'com_nav_share_global_desc',
};

export default function ShareButton({
  resourceType,
  resourceId,
  currentVisibility = 'private',
  onVisibilityChange,
  isOwner = true,
  className = '',
  disabled = false,
}: ShareButtonProps) {
  const localize = useLocalize();
  const [isPopoverActive, setIsPopoverActive] = useState(false);

  // Only owner can change sharing settings
  if (!isOwner) {
    const Icon = VISIBILITY_ICONS[currentVisibility];
    return (
      <div className={cn('flex items-center gap-2 text-sm text-text-secondary', className)}>
        <Icon className="h-4 w-4" />
        <span>{localize(VISIBILITY_LABELS[currentVisibility])}</span>
      </div>
    );
  }

  const handleVisibilityChange = (visibility: VisibilityType) => {
    onVisibilityChange(visibility);
    setIsPopoverActive(false);
  };

  const CurrentIcon = VISIBILITY_ICONS[currentVisibility];

  const menuItems = [
    {
      hideOnClick: true,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleVisibilityChange('private');
      },
      render: (props: any) => (
        <div
          key="private"
          className={cn(
            'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-hover',
            currentVisibility === 'private' && 'bg-surface-hover',
          )}
          {...props}
        >
          <Lock className="h-4 w-4 text-text-secondary" />
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium text-text-primary">
              {localize('com_nav_share_private') || 'Private'}
            </span>
            <span className="text-xs text-text-secondary">
              {localize('com_nav_share_private_desc') || 'Only you can access'}
            </span>
          </div>
          {currentVisibility === 'private' && (
            <div className="h-2 w-2 rounded-full bg-green-500" />
          )}
        </div>
      ),
    },
    {
      hideOnClick: true,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleVisibilityChange('workspace');
      },
      render: (props: any) => (
        <div
          key="workspace"
          className={cn(
            'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-hover',
            currentVisibility === 'workspace' && 'bg-surface-hover',
          )}
          {...props}
        >
          <Building2 className="h-4 w-4 text-text-secondary" />
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium text-text-primary">
              {localize('com_nav_share_workspace') || 'Workspace'}
            </span>
            <span className="text-xs text-text-secondary">
              {localize('com_nav_share_workspace_desc') || 'All workspace members can access'}
            </span>
          </div>
          {currentVisibility === 'workspace' && (
            <div className="h-2 w-2 rounded-full bg-green-500" />
          )}
        </div>
      ),
    },
    {
      hideOnClick: true,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleVisibilityChange('global');
      },
      render: (props: any) => (
        <div
          key="global"
          className={cn(
            'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-hover',
            currentVisibility === 'global' && 'bg-surface-hover',
          )}
          {...props}
        >
          <Globe className="h-4 w-4 text-text-secondary" />
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium text-text-primary">
              {localize('com_nav_share_global') || 'Global'}
            </span>
            <span className="text-xs text-text-secondary">
              {localize('com_nav_share_global_desc') || 'Anyone can view and use'}
            </span>
          </div>
          {currentVisibility === 'global' && (
            <div className="h-2 w-2 rounded-full bg-green-500" />
          )}
        </div>
      ),
    },
    // Commented out for future implementation
    // {
    //   hideOnClick: true,
    //   onClick: (e: React.MouseEvent) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     handleVisibilityChange('shared_with');
    //   },
    //   render: (props: any) => (
    //     <div
    //       key="shared_with"
    //       className={cn(
    //         'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-hover',
    //         currentVisibility === 'shared_with' && 'bg-surface-hover',
    //       )}
    //       {...props}
    //     >
    //       <Users className="h-4 w-4 text-text-secondary" />
    //       <div className="flex flex-1 flex-col">
    //         <span className="text-sm font-medium text-text-primary">
    //           {localize('com_nav_share_specific') || 'Specific people'}
    //         </span>
    //         <span className="text-xs text-text-secondary">
    //           {localize('com_nav_share_specific_desc') || 'Only specific members can access'}
    //         </span>
    //       </div>
    //       {currentVisibility === 'shared_with' && (
    //         <div className="h-2 w-2 rounded-full bg-green-500" />
    //       )}
    //     </div>
    //   ),
    // },
  ];

  const menuTrigger = (
    <Ariakit.MenuButton
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border-medium bg-surface-primary px-3 py-1.5 text-sm transition-colors hover:bg-surface-hover',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      disabled={disabled}
      aria-label="Change sharing settings"
    >
      <CurrentIcon className="h-4 w-4 text-text-secondary" />
      <span className="text-text-primary">{localize(VISIBILITY_LABELS[currentVisibility])}</span>
      <ChevronDown className="h-3 w-3 text-text-secondary" />
    </Ariakit.MenuButton>
  );

  return (
    <DropdownPopup
      itemClassName=""
      menuId={`share-menu-${resourceId}`}
      isOpen={isPopoverActive}
      setIsOpen={setIsPopoverActive}
      modal={false}
      unmountOnHide={false}
      trigger={menuTrigger}
      items={menuItems}
    />
  );
}
