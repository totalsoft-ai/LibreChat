const { logger } = require('@librechat/data-schemas');
const { CacheKeys } = require('librechat-data-provider');
const getLogStores = require('~/cache/getLogStores');

/**
 * Circuit-breaker for AI endpoints.
 *
 * When a request to an endpoint fails with a connection/timeout error, the endpoint is
 * flagged as unavailable in a shared cache so a global banner can inform every user. The
 * flag auto-clears after `UNAVAILABLE_TTL` with no further failures (auto-recovery).
 *
 * State is stored under a single cache key as a map `{ [endpoint]: { since } }` to avoid
 * relying on key iteration, which is not portable across Keyv stores (memory/Redis/Mongo).
 */

const STORE_KEY = 'unavailable';
/** How long an endpoint stays flagged after its last failure (ms). */
const UNAVAILABLE_TTL = 60 * 1000;

const getCache = () => getLogStores(CacheKeys.ENDPOINT_HEALTH);

const readMap = async () => {
  const cache = getCache();
  const map = (await cache.get(STORE_KEY)) || {};
  return { cache, map };
};

/** Drops entries whose last failure is older than the freshness window. */
const prune = (map) => {
  const now = Date.now();
  const pruned = {};
  for (const [endpoint, entry] of Object.entries(map)) {
    if (entry && now - entry.since < UNAVAILABLE_TTL) {
      pruned[endpoint] = entry;
    }
  }
  return pruned;
};

/**
 * Flags an endpoint as currently unavailable.
 * @param {string} endpoint
 */
const markEndpointUnavailable = async (endpoint) => {
  if (!endpoint) {
    return;
  }
  try {
    const { cache, map } = await readMap();
    const pruned = prune(map);
    pruned[endpoint] = { since: Date.now() };
    await cache.set(STORE_KEY, pruned);
    logger.warn(`[EndpointHealth] Endpoint "${endpoint}" flagged as unavailable`);
  } catch (error) {
    logger.error('[EndpointHealth] Failed to mark endpoint unavailable', error);
  }
};

/**
 * Clears the unavailable flag for an endpoint (e.g. after a successful request).
 * @param {string} endpoint
 */
const markEndpointAvailable = async (endpoint) => {
  if (!endpoint) {
    return;
  }
  try {
    const { cache, map } = await readMap();
    if (map[endpoint] == null) {
      return;
    }
    const pruned = prune(map);
    delete pruned[endpoint];
    await cache.set(STORE_KEY, pruned);
  } catch (error) {
    logger.error('[EndpointHealth] Failed to mark endpoint available', error);
  }
};

/**
 * Returns the list of endpoints currently flagged as unavailable.
 * @returns {Promise<Array<{ endpoint: string, since: number }>>}
 */
const getUnavailableEndpoints = async () => {
  try {
    const { cache, map } = await readMap();
    const pruned = prune(map);
    /* Persist pruning so the flag clears even without new failures. */
    if (Object.keys(pruned).length !== Object.keys(map).length) {
      await cache.set(STORE_KEY, pruned);
    }
    return Object.entries(pruned).map(([endpoint, entry]) => ({
      endpoint,
      since: entry.since,
    }));
  } catch (error) {
    logger.error('[EndpointHealth] Failed to read unavailable endpoints', error);
    return [];
  }
};

module.exports = {
  markEndpointUnavailable,
  markEndpointAvailable,
  getUnavailableEndpoints,
};
