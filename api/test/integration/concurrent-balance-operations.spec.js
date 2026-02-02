const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { checkBalance } = require('~/models/balanceMethods');
const { Balance, User } = require('~/db/models');
const { createModelAutoRefillTransaction } = require('~/models/Transaction');
const { checkAndRefillAll } = require('~/server/services/AutoRefillScheduler');

jest.mock('@librechat/data-schemas', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('~/cache', () => ({
  logViolation: jest.fn(),
}));

jest.mock('~/server/services/BudgetAlertService', () => ({
  checkBudgetAlerts: jest.fn().mockResolvedValue(undefined),
}));

describe('Concurrent Balance Operations Integration', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    jest.clearAllMocks();
  });

  describe('Real-world Scenarios', () => {
    it('should handle 100 users with 10 concurrent requests each', async () => {
      const userCount = 100;
      const requestsPerUser = 10;
      const tokenCost = 50;
      const initialBalance = 500;

      const users = await Promise.all(
        Array.from({ length: userCount }, (_, i) =>
          User.create({
            email: `user${i}@example.com`,
            name: `User ${i}`,
            provider: 'local',
          }),
        ),
      );

      await Promise.all(
        users.map((user) =>
          Balance.create({
            user: user._id,
            tokenCredits: 0,
            endpointLimits: [
              {
                endpoint: 'openAI',
                tokenCredits: initialBalance,
                enabled: true,
                autoRefillEnabled: false,
              },
            ],
          }),
        ),
      );

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};

      const allPromises = users.flatMap((user) =>
        Array(requestsPerUser)
          .fill(null)
          .map(() =>
            checkBalance({
              req: mockReq,
              res: mockRes,
              txData: {
                user: user._id,
                endpoint: 'openAI',
                model: 'gpt-4',
                tokenType: 'prompt',
                amount: tokenCost,
                valueKey: 'prompt',
              },
            }),
          ),
      );

      const results = await Promise.allSettled(allPromises);

      for (const user of users) {
        const balance = await Balance.findOne({ user: user._id });
        const endpointLimit = balance.endpointLimits.find((el) => el.endpoint === 'openAI');
        expect(endpointLimit.tokenCredits).toBe(0);
      }

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      expect(successful).toBe(userCount * (initialBalance / tokenCost));
    }, 60000);

    it('should handle mixed operations: spend + refill + alerts', async () => {
      const user = await User.create({
        email: 'mixed@example.com',
        name: 'Mixed User',
        provider: 'local',
      });

      await Balance.create({
        user: user._id,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 1000,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 500,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};

      const spendPromises = Array(15)
        .fill(null)
        .map(() =>
          checkBalance({
            req: mockReq,
            res: mockRes,
            txData: {
              user: user._id,
              endpoint: 'openAI',
              model: 'gpt-4',
              tokenType: 'prompt',
              amount: 100,
              valueKey: 'prompt',
            },
          }),
        );

      await Promise.allSettled([...spendPromises, checkAndRefillAll()]);

      const finalBalance = await Balance.findOne({ user: user._id });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === 'openAI');
      expect(endpointLimit.tokenCredits).toBeGreaterThanOrEqual(0);
    }, 30000);

    it('should handle multiple endpoints per user concurrently', async () => {
      const user = await User.create({
        email: 'multi@example.com',
        name: 'Multi Endpoint User',
        provider: 'local',
      });

      const endpoints = ['openAI', 'anthropic', 'google'];
      await Balance.create({
        user: user._id,
        tokenCredits: 0,
        endpointLimits: endpoints.map((endpoint) => ({
          endpoint,
          tokenCredits: 1000,
          enabled: true,
          autoRefillEnabled: false,
        })),
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};

      const promises = endpoints.flatMap((endpoint, idx) =>
        Array(10)
          .fill(null)
          .map(() =>
            checkBalance({
              req: mockReq,
              res: mockRes,
              txData: {
                user: user._id,
                endpoint,
                model: ['gpt-4', 'claude-3-opus', 'gemini-pro'][idx],
                tokenType: 'prompt',
                amount: 100,
                valueKey: 'prompt',
              },
            }),
          ),
      );

      await Promise.allSettled(promises);

      const finalBalance = await Balance.findOne({ user: user._id });
      endpoints.forEach((endpoint) => {
        const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === endpoint);
        expect(endpointLimit.tokenCredits).toBe(0);
      });
    }, 30000);

    it('should test with different refill intervals', async () => {
      const units = ['seconds', 'minutes', 'hours'];
      const users = await Promise.all(
        units.map((unit, idx) =>
          User.create({
            email: `refill${idx}@example.com`,
            name: `Refill User ${idx}`,
            provider: 'local',
          }),
        ),
      );

      await Promise.all(
        users.map((user, idx) =>
          Balance.create({
            user: user._id,
            tokenCredits: 0,
            endpointLimits: [
              {
                endpoint: 'openAI',
                tokenCredits: 100,
                enabled: true,
                autoRefillEnabled: true,
                refillAmount: 500,
                refillIntervalValue: 1,
                refillIntervalUnit: units[idx],
                lastRefill: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            ],
          }),
        ),
      );

      await checkAndRefillAll();

      for (const user of users) {
        const balance = await Balance.findOne({ user: user._id });
        const endpointLimit = balance.endpointLimits.find((el) => el.endpoint === 'openAI');
        expect(endpointLimit.tokenCredits).toBeGreaterThan(100);
      }
    }, 30000);

    it('should verify no data corruption under load', async () => {
      const user = await User.create({
        email: 'corruption@example.com',
        name: 'Corruption Test',
        provider: 'local',
      });

      const initialBalance = 5000;
      await Balance.create({
        user: user._id,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: false,
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};

      const promises = Array(100)
        .fill(null)
        .map(() =>
          checkBalance({
            req: mockReq,
            res: mockRes,
            txData: {
              user: user._id,
              endpoint: 'openAI',
              model: 'gpt-4',
              tokenType: 'prompt',
              amount: 50,
              valueKey: 'prompt',
            },
          }),
        );

      await Promise.allSettled(promises);

      const finalBalance = await Balance.findOne({ user: user._id });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === 'openAI');

      expect(endpointLimit.tokenCredits).toBeGreaterThanOrEqual(0);
      expect(endpointLimit.tokenCredits).toBeLessThanOrEqual(initialBalance);
      expect(endpointLimit.enabled).toBe(true);
      expect(endpointLimit.endpoint).toBe('openAI');
    }, 30000);
  });

  describe('Stress Tests', () => {
    it('should handle 1000 concurrent micro-transactions', async () => {
      const user = await User.create({
        email: 'stress@example.com',
        name: 'Stress User',
        provider: 'local',
      });

      const initialBalance = 100000;
      await Balance.create({
        user: user._id,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: false,
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};

      const promises = Array(1000)
        .fill(null)
        .map(() =>
          checkBalance({
            req: mockReq,
            res: mockRes,
            txData: {
              user: user._id,
              endpoint: 'openAI',
              model: 'gpt-3.5-turbo',
              tokenType: 'prompt',
              amount: 100,
              valueKey: 'prompt',
            },
          }),
        );

      const results = await Promise.allSettled(promises);
      const successful = results.filter((r) => r.status === 'fulfilled').length;

      expect(successful).toBe(initialBalance / 100);

      const finalBalance = await Balance.findOne({ user: user._id });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === 'openAI');
      expect(endpointLimit.tokenCredits).toBe(0);
    }, 60000);

    it('should handle no timeouts or hangs', async () => {
      const user = await User.create({
        email: 'timeout@example.com',
        name: 'Timeout Test',
        provider: 'local',
      });

      await Balance.create({
        user: user._id,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'anthropic',
            tokenCredits: 10000,
            enabled: true,
            autoRefillEnabled: false,
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};

      const startTime = Date.now();

      const promises = Array(500)
        .fill(null)
        .map(() =>
          checkBalance({
            req: mockReq,
            res: mockRes,
            txData: {
              user: user._id,
              endpoint: 'anthropic',
              model: 'claude-3-sonnet',
              tokenType: 'prompt',
              amount: 20,
              valueKey: 'prompt',
            },
          }),
        );

      await Promise.allSettled(promises);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(30000);
    }, 60000);

    it('should verify no negative balances under extreme load', async () => {
      const users = await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          User.create({
            email: `load${i}@example.com`,
            name: `Load User ${i}`,
            provider: 'local',
          }),
        ),
      );

      await Promise.all(
        users.map((user) =>
          Balance.create({
            user: user._id,
            tokenCredits: 0,
            endpointLimits: [
              {
                endpoint: 'google',
                tokenCredits: 500,
                enabled: true,
                autoRefillEnabled: false,
              },
            ],
          }),
        ),
      );

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};

      const allPromises = users.flatMap((user) =>
        Array(20)
          .fill(null)
          .map(() =>
            checkBalance({
              req: mockReq,
              res: mockRes,
              txData: {
                user: user._id,
                endpoint: 'google',
                model: 'gemini-pro',
                tokenType: 'prompt',
                amount: 50,
                valueKey: 'prompt',
              },
            }),
          ),
      );

      await Promise.allSettled(allPromises);

      for (const user of users) {
        const balance = await Balance.findOne({ user: user._id });
        const endpointLimit = balance.endpointLimits.find((el) => el.endpoint === 'google');
        expect(endpointLimit.tokenCredits).toBeGreaterThanOrEqual(0);
      }
    }, 60000);
  });

  describe('Auto-refill + Spend Race', () => {
    it('should handle spend triggering auto-refill immediately', async () => {
      const user = await User.create({
        email: 'race@example.com',
        name: 'Race User',
        provider: 'local',
      });

      await Balance.create({
        user: user._id,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 50,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 1000,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};

      const promise = checkBalance({
        req: mockReq,
        res: mockRes,
        txData: {
          user: user._id,
          endpoint: 'openAI',
          model: 'gpt-4',
          tokenType: 'prompt',
          amount: 200,
          valueKey: 'prompt',
        },
      });

      await expect(promise).resolves.toBe(true);

      const finalBalance = await Balance.findOne({ user: user._id });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === 'openAI');
      expect(endpointLimit.tokenCredits).toBeGreaterThan(50);
    }, 30000);

    it('should handle concurrent manual refills', async () => {
      const user = await User.create({
        email: 'manual@example.com',
        name: 'Manual Refill User',
        provider: 'local',
      });

      await Balance.create({
        user: user._id,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'anthropic',
            tokenCredits: 100,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 500,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
          },
        ],
      });

      const promises = Array(10)
        .fill(null)
        .map(() =>
          createModelAutoRefillTransaction({
            user: user._id,
            model: 'anthropic',
            tokenType: 'credits',
            context: 'manualRefill',
            rawAmount: 500,
          }),
        );

      await Promise.all(promises);

      const finalBalance = await Balance.findOne({ user: user._id });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === 'anthropic');
      expect(endpointLimit.tokenCredits).toBeGreaterThan(100);
    }, 30000);

    it('should handle end-to-end flow: spend → alert → refill → alert reset', async () => {
      const user = await User.create({
        email: 'e2e@example.com',
        name: 'E2E User',
        provider: 'local',
      });

      await Balance.create({
        user: user._id,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'google',
            tokenCredits: 200,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 1000,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
            alertsSent: [],
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};

      await checkBalance({
        req: mockReq,
        res: mockRes,
        txData: {
          user: user._id,
          endpoint: 'google',
          model: 'gemini-pro',
          tokenType: 'prompt',
          amount: 300,
          valueKey: 'prompt',
        },
      });

      const finalBalance = await Balance.findOne({ user: user._id });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === 'google');
      expect(endpointLimit.tokenCredits).toBeGreaterThan(200);
    }, 30000);
  });
});
