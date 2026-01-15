import { memo, useMemo } from 'react';
import {
  Constants,
  supportsFiles,
  EModelEndpoint,
  mergeFileConfig,
  isAgentsEndpoint,
  isAssistantsEndpoint,
  fileConfig as defaultFileConfig,
} from 'librechat-data-provider';
import type { EndpointFileConfig, TConversation } from 'librechat-data-provider';
import { useGetFileConfig, useGetEndpointsQuery } from '~/data-provider';
import { getEndpointField } from '~/utils/endpoints';
import AttachFileMenu from './AttachFileMenu';
import AttachFile from './AttachFile';

function AttachFileChat({
  disableInputs,
  conversation,
}: {
  disableInputs: boolean;
  conversation: TConversation | null;
}) {
  const conversationId = conversation?.conversationId ?? Constants.NEW_CONVO;
  const { endpoint } = conversation ?? { endpoint: null };
  const isAgents = useMemo(() => isAgentsEndpoint(endpoint), [endpoint]);
  const isAssistants = useMemo(() => isAssistantsEndpoint(endpoint), [endpoint]);

  // VERSION CHECK: Log for Assistant endpoint
  if (endpoint === 'Assistant') {
    console.log('[AttachFileChat] Component loaded - VERSION WITH HARDCODED FIX', {
      endpoint,
      isAgents,
      isAssistants,
      disableInputs,
      timestamp: new Date().toISOString(),
    });
  }

  const { data: fileConfig = defaultFileConfig } = useGetFileConfig({
    select: (data) => mergeFileConfig(data),
  });

  const { data: endpointsConfig } = useGetEndpointsQuery();

  const endpointType = useMemo(() => {
    return (
      getEndpointField(endpointsConfig, endpoint, 'type') ||
      (endpoint as EModelEndpoint | undefined)
    );
  }, [endpoint, endpointsConfig]);

  const endpointFileConfig = fileConfig.endpoints[endpoint ?? ''] as EndpointFileConfig | undefined;

  // DEBUG: Log file config for Assistant endpoint
  if (endpoint === 'Assistant') {
    console.log('[AttachFileChat] DEBUG for Assistant endpoint:', {
      endpoint,
      endpointFileConfig,
      'endpointFileConfig?.capabilities': endpointFileConfig?.capabilities,
      endpointsConfig: endpointsConfig?.['Assistant'],
    });
  }

  // Get capabilities from endpoints config (for custom endpoints)
  const endpointConfigWithCapabilities = useMemo(() => {
    const endpointConfig = endpointsConfig?.[endpoint ?? ''];
    if (endpointConfig && 'capabilities' in endpointConfig) {
      const result = {
        ...endpointFileConfig,
        capabilities: endpointConfig.capabilities,
      };
      if (endpoint === 'Assistant') {
        console.log('[AttachFileChat] Using capabilities from endpointsConfig:', result);
      }
      return result;
    }
    // Hardcoded fallback for Assistant endpoint to ensure file_search capability
    if (endpoint === 'Assistant' && endpointFileConfig) {
      const result = {
        ...endpointFileConfig,
        capabilities: endpointFileConfig.capabilities || ['file_search'],
      };
      console.log('[AttachFileChat] Using hardcoded fallback capabilities:', result);
      return result;
    }
    return endpointFileConfig;
  }, [endpointsConfig, endpoint, endpointFileConfig]);

  const endpointSupportsFiles: boolean = supportsFiles[endpointType ?? endpoint ?? ''] ?? false;
  const isUploadDisabled = (disableInputs || endpointFileConfig?.disabled) ?? false;

  // DEBUG: Log decision for Assistant endpoint
  if (endpoint === 'Assistant') {
    console.log('[AttachFileChat] Render decision:', {
      endpointSupportsFiles,
      isUploadDisabled,
      isAssistants,
      isAgents,
      endpointType,
      'Will render':
        isAssistants && endpointSupportsFiles && !isUploadDisabled
          ? 'AttachFile'
          : isAgents || (endpointSupportsFiles && !isUploadDisabled)
            ? 'AttachFileMenu'
            : 'null',
    });
  }

  if (isAssistants && endpointSupportsFiles && !isUploadDisabled) {
    if (endpoint === 'Assistant') console.log('[AttachFileChat] Rendering AttachFile');
    return <AttachFile disabled={disableInputs} />;
  } else if (isAgents || (endpointSupportsFiles && !isUploadDisabled)) {
    if (endpoint === 'Assistant') console.log('[AttachFileChat] Rendering AttachFileMenu');
    return (
      <AttachFileMenu
        endpoint={endpoint}
        disabled={disableInputs}
        endpointType={endpointType}
        conversationId={conversationId}
        agentId={conversation?.agent_id}
        endpointFileConfig={endpointConfigWithCapabilities}
      />
    );
  }
  if (endpoint === 'Assistant') console.log('[AttachFileChat] Rendering null - no attach button!');
  return null;
}

export default memo(AttachFileChat);
