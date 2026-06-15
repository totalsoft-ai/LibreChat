const mockCache = new Map();

jest.mock('~/cache/getLogStores', () => {
  return jest.fn(() => ({
    get: jest.fn(async (key) => mockCache.get(key)),
    set: jest.fn(async (key, value) => mockCache.set(key, value)),
  }));
});

const {
  markEndpointUnavailable,
  markEndpointAvailable,
  getUnavailableEndpoints,
} = require('./EndpointHealth');

describe('EndpointHealth circuit-breaker', () => {
  beforeEach(() => {
    mockCache.clear();
    jest.restoreAllMocks();
  });

  it('flags an endpoint as unavailable and lists it', async () => {
    await markEndpointUnavailable('Orchestrator');
    const unavailable = await getUnavailableEndpoints();
    expect(unavailable).toEqual([
      expect.objectContaining({ endpoint: 'Orchestrator', since: expect.any(Number) }),
    ]);
  });

  it('ignores empty endpoint names', async () => {
    await markEndpointUnavailable('');
    await markEndpointUnavailable(undefined);
    expect(await getUnavailableEndpoints()).toEqual([]);
  });

  it('tracks multiple endpoints independently', async () => {
    await markEndpointUnavailable('Orchestrator');
    await markEndpointUnavailable('Local Models');
    const endpoints = (await getUnavailableEndpoints()).map((e) => e.endpoint).sort();
    expect(endpoints).toEqual(['Local Models', 'Orchestrator']);
  });

  it('clears a specific endpoint on recovery without touching others', async () => {
    await markEndpointUnavailable('Orchestrator');
    await markEndpointUnavailable('Local Models');
    await markEndpointAvailable('Orchestrator');
    const endpoints = (await getUnavailableEndpoints()).map((e) => e.endpoint);
    expect(endpoints).toEqual(['Local Models']);
  });

  it('auto-expires stale entries past the freshness window', async () => {
    await markEndpointUnavailable('Orchestrator');
    // Advance the clock beyond the 60s TTL.
    const realNow = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(realNow + 61 * 1000);
    expect(await getUnavailableEndpoints()).toEqual([]);
  });
});
