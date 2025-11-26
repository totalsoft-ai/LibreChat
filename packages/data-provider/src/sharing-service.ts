import request from './request';

export type ShareableResourceType = 'agent' | 'prompt' | 'file';
export type VisibilityType = 'private' | 'workspace' | 'shared_with';

export interface ShareResourcePayload {
  visibility: VisibilityType;
  sharedWith?: string[]; // User IDs for 'shared_with' visibility
}

export interface UpdateVisibilityPayload {
  visibility: VisibilityType;
  sharedWith?: string[];
}

export interface SharedResource {
  id: string;
  name: string;
  type: ShareableResourceType;
  visibility: VisibilityType;
  sharedWith?: string[];
  isPinned: boolean;
  pinnedAt?: string;
  pinnedBy?: string;
  author: {
    _id: string;
    name: string;
    email?: string;
    username?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Build the resource endpoint based on resource type and ID
 */
const getResourceEndpoint = (resourceType: ShareableResourceType, resourceId: string): string => {
  const baseEndpoints = {
    agent: `/api/agents/${resourceId}`,
    prompt: `/api/prompts/${resourceId}`,
    file: `/api/files/${resourceId}`,
  };
  return baseEndpoints[resourceType];
};

/**
 * Share a resource with workspace
 */
export const shareResource = async (
  resourceType: ShareableResourceType,
  resourceId: string,
  payload: ShareResourcePayload,
): Promise<{ message: string; resource: SharedResource }> => {
  const endpoint = `${getResourceEndpoint(resourceType, resourceId)}/share`;
  return await request.post(endpoint, payload);
};

/**
 * Unshare a resource (set to private)
 */
export const unshareResource = async (
  resourceType: ShareableResourceType,
  resourceId: string,
): Promise<{ message: string; resource: SharedResource }> => {
  const endpoint = `${getResourceEndpoint(resourceType, resourceId)}/unshare`;
  return await request.post(endpoint, {});
};

/**
 * Update resource visibility settings
 */
export const updateResourceVisibility = async (
  resourceType: ShareableResourceType,
  resourceId: string,
  payload: UpdateVisibilityPayload,
): Promise<{ message: string; resource: SharedResource }> => {
  const endpoint = `${getResourceEndpoint(resourceType, resourceId)}/visibility`;
  return await request.patch(endpoint, payload);
};

/**
 * Get all shared resources in a workspace
 */
export const getSharedResources = async (
  workspaceId: string,
  resourceType: ShareableResourceType,
): Promise<SharedResource[]> => {
  const typeEndpoints = {
    agent: `/api/agents/workspace/${workspaceId}/shared`,
    prompt: `/api/prompts/workspace/${workspaceId}/shared`,
    file: `/api/files/workspace/${workspaceId}/shared`,
  };
  const response = await request.get<{ resources: SharedResource[]; count: number }>(
    typeEndpoints[resourceType],
  );
  return response.resources || [];
};

/**
 * Pin a resource to workspace start page
 */
export const pinResource = async (
  resourceType: ShareableResourceType,
  resourceId: string,
): Promise<{ message: string; resource: SharedResource }> => {
  const endpoint = `${getResourceEndpoint(resourceType, resourceId)}/pin`;
  return await request.post(endpoint, {});
};

/**
 * Unpin a resource from workspace start page
 */
export const unpinResource = async (
  resourceType: ShareableResourceType,
  resourceId: string,
): Promise<{ message: string; resource: SharedResource }> => {
  const endpoint = `${getResourceEndpoint(resourceType, resourceId)}/pin`;
  return await request.delete(endpoint);
};

/**
 * Get all shared resources across all types in a workspace
 */
export const getAllSharedResources = async (
  workspaceId: string,
): Promise<{
  agents: SharedResource[];
  prompts: SharedResource[];
  files: SharedResource[];
}> => {
  const [agents, prompts, files] = await Promise.all([
    getSharedResources(workspaceId, 'agent'),
    getSharedResources(workspaceId, 'prompt'),
    getSharedResources(workspaceId, 'file'),
  ]);

  return { agents, prompts, files };
};
