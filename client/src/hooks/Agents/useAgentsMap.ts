import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { PermissionBits } from 'librechat-data-provider';
import type { TAgentsMap } from 'librechat-data-provider';
import { useListAgentsQuery } from '~/data-provider';
import { mapAgents } from '~/utils';
import { currentWorkspaceAtom } from '~/store/workspaces';

export default function useAgentsMap({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}): TAgentsMap | undefined {
  const currentWorkspace = useAtomValue(currentWorkspaceAtom);
  const workspaceObjectId = (currentWorkspace as { _id?: string } | null)?.['_id'];
  const workspaceFilter = workspaceObjectId ?? 'personal';

  const { data: mappedAgents = null } = useListAgentsQuery(
    { requiredPermission: PermissionBits.VIEW, workspace: workspaceFilter },
    {
      select: (res) => mapAgents(res.data),
      enabled: isAuthenticated,
    },
  );

  const agentsMap = useMemo<TAgentsMap | undefined>(() => {
    return mappedAgents !== null ? mappedAgents : undefined;
  }, [mappedAgents]);

  return agentsMap;
}
