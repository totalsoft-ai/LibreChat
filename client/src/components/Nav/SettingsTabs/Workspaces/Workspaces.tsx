import React, { useState, useCallback } from 'react';
import { Building2, Plus, Settings2, Trash2 } from 'lucide-react';
import {
  Button,
  Label,
  OGDialog,
  OGDialogContent,
  OGDialogHeader,
  OGDialogTitle,
  OGDialogTrigger,
  Spinner,
} from '@librechat/client';
import { useLocalize, useAuthContext } from '~/hooks';
import {
  useGetWorkspacesQuery,
  useDeleteWorkspaceMutation,
  useLeaveWorkspaceMutation,
  type Workspace,
  type WorkspaceRole,
} from '~/data-provider';
import { useSetAtom } from 'jotai';
import { currentWorkspaceIdAtom } from '~/store/workspaces';
import WorkspaceSettings from '../../Workspaces/WorkspaceSettings';
import CreateWorkspaceDialog from '../../Workspaces/CreateWorkspaceDialog';

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

export default function Workspaces() {
  const localize = useLocalize();
  const { user } = useAuthContext();
  const setCurrentWorkspaceId = useSetAtom(currentWorkspaceIdAtom);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const { data: workspacesData, isLoading } = useGetWorkspacesQuery({
    staleTime: 60000, // Cache for 1 minute
    cacheTime: 300000, // Keep in cache for 5 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists
  });
  // Ensure workspaces is always an array
  const workspaces = Array.isArray(workspacesData) ? workspacesData : [];
  const deleteWorkspaceMutation = useDeleteWorkspaceMutation();
  const leaveWorkspaceMutation = useLeaveWorkspaceMutation();

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

  const handleDelete = async (workspace: Workspace) => {
    const role = getUserRole(workspace);
    if (role !== 'owner') return; // Only owner can delete

    if (
      window.confirm(
        localize('com_nav_workspace_delete_confirm') ||
          `Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteWorkspaceMutation.mutateAsync(workspace.workspaceId);
        setCurrentWorkspaceId(null);
      } catch (error) {
        console.error('Failed to delete workspace:', error);
      }
    }
  };

  const handleLeave = async (workspace: Workspace) => {
    const role = getUserRole(workspace);
    if (role === 'owner') {
      alert(
        localize('com_nav_workspace_owner_cannot_leave') ||
          'Owners cannot leave their workspace. Please delete it or transfer ownership first.',
      );
      return;
    }

    if (
      window.confirm(localize('com_nav_workspace_leave_confirm') || `Leave "${workspace.name}"?`)
    ) {
      try {
        await leaveWorkspaceMutation.mutateAsync(workspace.workspaceId);
        setCurrentWorkspaceId(null);
      } catch (error) {
        console.error('Failed to leave workspace:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label>{localize('com_nav_workspaces') || 'Workspaces'}</Label>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {localize('com_nav_workspace_create') || 'Create Workspace'}
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="mb-4 h-12 w-12 text-text-secondary" />
          <p className="text-sm text-text-secondary">
            {localize('com_nav_workspaces_empty') ||
              'No workspaces yet. Create one to get started!'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {workspaces.map((workspace) => {
            const role = getUserRole(workspace);
            const isOwner = role === 'owner';
            const isAdmin = role !== null && ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin;

            return (
              <div
                key={workspace.workspaceId}
                className="flex items-center justify-between rounded-lg border border-border-medium p-4"
              >
                <div className="flex flex-1 items-center gap-3">
                  <Building2 className="h-5 w-5 text-text-secondary" />
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-text-primary">{workspace.name}</span>
                    {workspace.description && (
                      <span className="text-xs text-text-secondary">{workspace.description}</span>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
                      <span>{role ? ROLE_LABELS[role] : 'Unknown'}</span>
                      <span>•</span>
                      <span>{workspace.members.length} members</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedWorkspace(workspace);
                        setShowSettingsDialog(true);
                      }}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  )}
                  {isOwner ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(workspace)}
                      disabled={deleteWorkspaceMutation.isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLeave(workspace)}
                      disabled={leaveWorkspaceMutation.isLoading}
                    >
                      {localize('com_nav_workspace_leave') || 'Leave'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateDialog && (
        <CreateWorkspaceDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={(workspace) => {
            setCurrentWorkspaceId(workspace.workspaceId);
            setShowCreateDialog(false);
          }}
        />
      )}

      {showSettingsDialog && selectedWorkspace && (
        <WorkspaceSettings
          open={showSettingsDialog}
          onOpenChange={setShowSettingsDialog}
          workspace={selectedWorkspace}
        />
      )}
    </div>
  );
}
