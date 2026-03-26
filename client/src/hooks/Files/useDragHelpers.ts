import { useState, useMemo, useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  Constants,
  EModelEndpoint,
  EToolResources,
  isAssistantsEndpoint,
} from 'librechat-data-provider';
import type { DropTargetMonitor } from 'react-dnd';
import store, { ephemeralAgentByConvoId } from '~/store';
import useFileHandling from './useFileHandling';

export default function useDragHelpers() {
  const [showModal, setShowModal] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);
  const conversation = useRecoilValue(store.conversationByIndex(0)) || undefined;
  const setEphemeralAgent = useSetRecoilState(
    ephemeralAgentByConvoId(conversation?.conversationId ?? Constants.NEW_CONVO),
  );

  const isAssistants = useMemo(
    () => isAssistantsEndpoint(conversation?.endpoint),
    [conversation?.endpoint],
  );

  const { handleFiles } = useFileHandling({
    overrideEndpoint: isAssistants ? undefined : EModelEndpoint.agents,
  });

  const handleOptionSelect = useCallback(
    (toolResource: EToolResources | undefined) => {
      /** File search is not automatically enabled to simulate legacy behavior */
      if (toolResource && toolResource !== EToolResources.file_search) {
        setEphemeralAgent((prev) => ({
          ...prev,
          [toolResource]: true,
        }));
      }
      handleFiles(draggedFiles, toolResource);
      setShowModal(false);
      setDraggedFiles([]);
    },
    [draggedFiles, handleFiles, setEphemeralAgent],
  );

  /** Use refs to avoid re-creating the drop handler */
  const handleFilesRef = useRef(handleFiles);
  const setEphemeralAgentRef = useRef(setEphemeralAgent);

  handleFilesRef.current = handleFiles;
  setEphemeralAgentRef.current = setEphemeralAgent;

  const handleDrop = useCallback(
    (item: { files: File[] }) => {
      const codeExtensions = new Set([
        'sql', 'py', 'js', 'ts', 'jsx', 'tsx', 'java', 'c', 'cpp', 'cs',
        'go', 'rb', 'php', 'sh', 'bash', 'r', 'swift', 'kt', 'rs', 'scala',
        'html', 'css', 'scss', 'less', 'xml', 'json', 'yaml', 'yml', 'toml',
        'ini', 'cfg', 'env', 'dockerfile', 'makefile', 'gradle', 'lua', 'pl',
      ]);
      const isCodeFile = (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        return codeExtensions.has(ext);
      };
      const codeFiles = item.files.filter(isCodeFile);
      const ragFiles = item.files.filter((f) => !isCodeFile(f));
      if (codeFiles.length > 0) {
        handleFilesRef.current(codeFiles);
      }
      if (ragFiles.length > 0) {
        setEphemeralAgentRef.current((prev) => ({ ...prev, [EToolResources.file_search]: true }));
        handleFilesRef.current(ragFiles, EToolResources.file_search);
      }
    },
    [],
  );

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop: handleDrop,
      canDrop: () => true,
      collect: (monitor: DropTargetMonitor) => {
        /** Optimize collect to reduce re-renders */
        const isOver = monitor.isOver();
        const canDrop = monitor.canDrop();
        return { isOver, canDrop };
      },
    }),
    [handleDrop],
  );

  return {
    canDrop,
    isOver,
    drop,
    showModal,
    setShowModal,
    draggedFiles,
    handleOptionSelect,
  };
}
