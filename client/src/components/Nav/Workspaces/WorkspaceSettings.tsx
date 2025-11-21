import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  OGDialog,
  OGDialogTemplate,
  Input,
  Label,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  useToastContext,
} from '@librechat/client';
import { Users, Settings as SettingsIcon, Trash2, Cpu, FileText } from 'lucide-react';
import { useLocalize, useAuthContext } from '~/hooks';
import { NotificationSeverity } from '~/common';
import ConfirmationDialog from '~/components/ui/ConfirmationDialog';
import {
  updateWorkspaceSchema,
  updateWorkspaceInformationSchema,
  validateEmail,
  getCharacterCountStatus,
  type UpdateWorkspaceInput,
  type UpdateWorkspaceInformationInput,
} from '~/utils/workspaceValidation';
import {
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useAddWorkspaceMemberMutation,
  useUpdateWorkspaceMemberRoleMutation,
  useRemoveWorkspaceMemberMutation,
  useUpdateWorkspaceModelsMutation,
  useUpdateWorkspaceInformationMutation,
  useGetStartupConfig,
  lookupUserByEmail,
  type UpdateWorkspacePayload,
  type AddMemberPayload,
  type Workspace,
  type WorkspaceRole,
} from '~/data-provider';
import { useSetAtom } from 'jotai';
import { currentWorkspaceIdAtom } from '~/store/workspaces';

interface WorkspaceSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
}

const ROLE_OPTIONS: Array<{ value: WorkspaceRole; label: string }> = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
];

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

