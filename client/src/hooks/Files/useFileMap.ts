import { useAtomValue } from 'jotai';
import { useGetFiles } from '~/data-provider';
import { currentWorkspaceIdAtom } from '~/store/workspaces';
import { mapFiles } from '~/utils';

export default function useFileMap({ isAuthenticated }: { isAuthenticated: boolean }) {
  const currentWorkspaceId = useAtomValue(currentWorkspaceIdAtom);

  const { data: fileMap } = useGetFiles(currentWorkspaceId, {
    select: mapFiles,
    enabled: isAuthenticated,
  });

  return fileMap;
}
