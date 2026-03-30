import { useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useRecoilValue } from 'recoil';
import { EModelEndpoint, isAssistantsEndpoint } from 'librechat-data-provider';
import type { DropTargetMonitor } from 'react-dnd';
import store from '~/store';
import useFileHandling from './useFileHandling';
import useAutoFileRoute from './useAutoFileRoute';

export default function useDragHelpers() {
  const conversation = useRecoilValue(store.conversationByIndex(0)) || undefined;

  const isAssistants = useMemo(
    () => isAssistantsEndpoint(conversation?.endpoint),
    [conversation?.endpoint],
  );

  const { handleFiles } = useFileHandling({
    overrideEndpoint: isAssistants ? undefined : EModelEndpoint.agents,
  });

  const routeFiles = useAutoFileRoute(handleFiles);

  const handleDrop = (item: { files: File[] }) => {
    routeFiles(item.files);
  };

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop: handleDrop,
      canDrop: () => true,
      collect: (monitor: DropTargetMonitor) => {
        const isOver = monitor.isOver();
        const canDrop = monitor.canDrop();
        return { isOver, canDrop };
      },
    }),
    [handleDrop],
  );

  return { canDrop, isOver, drop };
}
