const { logger } = require('@librechat/data-schemas');
const { validateAgentModel } = require('@librechat/api');
const { createContentAggregator } = require('@librechat/agents');
const {
  Constants,
  EModelEndpoint,
  isAgentsEndpoint,
  getResponseSender,
} = require('librechat-data-provider');
const {
  createToolEndCallback,
  getDefaultHandlers,
} = require('~/server/controllers/agents/callbacks');
const { initializeAgent } = require('~/server/services/Endpoints/agents/agent');
const { getModelsConfig } = require('~/server/controllers/ModelController');
const { getCustomEndpointConfig } = require('~/server/services/Config');
const { loadAgentTools } = require('~/server/services/ToolService');
const AgentClient = require('~/server/controllers/agents/client');
const { getAgent } = require('~/models/Agent');
const { getFiles } = require('~/models/File');
const { logger } = require('~/config');
const { logViolation } = require('~/cache');

const providerConfigMap = {
  [Providers.XAI]: initCustom,
  [Providers.OLLAMA]: initCustom,
  [Providers.DEEPSEEK]: initCustom,
  [Providers.OPENROUTER]: initCustom,
  [EModelEndpoint.openAI]: initOpenAI,
  [EModelEndpoint.google]: initGoogle,
  [EModelEndpoint.azureOpenAI]: initOpenAI,
  [EModelEndpoint.anthropic]: initAnthropic,
  [EModelEndpoint.bedrock]: getBedrockOptions,
};

/**
 * @param {Object} params
 * @param {ServerRequest} params.req
 * @param {Promise<Array<MongoFile | null>> | undefined} [params.attachments]
 * @param {Set<string>} params.requestFileSet
 * @param {AgentToolResources | undefined} [params.tool_resources]
 * @returns {Promise<{ attachments: Array<MongoFile | undefined> | undefined, tool_resources: AgentToolResources | undefined }>}
 */
const primeResources = async ({
  req,
  attachments: _attachments,
  tool_resources: _tool_resources,
  requestFileSet,
}) => {
  try {
    /** @type {Array<MongoFile | undefined> | undefined} */
    let attachments;
    const tool_resources = _tool_resources ?? {};
    const isOCREnabled = (req.app.locals?.[EModelEndpoint.agents]?.capabilities ?? []).includes(
      AgentCapabilities.ocr,
    );
    if (tool_resources[EToolResources.ocr]?.file_ids && isOCREnabled) {
      const context = await getFiles(
        {
          file_id: { $in: tool_resources.ocr.file_ids },
        },
        {},
        {},
      );
      attachments = (attachments ?? []).concat(context);
    }
    if (!_attachments) {
      return { attachments, tool_resources };
    }
    /** @type {Array<MongoFile | undefined> | undefined} */
    const files = await _attachments;
    if (!attachments) {
      /** @type {Array<MongoFile | undefined>} */
      attachments = [];
    }

    for (const file of files) {
      if (!file) {
        continue;
      }
      if (file.metadata?.fileIdentifier) {
        const execute_code = tool_resources[EToolResources.execute_code] ?? {};
        if (!execute_code.files) {
          tool_resources[EToolResources.execute_code] = { ...execute_code, files: [] };
        }
        tool_resources[EToolResources.execute_code].files.push(file);
      } else if (file.embedded === true) {
        const file_search = tool_resources[EToolResources.file_search] ?? {};
        if (!file_search.files) {
          tool_resources[EToolResources.file_search] = { ...file_search, files: [] };
        }
        tool_resources[EToolResources.file_search].files.push(file);
      } else if (
        requestFileSet.has(file.file_id) &&
        file.type.startsWith('image') &&
        file.height &&
        file.width
      ) {
        const image_edit = tool_resources[EToolResources.image_edit] ?? {};
        if (!image_edit.files) {
          tool_resources[EToolResources.image_edit] = { ...image_edit, files: [] };
        }
        tool_resources[EToolResources.image_edit].files.push(file);
      } else if (
        requestFileSet.has(file.file_id) &&
        (file.type === 'application/pdf' ||
         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
         file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
         file.type === 'application/vnd.ms-excel')
      ) {
        const document_loader = tool_resources[EToolResources.document_loader] ?? {};
        if (!document_loader.files) {
          tool_resources[EToolResources.document_loader] = { ...document_loader, files: [] };
        }
        tool_resources[EToolResources.document_loader].files.push(file);
      }

      attachments.push(file);
    }
    return { attachments, tool_resources };
  } catch (error) {
    logger.error('Error priming resources', error);
    return { attachments: _attachments, tool_resources: _tool_resources };
  }
};

