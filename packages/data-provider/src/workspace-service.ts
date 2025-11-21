import request from './request';
import {
  workspaces as workspacesEndpoint,
  workspace,
  workspaceStats,
  workspaceLeave,
  workspaceMembers,
  workspaceMember,
} from './api-endpoints';

export type WorkspaceRole = 'viewer' | 'member' | 'admin' | 'owner';

export interface WorkspaceMember {
  user: string; // User ID (always a string after normalization)
  role: WorkspaceRole;
  joinedAt: string;
  invitedBy?: string;
  userData?: {
    // Optional: populated user data when available
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
    username?: string;
  };
}

export interface StartPageLink {
  title: string;
  url: string;
  icon?: string;
}

export interface StartPageConfig {
  enabled: boolean;
  title: string;
  content: string;
  showStats: boolean;
  customLinks: StartPageLink[];
}

export interface WorkspaceSettings {
  defaultModel?: string;
  tokenBudget?: number;
  allowPublicSharing?: boolean;
  requireApprovalForSharing?: boolean;
  // Model access control
  availableModels?: string[] | null; // null = all models
  availableEndpoints?: string[] | null; // null = all endpoints
  // Start page
  startPage?: StartPageConfig;
  // Workspace information
  welcomeMessage?: string;
  guidelines?: string;
}

export interface WorkspaceStats {
  conversationCount: number;
  messageCount: number;
  tokenUsage: number;
  lastActivityAt?: string;
}

export interface Workspace {
  workspaceId: string;
  name: string;
  slug: string;
  description?: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  stats: WorkspaceStats;
  isArchived: boolean;
  createdBy: string; // User ID of workspace creator
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
  settings?: Partial<WorkspaceSettings>;
}

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string;
  settings?: Partial<WorkspaceSettings>;
}

export interface AddMemberPayload {
  userId: string;
  role: WorkspaceRole;
}

export interface UpdateMemberRolePayload {
  role: WorkspaceRole;
}

/**
 * Get all workspaces for the current user
 */
export const getWorkspaces = async (): Promise<Workspace[]> => {
  const response = await request.get<{ workspaces: Workspace[]; count: number }>(
    workspacesEndpoint(),
  );
  return response.workspaces || [];
};

/**
 * Get a specific workspace by ID or slug
 */
export const getWorkspace = async (identifier: string): Promise<Workspace> => {
  const response = await request.get<{ workspace: Workspace }>(workspace(identifier));
  return response.workspace;
};

/**
 * Create a new workspace
 */
export const createWorkspace = async (payload: CreateWorkspacePayload): Promise<Workspace> => {
  const response = (await request.post(workspacesEndpoint(), payload)) as {
    message: string;
    workspace: Workspace;
  };
  return response.workspace;
};

/**
 * Update a workspace
 */
export const updateWorkspace = async (
  workspaceId: string,
  payload: UpdateWorkspacePayload,
): Promise<Workspace> => {
  return (await request.patch(workspace(workspaceId), payload)) as Workspace;
};

/**
 * Delete (archive) a workspace
 */
export const deleteWorkspace = async (workspaceId: string): Promise<void> => {
  await request.delete(workspace(workspaceId));
};

/**
 * Get workspace statistics
 */
export const getWorkspaceStats = async (workspaceId: string): Promise<WorkspaceStats> => {
  return await request.get<WorkspaceStats>(workspaceStats(workspaceId));
};

/**
 * Leave a workspace
 */
export const leaveWorkspace = async (workspaceId: string): Promise<void> => {
  await request.post(workspaceLeave(workspaceId));
};

/**
 * Add a member to a workspace
 */
export const addWorkspaceMember = async (
  workspaceId: string,
  payload: AddMemberPayload,
): Promise<Workspace> => {
  // Backend expects memberUserId, not userId
  const backendPayload = {
    memberUserId: payload.userId,
    role: payload.role,
  };
  const response = (await request.post(workspaceMembers(workspaceId), backendPayload)) as {
    message: string;
    workspace: Workspace;
  };
  return response.workspace;
};

/**
 * Update a member's role in a workspace
 */
export const updateWorkspaceMemberRole = async (
  workspaceId: string,
  memberUserId: string,
  payload: UpdateMemberRolePayload,
): Promise<Workspace> => {
  return (await request.patch(workspaceMember(workspaceId, memberUserId), payload)) as Workspace;
};

/**
 * Remove a member from a workspace
 */
export const removeWorkspaceMember = async (
  workspaceId: string,
  memberUserId: string,
): Promise<Workspace> => {
  return await request.delete<Workspace>(workspaceMember(workspaceId, memberUserId));
};

/**
 * Update workspace available models (owner only)
 */
export const updateWorkspaceModels = async (
  workspaceId: string,
  availableModels: string[] | null,
  availableEndpoints?: string[] | null,
): Promise<{ availableModels: string[] | null; availableEndpoints: string[] | null }> => {
  const response = await request.put(`${workspace(workspaceId)}/settings/models`, {
    availableModels,
    availableEndpoints,
  });
  return response.settings;
};

/**
 * Update workspace start page (owner/admin only)
 */
export const updateWorkspaceStartPage = async (
  workspaceId: string,
  startPage: Partial<StartPageConfig>,
): Promise<StartPageConfig> => {
  const response = await request.put(`${workspace(workspaceId)}/settings/start-page`, startPage);
  return response.startPage;
};

export interface StartPageMember {
  userId: string;
  name?: string;
  email?: string;
  username?: string;
  avatar?: string;
  role: WorkspaceRole;
  joinedAt: string;
}

/**
 * Update workspace information (owner/admin only)
 */
export interface UpdateWorkspaceInformationPayload {
  description?: string;
  welcomeMessage?: string;
  guidelines?: string;
}

export const updateWorkspaceInformation = async (
  workspaceId: string,
  payload: UpdateWorkspaceInformationPayload,
): Promise<{
  description?: string;
  welcomeMessage?: string;
  guidelines?: string;
}> => {
  const response = await request.put(`${workspace(workspaceId)}/settings/information`, payload);
  return response.information;
};

/**
 * Get workspace start page (all members)
 */
export const getWorkspaceStartPage = async (
  workspaceId: string,
): Promise<{
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
}> => {
  return await request.get(`${workspace(workspaceId)}/start-page`);
};
