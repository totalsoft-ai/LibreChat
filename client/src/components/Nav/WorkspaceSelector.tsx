import React, { useCallback, useMemo, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Settings2, Check, Home } from 'lucide-react';
import * as Ariakit from '@ariakit/react';
import { DropdownPopup } from '@librechat/client';
import { useLocalize, useAuthContext } from '~/hooks';
import { useGetWorkspacesQuery, type Workspace, type WorkspaceRole } from '~/data-provider';
import { currentWorkspaceIdAtom, currentWorkspaceAtom, workspacesAtom } from '~/store/workspaces';
import { cn } from '~/utils';
import WorkspaceSettings from './Workspaces/WorkspaceSettings';
import CreateWorkspaceDialog from './Workspaces/CreateWorkspaceDialog';

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  viewer: 'Viewer',
  member: 'Member',
  admin: 'Admin',
  owner: 'Owner',
};

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

export default function WorkspaceSelector() {
  const localize = useLocalize();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useAtom(currentWorkspaceIdAtom);
  const currentWorkspace = useAtomValue(currentWorkspaceAtom);
  const setWorkspaces = useSetAtom(workspacesAtom);
  const [isPopoverActive, setIsPopoverActive] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const { data: workspacesData, isLoading, refetch } = useGetWorkspacesQuery();

  // Ensure workspaces is always an array
  const workspaces = useMemo(() => {
    const result = Array.isArray(workspacesData) ? workspacesData : [];
    if (result.length > 0) {
      console.log('[WorkspaceSelector] Workspaces loaded:', result.length, result);
    }
    return result;
  }, [workspacesData]);

  // Update Jotai atoms when workspaces data changes
  React.useEffect(() => {
    if (workspaces.length > 0) {
      setWorkspaces(workspaces);
      // Removed auto-selection: Let user explicitly choose workspace
      // Default is "Personal" mode (no workspace selected)
    }
  }, [workspaces, setWorkspaces]);

  const handleSelectWorkspace = useCallback(
    (workspaceId: string | null) => {
      setCurrentWorkspaceId(workspaceId);
      setIsPopoverActive(false);

      // If selecting a workspace (not personal), check if we should show start page
      if (workspaceId) {
        const seenKey = `workspace_${workspaceId}_start_page_seen`;
        const hasSeen = localStorage.getItem(seenKey);

        // Find workspace to check if start page is enabled
        const selectedWorkspace = workspaces.find((w) => w.workspaceId === workspaceId);
        const startPageEnabled = selectedWorkspace?.settings?.startPage?.enabled ?? true;

        // Navigate to start page if enabled and not seen before
        if (startPageEnabled && hasSeen !== 'true') {
          navigate(`/workspace/${workspaceId}/start`);
        }
      }
    },
    [setCurrentWorkspaceId, navigate, workspaces],
  );

  const getUserRole = useCallback(
    (workspace: Workspace): WorkspaceRole | null => {
      if (!user?.id) return null;
      const member = workspace.members.find((m) => {
        // Handle both cases: user can be a string (ID) or an object (populated)
        const memberUserId =
          typeof m.user === 'string' ? m.user : (m.user as any)?._id || (m.user as any)?.id;
        return memberUserId === user.id || memberUserId?.toString() === user.id?.toString();
      });
      return member?.role || null;
    },
    [user?.id],
  );

  const canManageWorkspace = useCallback(
    (workspace: Workspace): boolean => {
      const role = getUserRole(workspace);
      if (!role) return false;
      return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin; // Admin or Owner
    },
    [getUserRole],
  );

  const menuItems = useMemo(() => {
    const items: any[] = [];

    console.log(
      '[WorkspaceSelector] Building menu items, workspaces count:',
      workspaces.length,
      workspaces,
    );

    // Personal workspace (no workspace selected)
    items.push({
      hideOnClick: true,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleSelectWorkspace(null);
      },
      render: (props: any) => (
        <div
          key="personal"
          className={cn(
            'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-surface-hover',
            !currentWorkspaceId && 'bg-surface-hover',
          )}
          {...props}
        >
          <div className="flex flex-1 items-center gap-3">
            <Home className="h-4 w-4 text-text-secondary" />
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-text-primary">
                {localize('com_nav_workspace_personal') || 'Personal'}
              </span>
              <span className="text-xs text-text-secondary">
                {localize('com_nav_workspace_personal_desc') || 'Private conversations'}
              </span>
            </div>
            {!currentWorkspaceId && <Check className="h-4 w-4 text-text-primary" />}
          </div>
        </div>
      ),
    });

    // Divider after personal
    if (workspaces.length > 0) {
      items.push({
        hideOnClick: false,
        render: () => <div className="my-1 border-t border-border-medium" />,
      });
    }

    // Workspace list
    workspaces.forEach((workspace) => {
      console.log(
        '[WorkspaceSelector] Adding workspace to menu:',
        workspace.name,
        workspace.workspaceId,
      );
      const isSelected = workspace.workspaceId === currentWorkspaceId;
      const role = getUserRole(workspace);
      const canManage = canManageWorkspace(workspace);

      items.push({
        hideOnClick: true,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          handleSelectWorkspace(workspace.workspaceId);
        },
        render: (props: any) => (
          <div
            key={workspace.workspaceId}
            className={cn(
              'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-surface-hover',
              isSelected && 'bg-surface-hover',
            )}
            {...props}
          >
            <div className="flex flex-1 items-center gap-3">
              <Building2 className="h-4 w-4 text-text-secondary" />
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium text-text-primary">{workspace.name}</span>
                {role && <span className="text-xs text-text-secondary">{ROLE_LABELS[role]}</span>}
              </div>
              {isSelected && <Check className="h-4 w-4 text-text-primary" />}
            </div>
            {canManage && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowSettingsDialog(true);
                  setIsPopoverActive(false);
                }}
                className="hover:bg-surface-hover-secondary ml-2 rounded p-1"
                aria-label="Workspace settings"
              >
                <Settings2 className="h-4 w-4 text-text-secondary" />
              </button>
            )}
          </div>
        ),
      });
    });

    // Divider
    if (workspaces.length > 0) {
      items.push({
        hideOnClick: false,
        render: () => <div className="my-1 border-t border-border-medium" />,
      });
    }

    // Create workspace button
    items.push({
      hideOnClick: false,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowCreateDialog(true);
        setIsPopoverActive(false);
      },
      render: (props: any) => (
        <div
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-hover"
          {...props}
        >
          <Plus className="h-4 w-4 text-text-secondary" />
          <span className="text-sm text-text-primary">
            {localize('com_nav_workspace_create') || 'Create Workspace'}
          </span>
        </div>
      ),
    });

    return items;
  }, [
    workspaces,
    currentWorkspaceId,
    getUserRole,
    canManageWorkspace,
    handleSelectWorkspace,
    localize,
    setShowCreateDialog,
  ]);

  const menuTrigger = (
    <Ariakit.MenuButton
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border border-border-medium bg-surface-primary px-3 py-2 text-left transition-colors hover:bg-surface-hover',
        isLoading && 'opacity-50',
      )}
      disabled={isLoading}
      aria-label="Select workspace"
    >
      <Building2 className="h-4 w-4 flex-shrink-0 text-text-secondary" />
      <div className="flex flex-1 flex-col overflow-hidden">
        {currentWorkspace ? (
          <>
            <span className="truncate text-sm font-medium text-text-primary">
              {currentWorkspace.name}
            </span>
            <span className="truncate text-xs text-text-secondary">
              {ROLE_LABELS[getUserRole(currentWorkspace) || 0] || 'Workspace'}
            </span>
          </>
        ) : (
          <span className="text-sm text-text-secondary">
            {localize('com_nav_workspace_select') || 'Select Workspace'}
          </span>
        )}
      </div>
    </Ariakit.MenuButton>
  );

  return (
    <>
      <div className="mb-2">
        <DropdownPopup
          itemClassName=""
          menuId="workspace-selector-menu"
          isOpen={isPopoverActive}
          setIsOpen={setIsPopoverActive}
          modal={false}
          unmountOnHide={false}
          trigger={menuTrigger}
          items={menuItems}
        />
      </div>

      {showCreateDialog && (
        <CreateWorkspaceDialog
          open={showCreateDialog}
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) {
              // Reset form when dialog closes
            }
          }}
          onSuccess={async (workspace) => {
            setCurrentWorkspaceId(workspace.workspaceId);
            // Force refetch to ensure the list is updated
            await refetch();
          }}
        />
      )}

      {showSettingsDialog && currentWorkspace && (
        <WorkspaceSettings
          open={showSettingsDialog}
          onOpenChange={setShowSettingsDialog}
          workspace={currentWorkspace}
        />
      )}
    </>
  );
}