export default function WorkspaceSettings({
  open,
  onOpenChange,
  workspace: initialWorkspace,
}: WorkspaceSettingsProps) {
  const localize = useLocalize();
  const { user } = useAuthContext();
  const setCurrentWorkspaceId = useSetAtom(currentWorkspaceIdAtom);
  const { showToast } = useToastContext();
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string; email: string; avatar?: string; username?: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Confirmation dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Use query to get updated workspace data after mutations
  const { data: queriedWorkspace } = useGetWorkspaceQuery(initialWorkspace.workspaceId);
  const workspace = queriedWorkspace || initialWorkspace;

  const { data: startupConfig } = useGetStartupConfig();
  const updateWorkspaceMutation = useUpdateWorkspaceMutation(workspace.workspaceId);
  const deleteWorkspaceMutation = useDeleteWorkspaceMutation();
  const addMemberMutation = useAddWorkspaceMemberMutation(workspace.workspaceId);
  const updateMemberRoleMutation = useUpdateWorkspaceMemberRoleMutation(workspace.workspaceId);
  const removeMemberMutation = useRemoveWorkspaceMemberMutation(workspace.workspaceId);
  const updateModelsMutation = useUpdateWorkspaceModelsMutation(workspace.workspaceId);
  const updateInformationMutation = useUpdateWorkspaceInformationMutation(workspace.workspaceId);

  // Information tab state
  const [informationData, setInformationData] = useState({
    description: workspace.description || '',
    welcomeMessage: workspace.settings?.welcomeMessage || '',
    guidelines: workspace.settings?.guidelines || '',
  });

  // Information tab validation errors
  const [informationErrors, setInformationErrors] = useState<{
    description?: string;
    welcomeMessage?: string;
    guidelines?: string;
  }>({});

  // Sync informationData with workspace changes
  useEffect(() => {
    setInformationData({
      description: workspace.description || '',
      welcomeMessage: workspace.settings?.welcomeMessage || '',
      guidelines: workspace.settings?.guidelines || '',
    });
  }, [workspace.description, workspace.settings?.welcomeMessage, workspace.settings?.guidelines]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description || '',
    },
    mode: 'onChange', // Validate on change for better UX
  });

  const getUserRole = useCallback((): WorkspaceRole | null => {
    if (!user?.id) return null;
    const member = workspace.members.find((m) => {
      // Handle both cases: user can be a string (ID) or an object (populated)
      const memberUserId =
        typeof m.user === 'string' ? m.user : (m.user as any)?._id || (m.user as any)?.id;
      return memberUserId === user.id || memberUserId?.toString() === user.id?.toString();
    });
    return member?.role || null;
  }, [user?.id, workspace.members]);

  const userRole = getUserRole();
  const isOwner = userRole === 'owner';
  const isAdmin = userRole ? ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY.admin : false;
  const isAdminOrOwner = isAdmin || isOwner;

  const onSubmit = async (data: UpdateWorkspacePayload) => {
    if (!isAdmin) return;
    setIsSubmitting(true);
    try {
      await updateWorkspaceMutation.mutateAsync(data);
      reset(data);
      showToast({
        message: localize('com_nav_workspace_updated') || 'Workspace updated successfully',
        severity: NotificationSeverity.SUCCESS,
      });
    } catch (error) {
      console.error('Failed to update workspace:', error);
      showToast({
        message: localize('com_nav_workspace_update_error') || 'Failed to update workspace',
        severity: NotificationSeverity.ERROR,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!isOwner) return;
    try {
      await deleteWorkspaceMutation.mutateAsync(workspace.workspaceId);
      setCurrentWorkspaceId(null);
      onOpenChange(false);
      showToast({
        message: localize('com_nav_workspace_deleted') || 'Workspace deleted successfully',
        severity: NotificationSeverity.SUCCESS,
      });
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      showToast({
        message: localize('com_nav_workspace_delete_error') || 'Failed to delete workspace',
        severity: NotificationSeverity.ERROR,
      });
    }
  };

  // Debounced search for users
  const handleSearchChange = useCallback(
    (email: string) => {
      setNewMemberEmail(email);
      setSearchError(null);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!email.trim() || email.length < 3) {
        setSearchResults([]);
        setShowDropdown(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);

      // Debounce: wait 400ms before searching
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const lookupResults = await lookupUserByEmail(email.trim());

          // Filter out users who are already members
          const filteredResults = lookupResults.filter((result) => {
            const isAlreadyMember = workspace.members.some((m) => {
              const memberUserId =
                typeof m.user === 'string' ? m.user : (m.user as any)?._id || (m.user as any)?.id;
              return (
                memberUserId === result.id || memberUserId?.toString() === result.id?.toString()
              );
            });
            return !isAlreadyMember;
          });

          if (filteredResults.length === 0 && lookupResults.length > 0) {
            setSearchResults([]);
            setSearchError('All found users are already members of this workspace');
          } else if (filteredResults.length === 0) {
            setSearchResults([]);
            setSearchError('No users found');
          } else {
            setSearchResults(filteredResults);
            setSearchError(null);
          }
        } catch (error: any) {
          console.error('Failed to search user:', error);
          setSearchResults([]);
          setSearchError(error?.response?.data?.message || 'No users found');
        } finally {
          setIsSearching(false);
        }
      }, 400);
    },
    [workspace.members],
  );

  const handleAddMember = async (userId: string, userName: string) => {
    if (!isAdmin) return;

    try {
      await addMemberMutation.mutateAsync({
        userId,
        role: 'member',
      });

      // Clear search
      setNewMemberEmail('');
      setSearchResults([]);
      setShowDropdown(false);
      setSearchError(null);

      showToast({
        message: localize('com_nav_workspace_member_added') || `${userName} added to workspace`,
        severity: NotificationSeverity.SUCCESS,
      });
    } catch (error: any) {
      console.error('Failed to add member:', error);
      const message = error?.response?.data?.message || 'Failed to add member';
      setSearchError(message);
      showToast({
        message: localize('com_nav_workspace_member_add_error') || message,
        severity: NotificationSeverity.ERROR,
      });
    }
  };

  const handleUpdateMemberRole = async (memberUserId: string, role: WorkspaceRole) => {
    if (!isAdmin) return;
    try {
      await updateMemberRoleMutation.mutateAsync({ memberUserId, role });
      showToast({
        message: localize('com_nav_workspace_role_updated') || 'Member role updated successfully',
        severity: NotificationSeverity.SUCCESS,
      });
    } catch (error) {
      console.error('Failed to update member role:', error);
      showToast({
        message: localize('com_nav_workspace_role_update_error') || 'Failed to update member role',
        severity: NotificationSeverity.ERROR,
      });
    }
  };

  const confirmRemoveMember = async () => {
    if (!isAdmin || !memberToRemove) return;
    try {
      await removeMemberMutation.mutateAsync(memberToRemove.userId);
      showToast({
        message: localize('com_nav_workspace_member_removed') || 'Member removed from workspace',
        severity: NotificationSeverity.SUCCESS,
      });
    } catch (error) {
      console.error('Failed to remove member:', error);
      showToast({
        message: localize('com_nav_workspace_member_remove_error') || 'Failed to remove member',
        severity: NotificationSeverity.ERROR,
      });
    } finally {
      setMemberToRemove(null);
    }
  };

  return (
    <OGDialog open={open} onOpenChange={onOpenChange}>
      <OGDialogTemplate
        title={localize('com_nav_workspace_settings') || 'Workspace Settings'}
        className="max-w-2xl"
        main={
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isAdminOrOwner ? 'grid-cols-4' : 'grid-cols-2'}`}>
              <TabsTrigger value="general">
                <SettingsIcon className="mr-2 h-4 w-4" />
                {localize('com_nav_workspace_general') || 'General'}
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="mr-2 h-4 w-4" />
                {localize('com_nav_workspace_members') || 'Members'}
              </TabsTrigger>
              {isAdminOrOwner && (
                <TabsTrigger value="information">
                  <FileText className="mr-2 h-4 w-4" />
                  Information
                </TabsTrigger>
              )}
              {isOwner && (
                <TabsTrigger value="models">
                  <Cpu className="mr-2 h-4 w-4" />
                  Models
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="general" className="mt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-left text-sm font-medium">
                    {localize('com_nav_workspace_name') || 'Workspace Name'} *
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    disabled={!isAdmin}
                    className="w-full"
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <span id="name-error" className="text-xs text-red-500" role="alert">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description" className="text-left text-sm font-medium">
                    {localize('com_nav_workspace_description') || 'Description'}
                  </Label>
                  <textarea
                    id="description"
                    {...register('description')}
                    disabled={!isAdmin}
                    className="min-h-[80px] w-full rounded-lg border border-border-medium bg-surface-primary px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none disabled:opacity-50"
                    rows={3}
                    aria-invalid={errors.description ? 'true' : 'false'}
                    aria-describedby={errors.description ? 'description-error' : undefined}
                  />
                  {errors.description && (
                    <span id="description-error" className="text-xs text-red-500" role="alert">
                      {errors.description.message}
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting
                        ? localize('com_ui_saving') || 'Saving...'
                        : localize('com_ui_save') || 'Save'}
                    </Button>
                  </div>
                )}

                {isOwner && (
                  <div className="mt-4 border-t border-border-medium pt-4">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {localize('com_nav_workspace_delete') || 'Delete Workspace'}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="members" className="mt-4">
              <div className="flex flex-col gap-4">
                {isAdmin && (
                  <div className="relative" ref={searchContainerRef}>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          value={newMemberEmail}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          onFocus={() => newMemberEmail.length >= 3 && setShowDropdown(true)}
                          placeholder={
                            localize('com_nav_workspace_add_member_placeholder') ||
                            'Search users by email (min 3 chars)'
                          }
                          className="w-full"
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border-heavy border-t-text-primary" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Search Error */}
                    {searchError && (
                      <div className="mt-2 rounded-md bg-red-50 p-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        {searchError}
                      </div>
                    )}

                    {/* Dropdown with search results */}
                    {showDropdown && searchResults.length > 0 && (
                      <div className="absolute z-10 mt-2 w-full rounded-lg border border-border-medium bg-surface-primary shadow-lg">
                        {searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between border-b border-border-light p-3 last:border-b-0 hover:bg-surface-hover"
                          >
                            <div className="flex items-center gap-3">
                              {result.avatar ? (
                                <img
                                  src={result.avatar}
                                  alt={result.name}
                                  className="h-8 w-8 rounded-full"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-tertiary text-sm font-medium text-text-primary">
                                  {result.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-text-primary">
                                  {result.name}
                                </span>
                                <span className="text-xs text-text-secondary">{result.email}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddMember(result.id, result.name)}
                              disabled={addMemberMutation.isLoading}
                            >
                              {addMemberMutation.isLoading ? 'Adding...' : 'Add'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {workspace.members.map((member) => {
                    const memberUserId =
                      typeof member.user === 'string'
                        ? member.user
                        : (member.user as any)?._id || (member.user as any)?.id;
                    const isCurrentUser =
                      memberUserId === user?.id ||
                      memberUserId?.toString() === user?.id?.toString();
                    // Check if this member is the workspace creator
                    const isCreator =
                      memberUserId === workspace.createdBy ||
                      memberUserId?.toString() === workspace.createdBy?.toString();
                    // Owners can edit other owners (to demote them), admins can't edit owners
                    const canEdit =
                      !isCurrentUser &&
                      ((isOwner && member.role === 'owner') || (isAdmin && member.role !== 'owner'));
                    const canRemove =
                      isAdmin &&
                      !isCurrentUser &&
                      (isOwner || ROLE_HIERARCHY[member.role] < ROLE_HIERARCHY.admin);

                    // Get user data from populated user or userData field
                    const userData =
                      (member as any).userData ||
                      (typeof member.user === 'object' ? member.user : null);
                    const userName = userData?.name || user?.name || 'Unknown User';
                    const userEmail = userData?.email || user?.email || '';
                    const userAvatar = userData?.avatar || user?.avatar;

                    return (
                      <div
                        key={memberUserId}
                        className="flex items-center justify-between rounded-lg border border-border-medium p-3"
                      >
                        <div className="flex items-center gap-3">
                          {userAvatar ? (
                            <img
                              src={userAvatar}
                              alt={userName}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-tertiary text-sm font-medium text-text-primary">
                              {userName?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="flex flex-1 flex-col">
                            <span className="text-sm font-medium text-text-primary">
                              {userName}
                              {isCurrentUser && ' (You)'}
                            </span>
                            <span className="text-xs text-text-secondary">{userEmail}</span>
                            <span className="text-xs text-text-secondary">
                              {ROLE_OPTIONS.find((r) => r.value === member.role)?.label ||
                                'Unknown'}
                              {' • '}
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <select
                              value={member.role}
                              onChange={(e) =>
                                handleUpdateMemberRole(
                                  memberUserId,
                                  e.target.value as WorkspaceRole,
                                )
                              }
                              className="rounded border border-border-medium bg-surface-primary px-2 py-1 text-sm"
                            >
                              {ROLE_OPTIONS.filter((r) => {
                                // Only the workspace creator can have the owner role
                                // Hide owner option unless editing the creator
                                if (r.value === 'owner' && !isCreator) {
                                  return false;
                                }
                                return true;
                              }).map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                          {canRemove && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setMemberToRemove({ userId: memberUserId, name: userName })
                              }
                              aria-label={`Remove ${userName} from workspace`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Information Tab - Admin/Owner Only */}
            {isAdminOrOwner && (
              <TabsContent value="information" className="mt-4">
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg border border-border-light bg-surface-secondary p-4">
                    <h3 className="mb-2 font-semibold text-text-primary">Workspace Information</h3>
                    <p className="mb-4 text-sm text-text-secondary">
                      Customize the information displayed on the workspace start page for all
                      members.
                    </p>

                    <div className="space-y-4">
                      {/* Description */}
                      <div>
                        <Label className="mb-2 text-sm font-medium">Description</Label>
                        <p className="mb-2 text-xs text-text-secondary">
                          A brief description of this workspace (max 500 characters)
                        </p>
                        <textarea
                          className="w-full rounded border border-border-medium bg-surface-primary p-2 text-sm text-text-primary focus:border-border-xheavy focus:outline-none"
                          rows={3}
                          maxLength={500}
                          value={informationData.description}
                          onChange={(e) =>
                            setInformationData({ ...informationData, description: e.target.value })
                          }
                          placeholder="E.g., This workspace is dedicated to our marketing team collaboration..."
                        />
                        <p className="mt-1 text-xs text-text-secondary">
                          {informationData.description.length}/500 characters
                        </p>
                      </div>

                      {/* Welcome Message */}
                      <div>
                        <Label className="mb-2 text-sm font-medium">Welcome Message</Label>
                        <p className="mb-2 text-xs text-text-secondary">
                          A welcome message for new members (supports Markdown, max 5000 characters)
                        </p>
                        <textarea
                          className="w-full rounded border border-border-medium bg-surface-primary p-2 font-mono text-sm text-text-primary focus:border-border-xheavy focus:outline-none"
                          rows={8}
                          maxLength={5000}
                          value={informationData.welcomeMessage}
                          onChange={(e) => {
                            setInformationData({
                              ...informationData,
                              welcomeMessage: e.target.value,
                            });
                            // Clear error on change
                            if (informationErrors.welcomeMessage) {
                              setInformationErrors({ ...informationErrors, welcomeMessage: undefined });
                            }
                          }}
                          placeholder="## Welcome to the team!&#10;&#10;Here's what you need to know:&#10;- Check the guidelines below&#10;- Use appropriate models for your tasks&#10;- Tag your conversations properly"
                          aria-invalid={informationErrors.welcomeMessage ? 'true' : 'false'}
                          aria-describedby={
                            informationErrors.welcomeMessage ? 'welcome-error' : undefined
                          }
                        />
                        {informationErrors.welcomeMessage && (
                          <span id="welcome-error" className="mt-1 text-xs text-red-500" role="alert">
                            {informationErrors.welcomeMessage}
                          </span>
                        )}
                        <p
                          className={`mt-1 text-xs ${
                            (() => {
                              const status = getCharacterCountStatus(
                                informationData.welcomeMessage,
                                5000,
                              );
                              if (status.status === 'error') return 'text-red-500 font-medium';
                              if (status.status === 'danger') return 'text-orange-500 font-medium';
                              if (status.status === 'warning') return 'text-yellow-600';
                              return 'text-text-secondary';
                            })()
                          }`}
                        >
                          {informationData.welcomeMessage.length}/5000 characters
                          {(() => {
                            const status = getCharacterCountStatus(informationData.welcomeMessage, 5000);
                            return status.message ? ` • ${status.message}` : '';
                          })()}
                          {' • Markdown supported'}
                        </p>
                      </div>

                      {/* Guidelines */}
                      <div>
                        <Label className="mb-2 text-sm font-medium">
                          Guidelines & Best Practices
                        </Label>
                        <p className="mb-2 text-xs text-text-secondary">
                          Guidelines for using this workspace (supports Markdown, max 5000
                          characters)
                        </p>
                        <textarea
                          className="w-full rounded border border-border-medium bg-surface-primary p-2 font-mono text-sm text-text-primary focus:border-border-xheavy focus:outline-none"
                          rows={8}
                          maxLength={5000}
                          value={informationData.guidelines}
                          onChange={(e) => {
                            setInformationData({ ...informationData, guidelines: e.target.value });
                            // Clear error on change
                            if (informationErrors.guidelines) {
                              setInformationErrors({ ...informationErrors, guidelines: undefined });
                            }
                          }}
                          placeholder="1. **Tag all conversations** with relevant topics&#10;2. **Use appropriate models** for different tasks&#10;3. **Share useful prompts** with the team&#10;4. **Review guidelines** before asking questions"
                          aria-invalid={informationErrors.guidelines ? 'true' : 'false'}
                          aria-describedby={informationErrors.guidelines ? 'guidelines-error' : undefined}
                        />
                        {informationErrors.guidelines && (
                          <span id="guidelines-error" className="mt-1 text-xs text-red-500" role="alert">
                            {informationErrors.guidelines}
                          </span>
                        )}
                        <p
                          className={`mt-1 text-xs ${
                            (() => {
                              const status = getCharacterCountStatus(informationData.guidelines, 5000);
                              if (status.status === 'error') return 'text-red-500 font-medium';
                              if (status.status === 'danger') return 'text-orange-500 font-medium';
                              if (status.status === 'warning') return 'text-yellow-600';
                              return 'text-text-secondary';
                            })()
                          }`}
                        >
                          {informationData.guidelines.length}/5000 characters
                          {(() => {
                            const status = getCharacterCountStatus(informationData.guidelines, 5000);
                            return status.message ? ` • ${status.message}` : '';
                          })()}
                          {' • Markdown supported'}
                        </p>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end">
                        <Button
                          onClick={async () => {
                            // Validate before submitting
                            const validation = updateWorkspaceInformationSchema.safeParse(
                              informationData,
                            );

                            if (!validation.success) {
                              const errors = validation.error.flatten().fieldErrors;
                              setInformationErrors({
                                description: errors.description?.[0],
                                welcomeMessage: errors.welcomeMessage?.[0],
                                guidelines: errors.guidelines?.[0],
                              });
                              showToast({
                                message:
                                  localize('com_ui_validation_error') ||
                                  'Please fix validation errors',
                                severity: NotificationSeverity.ERROR,
                              });
                              return;
                            }

                            // Clear errors
                            setInformationErrors({});

                            try {
                              await updateInformationMutation.mutateAsync(informationData);
                              showToast({
                                message:
                                  localize('com_nav_workspace_info_updated') ||
                                  'Workspace information updated successfully',
                                severity: NotificationSeverity.SUCCESS,
                              });
                            } catch (error) {
                              console.error('Failed to update workspace information:', error);
                              showToast({
                                message:
                                  localize('com_nav_workspace_info_update_error') ||
                                  'Failed to update workspace information',
                                severity: NotificationSeverity.ERROR,
                              });
                            }
                          }}
                          disabled={updateInformationMutation.isLoading}
                        >
                          {updateInformationMutation.isLoading ? 'Saving...' : 'Save Information'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Models Tab - Owner Only */}
            {isOwner && (
              <TabsContent value="models" className="mt-4">
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg border border-border-light bg-surface-secondary p-4">
                    <h3 className="mb-2 font-semibold text-text-primary">Model Access Control</h3>
                    <p className="mb-4 text-sm text-text-secondary">
                      Select which AI models/endpoints members can use in this workspace. Leave all
                      unchecked to allow everything.
                    </p>

                    {/* Model Specs Section */}
                    {startupConfig?.modelSpecs?.list &&
                      startupConfig.modelSpecs.list.length > 0 && (
                        <div className="mb-4">
                          <Label className="mb-2 text-sm font-medium">Available Models:</Label>
                          <div className="max-h-60 space-y-2 overflow-y-auto rounded border border-border-medium p-3">
                            {startupConfig.modelSpecs.list.map((spec) => {
                              const modelName = spec.name || spec.preset?.model || 'Unknown';
                              const isSelected =
                                workspace.settings?.availableModels?.includes(modelName) ?? false;
                              const allAllowed =
                                !workspace.settings?.availableModels ||
                                workspace.settings.availableModels.length === 0;

                              return (
                                <label
                                  key={modelName}
                                  className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-surface-hover"
                                >
                                  <input
                                    type="checkbox"
                                    checked={allAllowed || isSelected}
                                    onChange={async (e) => {
                                      const currentModels =
                                        workspace.settings?.availableModels || [];
                                      let newModels: string[] | null;

                                      if (e.target.checked) {
                                        // Add model
                                        if (currentModels.length === 0) {
                                          // First selection - add all EXCEPT this one, then toggle
                                          newModels = startupConfig.modelSpecs.list
                                            .map((s) => s.name || s.preset?.model)
                                            .filter(Boolean)
                                            .filter((m) => m !== modelName);
                                          if (
                                            newModels.length ===
                                            startupConfig.modelSpecs.list.length - 1
                                          ) {
                                            // Only one was unchecked, now checking it means all
                                            newModels = null;
                                          }
                                        } else {
                                          newModels = [...currentModels, modelName];
                                          // Check if all are selected
                                          if (
                                            newModels.length ===
                                            startupConfig.modelSpecs.list.length
                                          ) {
                                            newModels = null; // Allow all
                                          }
                                        }
                                      } else {
                                        // Remove model
                                        if (currentModels.length === 0) {
                                          // All were allowed, now restrict to all EXCEPT this one
                                          newModels = startupConfig.modelSpecs.list
                                            .map((s) => s.name || s.preset?.model)
                                            .filter(Boolean)
                                            .filter((m) => m !== modelName);
                                        } else {
                                          newModels = currentModels.filter((m) => m !== modelName);
                                          if (newModels.length === 0) {
                                            newModels = null; // Reset to allow all
                                          }
                                        }
                                      }

                                      try {
                                        await updateModelsMutation.mutateAsync({
                                          availableModels: newModels,
                                          availableEndpoints:
                                            workspace.settings?.availableEndpoints || null,
                                        });
                                        showToast({
                                          message:
                                            localize('com_nav_workspace_models_updated') ||
                                            'Workspace models updated successfully',
                                          severity: NotificationSeverity.SUCCESS,
                                        });
                                      } catch (error) {
                                        console.error('Failed to update models:', error);
                                        showToast({
                                          message:
                                            localize('com_nav_workspace_models_update_error') ||
                                            'Failed to update workspace models',
                                          severity: NotificationSeverity.ERROR,
                                        });
                                      }
                                    }}
                                    className="rounded border-border-medium"
                                    disabled={updateModelsMutation.isLoading}
                                  />
                                  <span className="text-sm text-text-primary">{modelName}</span>
                                  {spec.preset?.endpoint && (
                                    <span className="ml-auto text-xs text-text-secondary">
                                      {spec.preset.endpoint}
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* Current Status */}
                    <div className="mt-4 rounded border border-border-light bg-surface-tertiary p-3">
                      {!workspace.settings?.availableModels ||
                      workspace.settings.availableModels.length === 0 ? (
                        <div className="text-sm text-text-secondary">
                          ✓ All models are currently available to members
                        </div>
                      ) : (
                        <div>
                          <Label className="text-sm font-medium">
                            Restricted to {workspace.settings.availableModels.length} models:
                          </Label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {workspace.settings.availableModels.map((model) => (
                              <span
                                key={model}
                                className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                              >
                                {model}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        }
      />

      {/* Delete Workspace Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteWorkspace}
        title={localize('com_nav_workspace_delete_confirm_title') || 'Delete Workspace'}
        description={
          localize('com_nav_workspace_delete_confirm') ||
          'Are you sure you want to delete this workspace? This action cannot be undone.'
        }
        confirmText={localize('com_ui_delete') || 'Delete'}
        cancelText={localize('com_ui_cancel') || 'Cancel'}
        variant="destructive"
        isLoading={deleteWorkspaceMutation.isLoading}
        consequences={[
          'All conversations will be archived',
          'All agents and prompts will be unlinked',
          'All files will be unlinked',
          'Members will lose access to workspace resources',
        ]}
      />

      {/* Remove Member Confirmation Dialog */}
      <ConfirmationDialog
        open={memberToRemove !== null}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        onConfirm={confirmRemoveMember}
        title={localize('com_nav_workspace_remove_member_title') || 'Remove Member'}
        description={
          memberToRemove
            ? localize('com_nav_workspace_remove_member_confirm') ||
              `Remove ${memberToRemove.name} from this workspace?`
            : ''
        }
        confirmText={localize('com_ui_remove') || 'Remove'}
        cancelText={localize('com_ui_cancel') || 'Cancel'}
        variant="destructive"
        isLoading={removeMemberMutation.isLoading}
        consequences={['User will lose access to workspace conversations and resources']}
      />
    </OGDialog>
  );
}
