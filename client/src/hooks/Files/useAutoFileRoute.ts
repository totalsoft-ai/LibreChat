import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  Tools,
  QueryKeys,
  Constants,
  EModelEndpoint,
  EToolResources,
  AgentCapabilities,
  defaultAgentCapabilities,
} from 'librechat-data-provider';
import type * as t from 'librechat-data-provider';
import store, { ephemeralAgentByConvoId } from '~/store';
import { isEphemeralAgent } from '~/common';

export const CODE_EXTENSIONS = new Set([
  'sql', 'py', 'js', 'ts', 'jsx', 'tsx', 'java', 'c', 'cpp', 'cs',
  'go', 'rb', 'php', 'sh', 'bash', 'r', 'swift', 'kt', 'rs', 'scala',
  'html', 'css', 'scss', 'less', 'xml', 'json', 'yaml', 'yml', 'toml',
  'ini', 'cfg', 'env', 'lua', 'pl',
]);

export const EXTENSIONLESS_CODE_FILES = new Set(['dockerfile', 'makefile', 'gradlefile']);

export const isCodeFile = (file: File) => {
  const name = file.name.toLowerCase();
  if (EXTENSIONLESS_CODE_FILES.has(name)) {
    return true;
  }
  const ext = name.split('.').pop() ?? '';
  return CODE_EXTENSIONS.has(ext);
};

/**
 * Returns a `routeFiles` function that:
 * - sends code files directly as context attachments
 * - sends all other files to RAG (file_search) if available, else direct
 */
export default function useAutoFileRoute(
  handleFiles: (files: File[], toolResource?: string) => void | Promise<void>,
) {
  const queryClient = useQueryClient();
  const conversation = useRecoilValue(store.conversationByIndex(0)) || undefined;
  const setEphemeralAgent = useSetRecoilState(
    ephemeralAgentByConvoId(conversation?.conversationId ?? Constants.NEW_CONVO),
  );

  const handleFilesRef = useRef(handleFiles);
  const setEphemeralAgentRef = useRef(setEphemeralAgent);
  const conversationRef = useRef(conversation);

  handleFilesRef.current = handleFiles;
  setEphemeralAgentRef.current = setEphemeralAgent;
  conversationRef.current = conversation;

  return useCallback(
    (files: File[]) => {
      const endpointsConfig = queryClient.getQueryData<t.TEndpointsConfig>([QueryKeys.endpoints]);
      const agentsConfig = endpointsConfig?.[EModelEndpoint.agents];
      const capabilities = agentsConfig?.capabilities ?? defaultAgentCapabilities;
      const fileSearchEnabled = capabilities.includes(AgentCapabilities.file_search) === true;

      const agentId = conversationRef.current?.agent_id;
      let fileSearchAllowedByAgent = true;
      if (agentId && !isEphemeralAgent(agentId)) {
        const agent = queryClient.getQueryData<t.Agent>([QueryKeys.agent, agentId]);
        if (agent) {
          const agentTools = agent.tools as string[] | undefined;
          fileSearchAllowedByAgent = agentTools?.includes(Tools.file_search) ?? false;
        } else {
          fileSearchAllowedByAgent = false;
        }
      }

      const canUseFileSearch = fileSearchEnabled && fileSearchAllowedByAgent;

      const codeFiles = files.filter(isCodeFile);
      const ragFiles = files.filter((f) => !isCodeFile(f));

      if (codeFiles.length > 0) {
        handleFilesRef.current(codeFiles);
      }

      if (ragFiles.length > 0) {
        if (canUseFileSearch) {
          setEphemeralAgentRef.current((prev) => ({
            ...prev,
            [EToolResources.file_search]: true,
          }));
          handleFilesRef.current(ragFiles, EToolResources.file_search);
        } else {
          handleFilesRef.current(ragFiles);
        }
      }
    },
    [queryClient],
  );
}
