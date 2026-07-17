const axios = require('axios');
const mongoose = require('mongoose');
const { logger } = require('@librechat/data-schemas');
const { isEnabled, isUserProvided } = require('@librechat/api');
const { EModelEndpoint, extractEnvVariable } = require('librechat-data-provider');
const { getAppConfig } = require('~/server/services/Config/app');
const ServiceHealthCheck = require('~/models/ServiceHealthCheck');

const HTTP_TIMEOUT_MS = 5000;
const RETRY_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function attemptGet(url, headers) {
  try {
    const res = await axios.get(url, {
      headers,
      timeout: HTTP_TIMEOUT_MS,
      validateStatus: () => true,
    });
    return { status: res.status, data: res.data };
  } catch (error) {
    return { error };
  }
}

/**
 * HTTP GET with blip tolerance: on network error or 5xx, wait 2s and retry
 * once — only the second result is authoritative, so a momentary hiccup
 * between two healthy states does not flag the service.
 */
async function httpProbe(url, { headers } = {}) {
  let result = await attemptGet(url, headers);
  if (result.error || result.status >= 500) {
    await sleep(RETRY_DELAY_MS);
    result = await attemptGet(url, headers);
  }
  return result;
}

function probeFailureReason(result) {
  if (result.error) {
    return result.error.code ? `${result.error.code}: ${result.error.message}` : result.error.message;
  }
  return `HTTP ${result.status}`;
}

async function checkMongoDb() {
  try {
    if (mongoose.connection.readyState !== 1) {
      return { status: 'down', reason: `Connection not established (state ${mongoose.connection.readyState})` };
    }
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    return { status: 'ok', reason: '', details: { pingMs: Date.now() - start } };
  } catch (error) {
    return { status: 'down', reason: error.message };
  }
}

async function checkMeilisearch() {
  if (!isEnabled(process.env.SEARCH) || !process.env.MEILI_HOST) {
    return { status: 'unknown', reason: 'Not configured' };
  }
  const host = process.env.MEILI_HOST.replace(/\/$/, '');
  const result = await httpProbe(`${host}/health`);
  if (result.error || result.status >= 500) {
    return { status: 'down', reason: probeFailureReason(result) };
  }
  if (result.status !== 200 || result.data?.status !== 'available') {
    return {
      status: 'degraded',
      reason: `Unexpected health response (HTTP ${result.status})`,
      details: { body: result.data },
    };
  }
  return { status: 'ok', reason: '' };
}

async function checkRagApi() {
  if (!process.env.RAG_API_URL) {
    return { status: 'unknown', reason: 'Not configured' };
  }
  const base = process.env.RAG_API_URL.replace(/\/$/, '');
  const result = await httpProbe(`${base}/health`);
  if (result.error || result.status >= 500) {
    return { status: 'down', reason: probeFailureReason(result) };
  }
  if (result.status !== 200) {
    return { status: 'degraded', reason: `Unexpected health response (HTTP ${result.status})` };
  }
  return { status: 'ok', reason: '' };
}

async function checkAiEndpoint(endpoint) {
  const baseURL = extractEnvVariable(endpoint.baseURL);
  if (!baseURL || baseURL.includes('${')) {
    // extractEnvVariable returns the raw string when the env var is unset
    return { status: 'unknown', reason: 'No baseURL configured' };
  }

  const headers = {};
  const apiKey = extractEnvVariable(endpoint.apiKey ?? '');
  if (apiKey && !isUserProvided(apiKey)) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const result = await httpProbe(`${baseURL.replace(/\/$/, '')}/models`, { headers });
  if (result.error || result.status >= 500) {
    return { status: 'down', reason: probeFailureReason(result) };
  }

  // Any response below 500 means the server is up and answering; 401/403
  // caused by key handling must not be reported as an outage.
  const details = {};
  const modelCount = Array.isArray(result.data?.data) ? result.data.data.length : undefined;
  if (modelCount !== undefined) {
    details.modelCount = modelCount;
  }
  return { status: 'ok', reason: '', details };
}

/**
 * Component registry: static core services plus one component per custom
 * endpoint from librechat.yaml, enumerated at check time so config changes
 * are picked up without a restart.
 */
async function getComponents() {
  const components = [
    { component: 'mongodb', label: 'MongoDB', group: 'core', check: checkMongoDb },
    { component: 'meilisearch', label: 'Meilisearch', group: 'core', check: checkMeilisearch },
    { component: 'rag_api', label: 'RAG API', group: 'core', check: checkRagApi },
  ];

  try {
    const appConfig = await getAppConfig();
    const customEndpoints = appConfig?.endpoints?.[EModelEndpoint.custom];
    if (Array.isArray(customEndpoints)) {
      for (const endpoint of customEndpoints) {
        if (!endpoint?.name || !endpoint?.baseURL) {
          continue;
        }
        components.push({
          component: `endpoint:${endpoint.name}`,
          label: endpoint.name,
          group: 'ai',
          check: () => checkAiEndpoint(endpoint),
        });
      }
    }
  } catch (error) {
    logger.warn(`[SystemStatus] Failed to enumerate custom endpoints: ${error.message}`);
  }

  return components;
}

/** Registry without check functions, for the API layer. */
async function listComponents() {
  const components = await getComponents();
  return components.map(({ component, label, group }) => ({ component, label, group }));
}

/** Runs every check and persists one document per component. */
async function runAndPersistChecks() {
  const components = await getComponents();
  const checkedAt = new Date();

  const docs = await Promise.all(
    components.map(async ({ component, label, group, check }) => {
      let result;
      try {
        result = await check();
      } catch (error) {
        result = { status: 'unknown', reason: `Check failed: ${error.message}` };
      }
      return {
        component,
        status: result.status,
        reason: result.reason || '',
        details: { ...result.details, label, group },
        checkedAt,
      };
    }),
  );

  await ServiceHealthCheck.insertMany(docs, { ordered: false });

  const failing = docs.filter((d) => d.status === 'down' || d.status === 'degraded');
  if (failing.length > 0) {
    logger.warn(
      `[SystemStatus] ${failing.length} component(s) unhealthy: ${failing
        .map((d) => `${d.component}=${d.status}`)
        .join(', ')}`,
    );
  }

  return docs;
}

module.exports = {
  httpProbe,
  getComponents,
  listComponents,
  runAndPersistChecks,
};
