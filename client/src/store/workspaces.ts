import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Workspace } from 'librechat-data-provider';

export type WorkspaceState = {
  currentWorkspaceId: string | null;
  workspaces: Workspace[];
  isLoading: boolean;
  error: Error | null;
};

// Main workspace state atom
export const workspaceAtom = atom<WorkspaceState>({
  currentWorkspaceId: null,
  workspaces: [],
  isLoading: false,
  error: null,
});

// Persist current workspace selection in localStorage
export const currentWorkspaceIdAtom = atomWithStorage<string | null>('current-workspace-id', null);

// Derived atom for current workspace
export const currentWorkspaceAtom = atom(
  (get) => {
    const state = get(workspaceAtom);
    const currentId = get(currentWorkspaceIdAtom);
    if (!currentId) return null;
    return state.workspaces.find((w) => w.workspaceId === currentId) || null;
  },
  (get, set, workspace: Workspace | null) => {
    if (workspace) {
      set(currentWorkspaceIdAtom, workspace.workspaceId);
      // Update workspaces list if needed
      const state = get(workspaceAtom);
      const exists = state.workspaces.some((w) => w.workspaceId === workspace.workspaceId);
      if (!exists) {
        set(workspaceAtom, {
          ...state,
          workspaces: [...state.workspaces, workspace],
        });
      }
    } else {
      set(currentWorkspaceIdAtom, null);
    }
  },
);

// Derived atom for workspaces list
export const workspacesAtom = atom(
  (get) => get(workspaceAtom).workspaces,
  (get, set, workspaces: Workspace[]) => {
    set(workspaceAtom, { ...get(workspaceAtom), workspaces });
  },
);

// Derived atom for loading state
export const workspacesLoadingAtom = atom(
  (get) => get(workspaceAtom).isLoading,
  (get, set, isLoading: boolean) => {
    set(workspaceAtom, { ...get(workspaceAtom), isLoading });
  },
);

// Derived atom for error state
export const workspacesErrorAtom = atom(
  (get) => get(workspaceAtom).error,
  (get, set, error: Error | null) => {
    set(workspaceAtom, { ...get(workspaceAtom), error });
  },
);

// Helper atom to check if user is in a workspace
export const isInWorkspaceAtom = atom((get) => {
  const currentId = get(currentWorkspaceIdAtom);
  return currentId !== null;
});

// Helper atom to get user's role in current workspace
export const currentWorkspaceRoleAtom = atom((get) => {
  const workspace = get(currentWorkspaceAtom);
  if (!workspace) return null;
  // This would need the current user ID - typically from auth context
  // For now, return the first member's role as placeholder
  // In actual implementation, filter by current user ID
  return workspace.members[0]?.role || null;
});

export default {
  workspaceAtom,
  currentWorkspaceIdAtom,
  currentWorkspaceAtom,
  workspacesAtom,
  workspacesLoadingAtom,
  workspacesErrorAtom,
  isInWorkspaceAtom,
  currentWorkspaceRoleAtom,
};