/**
 * @param  {...string | number} values
 * @returns {string | number | undefined}
 */
function optionalChainWithEmptyCheck(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return values[values.length - 1];
}

/**
 * @param {object} params
 * @param {ServerRequest} params.req
 * @param {ServerResponse} params.res
 * @param {Agent} params.agent
 * @param {Set<string>} [params.allowedProviders]
 * @param {object} [params.endpointOption]
 * @param {boolean} [params.isInitialAgent]
 * @returns {Promise<Agent>}
 */
const initializeAgentOptions = async ({
  req,
  res,
  agent,
  endpointOption,
  allowedProviders,
  isInitialAgent = false,
}) => {
  if (allowedProviders.size > 0 && !allowedProviders.has(agent.provider)) {
    throw new Error(
      `{ "type": "${ErrorTypes.INVALID_AGENT_PROVIDER}", "info": "${agent.provider}" }`,
    );
  }
  let currentFiles;
  /** @type {Array<MongoFile>} */
  const requestFiles = req.body.files ?? [];
  if (
    isInitialAgent &&
    req.body.conversationId != null &&
    (agent.model_parameters?.resendFiles ?? true) === true
  ) {
    const fileIds = (await getConvoFiles(req.body.conversationId)) ?? [];
    /** @type {Set<EToolResources>} */
    const toolResourceSet = new Set();
    for (const tool of agent.tools) {
      if (EToolResources[tool]) {
        toolResourceSet.add(EToolResources[tool]);
      }
    }
    const toolFiles = await getToolFilesByIds(fileIds, toolResourceSet);
    if (requestFiles.length || toolFiles.length) {
      // For agents, keep files with their direct content instead of processing them
      currentFiles = requestFiles.concat(toolFiles).map(file => ({
        ...file,
        content: file.content || null // Ensure content is preserved
      }));
    }
  } else if (isInitialAgent && requestFiles.length) {
    // For agents, keep files with their direct content instead of processing them
    currentFiles = requestFiles.map(file => ({
      ...file,
      content: file.content || null // Ensure content is preserved
    }));
  }

  const { attachments, tool_resources } = await primeResources({
    req,
    attachments: currentFiles,
    tool_resources: agent.tool_resources,
    requestFileSet: new Set(requestFiles.map((file) => file.file_id)),
  });

  const provider = agent.provider;
  const { tools, toolContextMap } = await loadAgentTools({
    req,
    res,
    agent: {
      id: agent.id,
      tools: agent.tools,
      provider,
      model: agent.model,
    },
    tool_resources,
  });

  agent.endpoint = provider;
  let getOptions = providerConfigMap[provider];
  if (!getOptions && providerConfigMap[provider.toLowerCase()] != null) {
    agent.provider = provider.toLowerCase();
    getOptions = providerConfigMap[agent.provider];
  } else if (!getOptions) {
    const customEndpointConfig = await getCustomEndpointConfig(provider);
    if (!customEndpointConfig) {
      throw new Error(`Provider ${provider} not supported`);
    }
  }
};

function createToolLoader() {
  /**
   * @param {object} params
   * @param {ServerRequest} params.req
   * @param {ServerResponse} params.res
   * @param {string} params.agentId
   * @param {string[]} params.tools
   * @param {string} params.provider
   * @param {string} params.model
   * @param {AgentToolResources} params.tool_resources
   * @returns {Promise<{ tools: StructuredTool[], toolContextMap: Record<string, unknown> } | undefined>}
   */
  return async function loadTools({ req, res, agentId, tools, provider, model, tool_resources }) {
    const agent = { id: agentId, tools, provider, model };
    try {
      return await loadAgentTools({
        req,
        res,
        agent,
        tool_resources,
      });
    } catch (error) {
      logger.error('Error loading tools for agent ' + agentId, error);
    }
  };
}

