const { Providers } = require('@librechat/agents');
const {
  resolveHeaders,
  isUserProvided,
  getOpenAIConfig,
  getCustomEndpointConfig,
  createHandleLLMNewToken,
} = require('@librechat/api');
const {
  CacheKeys,
  ErrorTypes,
  envVarRegex,
  FetchTokenConfig,
  extractEnvVariable,
} = require('librechat-data-provider');
const { getUserKeyValues, checkUserKeyExpiry } = require('~/server/services/UserService');
const { fetchModels } = require('~/server/services/ModelService');
const OpenAIClient = require('~/app/clients/OpenAIClient');
const getLogStores = require('~/cache/getLogStores');
const { getAllUserMemories } = require('~/models');

const { PROXY } = process.env;

const initializeClient = async ({ req, res, endpointOption, optionsOnly, overrideEndpoint }) => {
  const appConfig = req.config;
  const { key: expiresAt } = req.body;
  const endpoint = overrideEndpoint ?? req.body.endpoint;

  const endpointConfig = getCustomEndpointConfig({
    endpoint,
    appConfig,
  });
  if (!endpointConfig) {
    throw new Error(`Config not found for the ${endpoint} custom endpoint.`);
  }

  const CUSTOM_API_KEY = extractEnvVariable(endpointConfig.apiKey);
  const CUSTOM_BASE_URL = extractEnvVariable(endpointConfig.baseURL);

  /** Intentionally excludes passing `body`, i.e. `req.body`, as
   *  values may not be accurate until `AgentClient` is initialized
   */
  let resolvedHeaders = resolveHeaders({
    headers: endpointConfig.headers,
    user: req.user,
  });

  if (CUSTOM_API_KEY.match(envVarRegex)) {
    throw new Error(`Missing API Key for ${endpoint}.`);
  }

  if (CUSTOM_BASE_URL.match(envVarRegex)) {
    throw new Error(`Missing Base URL for ${endpoint}.`);
  }

  const userProvidesKey = isUserProvided(CUSTOM_API_KEY);
  const userProvidesURL = isUserProvided(CUSTOM_BASE_URL);

  let userValues = null;
  if (expiresAt && (userProvidesKey || userProvidesURL)) {
    checkUserKeyExpiry(expiresAt, endpoint);
    userValues = await getUserKeyValues({ userId: req.user.id, name: endpoint });
  }

  let apiKey = userProvidesKey ? userValues?.apiKey : CUSTOM_API_KEY;
  let baseURL = userProvidesURL ? userValues?.baseURL : CUSTOM_BASE_URL;

  if (userProvidesKey & !apiKey) {
    throw new Error(
      JSON.stringify({
        type: ErrorTypes.NO_USER_KEY,
      }),
    );
  }

  if (userProvidesURL && !baseURL) {
    throw new Error(
      JSON.stringify({
        type: ErrorTypes.NO_BASE_URL,
      }),
    );
  }

  if (!apiKey) {
    throw new Error(`${endpoint} API key not provided.`);
  }

  if (!baseURL) {
    throw new Error(`${endpoint} Base URL not provided.`);
  }

  const cache = getLogStores(CacheKeys.TOKEN_CONFIG);
  const tokenKey =
    !endpointConfig.tokenConfig && (userProvidesKey || userProvidesURL)
      ? `${endpoint}:${req.user.id}`
      : endpoint;

  let endpointTokenConfig =
    !endpointConfig.tokenConfig &&
    FetchTokenConfig[endpoint.toLowerCase()] &&
    (await cache.get(tokenKey));

  if (
    FetchTokenConfig[endpoint.toLowerCase()] &&
    endpointConfig &&
    endpointConfig.models.fetch &&
    !endpointTokenConfig
  ) {
    await fetchModels({ apiKey, baseURL, name: endpoint, user: req.user.id, tokenKey });
    endpointTokenConfig = await cache.get(tokenKey);
  }

  const customOptions = {
    headers: resolvedHeaders,
    addParams: endpointConfig.addParams,
    dropParams: endpointConfig.dropParams,
    customParams: endpointConfig.customParams,
    titleConvo: endpointConfig.titleConvo,
    titleModel: endpointConfig.titleModel,
    forcePrompt: endpointConfig.forcePrompt,
    summaryModel: endpointConfig.summaryModel,
    modelDisplayLabel: endpointConfig.modelDisplayLabel,
    titleMethod: endpointConfig.titleMethod ?? 'completion',
    contextStrategy: endpointConfig.summarize ? 'summarize' : null,
    directEndpoint: endpointConfig.directEndpoint,
    titleMessageRole: endpointConfig.titleMessageRole,
    streamRate: endpointConfig.streamRate,
    endpointTokenConfig,
  };

  const allConfig = appConfig.endpoints?.all;
  if (allConfig) {
    customOptions.streamRate = allConfig.streamRate;
  }

  let clientOptions = {
    reverseProxyUrl: baseURL ?? null,
    proxy: PROXY ?? null,
    req,
    res,
    ...customOptions,
    ...endpointOption,
  };

  // If not summarizing, cap history to the last 5 messages to control context size
  try {
    if (!endpointConfig.summarize && Array.isArray(req.body?.messages)) {
      req.body.messages = req.body.messages.slice(-5);
    }
  } catch {}

  // Build a short memory prefix from user's saved memories (top 5, newest first)
  let memoryPrefix = '';
  try {
    const userMems = await getAllUserMemories(req.user.id);
    if (Array.isArray(userMems) && userMems.length > 0) {
      const top = userMems
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5)
        .map((m, i) => `${i + 1}. ${m.value}`)
        .join('\n');
      if (top && top.trim() !== '') {
        memoryPrefix = `Personalization Context:\n${top}\n\n`;
      }
    }
  } catch {}

  if (optionsOnly) {
    const modelOptions = endpointOption?.model_parameters ?? {};
    if (endpoint !== Providers.OLLAMA) {
      clientOptions = Object.assign(
        {
          modelOptions,
        },
        clientOptions,
      );
      clientOptions.modelOptions.user = req.user.id;
      const options = getOpenAIConfig(apiKey, clientOptions, endpoint);
      if (options != null) {
        options.useLegacyContent = true;
        options.endpointTokenConfig = endpointTokenConfig;
        // Inject memory prefix into system context
        const existing = options.llmConfig?.promptPrefix ?? '';
        options.llmConfig.promptPrefix = `${memoryPrefix}${existing}`;
        // Also inject into additional instructions to increase influence
        //const existingAddl = options.llmConfig?.additional_instructions ?? '';
        //options.llmConfig.additional_instructions = `${memoryPrefix}${existingAddl}`;
      }
      if (!clientOptions.streamRate) {
        return options;
      }
      options.llmConfig.callbacks = [
        {
          handleLLMNewToken: createHandleLLMNewToken(clientOptions.streamRate),
        },
      ];
      return options;
    }

    if (clientOptions.reverseProxyUrl) {
      modelOptions.baseUrl = clientOptions.reverseProxyUrl.split('/v1')[0];
      delete clientOptions.reverseProxyUrl;
    }

    return {
      useLegacyContent: true,
      llmConfig: modelOptions,
    };
  }

  // Non-options branch: inject memory prefix via client options
  if (memoryPrefix) {
    const existingPrefix = clientOptions.promptPrefix ?? '';
    clientOptions.promptPrefix = `${memoryPrefix}${existingPrefix}`;
    //const existingAddl = clientOptions.additional_instructions ?? '';
    //clientOptions.additional_instructions = `${memoryPrefix}${existingAddl}`;
  }

  const client = new OpenAIClient(apiKey, clientOptions);
  return {
    client,
    openAIApiKey: apiKey,
  };
};

module.exports = initializeClient;