const initializeClient = async ({ req, res, endpointOption }) => {
  if (!endpointOption) {
    throw new Error('Endpoint option not provided');
  }

  // TODO: use endpointOption to determine options/modelOptions
  /** @type {Array<UsageMetadata>} */
  const collectedUsage = [];
  /** @type {ArtifactPromises} */
  const artifactPromises = [];
  const { contentParts, aggregateContent } = createContentAggregator();
  const toolEndCallback = createToolEndCallback({ req, res, artifactPromises });
  const eventHandlers = getDefaultHandlers({
    res,
    aggregateContent,
    toolEndCallback,
    collectedUsage,
  });

  if (!endpointOption.agent) {
    throw new Error('No agent promise provided');
  }

  const primaryAgent = await endpointOption.agent;
  delete endpointOption.agent;
  if (!primaryAgent) {
    throw new Error('Agent not found');
  }

  const modelsConfig = await getModelsConfig(req);
  const validationResult = await validateAgentModel({
    req,
    res,
    modelsConfig,
    logViolation,
    agent: primaryAgent,
  });

  if (!validationResult.isValid) {
    throw new Error(validationResult.error?.message);
  }

  const agentConfigs = new Map();
  /** @type {Set<string>} */
  const allowedProviders = new Set(req?.app?.locals?.[EModelEndpoint.agents]?.allowedProviders);

  const loadTools = createToolLoader();
  /** @type {Array<MongoFile>} */
  const requestFiles = req.body.files ?? [];
  /** @type {string} */
  const conversationId = req.body.conversationId;

  const primaryConfig = await initializeAgent({
    req,
    res,
    loadTools,
    requestFiles,
    conversationId,
    agent: primaryAgent,
    endpointOption,
    allowedProviders,
    isInitialAgent: true,
  });

  const agent_ids = primaryConfig.agent_ids;
  if (agent_ids?.length) {
    for (const agentId of agent_ids) {
      const agent = await getAgent({ id: agentId });
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      const validationResult = await validateAgentModel({
        req,
        res,
        agent,
        modelsConfig,
        logViolation,
      });

      if (!validationResult.isValid) {
        throw new Error(validationResult.error?.message);
      }

      const config = await initializeAgent({
        req,
        res,
        agent,
        loadTools,
        requestFiles,
        conversationId,
        endpointOption,
        allowedProviders,
      });
      agentConfigs.set(agentId, config);
    }
  }

  let endpointConfig = req.app.locals[primaryConfig.endpoint];
  if (!isAgentsEndpoint(primaryConfig.endpoint) && !endpointConfig) {
    try {
      endpointConfig = await getCustomEndpointConfig(primaryConfig.endpoint);
    } catch (err) {
      logger.error(
        '[api/server/controllers/agents/client.js #titleConvo] Error getting custom endpoint config',
        err,
      );
    }
  }

  const sender =
    primaryAgent.name ??
    getResponseSender({
      ...endpointOption,
      model: endpointOption.model_parameters.model,
      modelDisplayLabel: endpointConfig?.modelDisplayLabel,
      modelLabel: endpointOption.model_parameters.modelLabel,
    });

  const client = new AgentClient({
    req,
    res,
    sender,
    contentParts,
    agentConfigs,
    eventHandlers,
    collectedUsage,
    aggregateContent,
    artifactPromises,
    agent: primaryConfig,
    spec: endpointOption.spec,
    iconURL: endpointOption.iconURL,
    attachments: primaryConfig.attachments,
    endpointType: endpointOption.endpointType,
    resendFiles: primaryConfig.resendFiles ?? true,
    maxContextTokens: primaryConfig.maxContextTokens,
    endpoint:
      primaryConfig.id === Constants.EPHEMERAL_AGENT_ID
        ? primaryConfig.endpoint
        : EModelEndpoint.agents,
  });

  return { client };
};

module.exports = { initializeClient };
