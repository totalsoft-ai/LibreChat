const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { checkBalance } = require('./balanceMethods');
const { Balance, Transaction, User, Notification } = require('~/db/models');

// Mock dependencies
jest.mock('@librechat/data-schemas', () => {
  const actual = jest.requireActual('@librechat/data-schemas');
  return {
    ...actual,
    logger: {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    },
  };
});

jest.mock('./Transaction', () => ({
  createModelAutoRefillTransaction: jest.fn(),
  createAutoRefillTransaction: jest.fn(),
}));

jest.mock('~/cache', () => ({
  logViolation: jest.fn(),
}));

jest.mock('~/server/services/BudgetAlertService', () => ({
  checkBudgetAlerts: jest.fn().mockResolvedValue(undefined),
}));

const { createModelAutoRefillTransaction } = require('./Transaction');
const { checkBudgetAlerts } = require('~/server/services/BudgetAlertService');
const { logViolation } = require('~/cache');

describe('balanceMethods - Atomic Operations and TOCTOU Prevention', () => {
  let mongoServer;
  let userId;

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
    userId = new mongoose.Types.ObjectId();
  });

  describe('spendTokens - TOCTOU Prevention', () => {
    it('should prevent double-spending with 10 concurrent requests on limited balance', async () => {
      const endpoint = 'openAI';
      const tokenCost = 100;
      const initialBalance = 1000;
      const concurrentRequests = 10;

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint,
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: false,
            refillAmount: 0,
            refillIntervalValue: 30,
            refillIntervalUnit: 'days',
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint,
        model: 'gpt-3.5-turbo',
        tokenType: 'prompt',
        amount: tokenCost,
        endpointTokenConfig: null,
      };

      const promises = Array(concurrentRequests)
        .fill(null)
        .map(() => checkBalance({ req: mockReq, res: mockRes, txData }));

      const results = await Promise.allSettled(promises);
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      expect(successful).toBe(initialBalance / tokenCost);
      expect(failed).toBe(concurrentRequests - successful);

      const finalBalance = await Balance.findOne({ user: userId });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === endpoint);
      expect(endpointLimit.tokenCredits).toBe(0);
    });

    it('should maintain consistency with 100 micro-transactions', async () => {
      const endpoint = 'anthropic';
      const tokenCost = 10;
      const initialBalance = 1000;
      const concurrentRequests = 100;

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint,
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: false,
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint,
        model: 'claude-3-5-sonnet',
        tokenType: 'prompt',
        amount: tokenCost,
        endpointTokenConfig: null,
      };

      const results = await Promise.allSettled(
        Array(concurrentRequests)
          .fill(null)
          .map(() => checkBalance({ req: mockReq, res: mockRes, txData })),
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      expect(successful).toBe(initialBalance / tokenCost);

      const finalBalance = await Balance.findOne({ user: userId });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === endpoint);
      expect(endpointLimit.tokenCredits).toBe(0);
    });

    it('should handle race between spend and concurrent refill', async () => {
      const endpoint = 'google';
      const tokenCost = 50;
      const initialBalance = 100;
      const refillAmount = 200;

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint,
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
          },
        ],
      });

      createModelAutoRefillTransaction.mockImplementation(async ({ user, model }) => {
        const balance = await Balance.findOne({ user });
        const endpointLimit = balance.endpointLimits.find((el) => el.endpoint === model);
        endpointLimit.tokenCredits += refillAmount;
        endpointLimit.lastRefill = new Date();
        await balance.save();
        return { balance: endpointLimit.tokenCredits };
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint,
        model: 'gemini-pro',
        tokenType: 'prompt',
        amount: tokenCost,
        endpointTokenConfig: null,
      };

      const promises = Array(5)
        .fill(null)
        .map(() => checkBalance({ req: mockReq, res: mockRes, txData }));

      const results = await Promise.allSettled(promises);
      const successful = results.filter((r) => r.status === 'fulfilled').length;

      expect(successful).toBeGreaterThan(2);

      const finalBalance = await Balance.findOne({ user: userId });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === endpoint);
      expect(endpointLimit.tokenCredits).toBeGreaterThanOrEqual(0);
    });

    it('should never allow negative balance after concurrent operations', async () => {
      const endpoint = 'openAI';
      const tokenCost = 150;
      const initialBalance = 1500;
      const concurrentRequests = 50;

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint,
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: false,
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint,
        model: 'gpt-4',
        tokenType: 'prompt',
        amount: tokenCost,
        endpointTokenConfig: null,
      };

      await Promise.allSettled(
        Array(concurrentRequests)
          .fill(null)
          .map(() => checkBalance({ req: mockReq, res: mockRes, txData })),
      );

      const finalBalance = await Balance.findOne({ user: userId });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === endpoint);
      expect(endpointLimit.tokenCredits).toBeGreaterThanOrEqual(0);
    });

    it('should verify atomic findOneAndUpdate behavior', async () => {
      const endpoint = 'anthropic';
      const tokenCost = 100;
      const initialBalance = 500;

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint,
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: false,
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint,
        model: 'claude-3-opus',
        tokenType: 'completion',
        amount: tokenCost,
        endpointTokenConfig: null,
      };

      const exactRequests = initialBalance / tokenCost;
      const results = await Promise.allSettled(
        Array(exactRequests)
          .fill(null)
          .map(() => checkBalance({ req: mockReq, res: mockRes, txData })),
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      expect(successful).toBe(exactRequests);

      const finalBalance = await Balance.findOne({ user: userId });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === endpoint);
      expect(endpointLimit.tokenCredits).toBe(0);
    });

    it('should handle concurrent spends on different endpoints for same user', async () => {
      const endpoints = ['openAI', 'anthropic', 'google'];
      const tokenCost = 50;
      const initialBalance = 500;

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: endpoints.map((endpoint) => ({
          endpoint,
          tokenCredits: initialBalance,
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
                user: userId,
                endpoint,
                model: ['gpt-4', 'claude-3-opus', 'gemini-pro'][idx],
                tokenType: 'prompt',
                amount: tokenCost,
                endpointTokenConfig: null,
              },
            }),
          ),
      );

      await Promise.allSettled(promises);

      const finalBalance = await Balance.findOne({ user: userId });
      endpoints.forEach((endpoint) => {
        const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === endpoint);
        expect(endpointLimit.tokenCredits).toBe(0);
      });
    });
  });

  describe('Auto-refill Integration', () => {
    it('should trigger auto-refill when spend fails due to insufficient balance', async () => {
      const endpoint = 'openAI';
      const tokenCost = 200;
      const initialBalance = 50;
      const refillAmount = 1000;

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint,
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
          },
        ],
      });

      createModelAutoRefillTransaction.mockImplementation(async ({ user, model }) => {
        const balance = await Balance.findOne({ user });
        const endpointLimit = balance.endpointLimits.find((el) => el.endpoint === model);
        endpointLimit.tokenCredits += refillAmount;
        endpointLimit.lastRefill = new Date();
        await balance.save();
        return { balance: endpointLimit.tokenCredits };
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint,
        model: 'gpt-4',
        tokenType: 'prompt',
        amount: tokenCost,
        endpointTokenConfig: null,
      };

      await checkBalance({ req: mockReq, res: mockRes, txData });

      expect(createModelAutoRefillTransaction).toHaveBeenCalled();

      const finalBalance = await Balance.findOne({ user: userId });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === endpoint);
      expect(endpointLimit.tokenCredits).toBeGreaterThan(initialBalance);
    });

    it('should retry spend after successful auto-refill', async () => {
      const endpoint = 'anthropic';
      const tokenCost = 500;
      const initialBalance = 100;
      const refillAmount = 1000;

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint,
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount,
            refillIntervalValue: 30,
            refillIntervalUnit: 'days',
            lastRefill: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      createModelAutoRefillTransaction.mockImplementation(async ({ user, model }) => {
        const balance = await Balance.findOne({ user });
        const endpointLimit = balance.endpointLimits.find((el) => el.endpoint === model);
        endpointLimit.tokenCredits += refillAmount;
        endpointLimit.lastRefill = new Date();
        await balance.save();
        return { balance: endpointLimit.tokenCredits };
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint,
        model: 'claude-3-sonnet',
        tokenType: 'completion',
        amount: tokenCost,
        endpointTokenConfig: null,
      };

      const result = await checkBalance({ req: mockReq, res: mockRes, txData });

      expect(result).toBe(true);
      expect(createModelAutoRefillTransaction).toHaveBeenCalled();

      const finalBalance = await Balance.findOne({ user: userId });
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === endpoint);
      expect(endpointLimit.tokenCredits).toBe(initialBalance + refillAmount - tokenCost);
    });

    it('should skip refill when interval has not passed', async () => {
      const endpoint = 'google';
      const tokenCost = 500;
      const initialBalance = 100;
      const refillAmount = 1000;

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint,
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount,
            refillIntervalValue: 30,
            refillIntervalUnit: 'days',
            lastRefill: new Date(),
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint,
        model: 'gemini-pro',
        tokenType: 'prompt',
        amount: tokenCost,
        endpointTokenConfig: null,
      };

      await expect(
        checkBalance({ req: mockReq, res: mockRes, txData }),
      ).rejects.toThrow();

      expect(createModelAutoRefillTransaction).not.toHaveBeenCalled();
    });

    it('should skip refill when refillAmount is 0', async () => {
      const endpoint = 'openAI';
      const tokenCost = 200;
      const initialBalance = 50;

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint,
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 0,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint,
        model: 'gpt-3.5-turbo',
        tokenType: 'prompt',
        amount: tokenCost,
        endpointTokenConfig: null,
      };

      await expect(
        checkBalance({ req: mockReq, res: mockRes, txData }),
      ).rejects.toThrow();

      expect(createModelAutoRefillTransaction).not.toHaveBeenCalled();
    });

    it('should handle all refillIntervalUnits', async () => {
      const units = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months'];
      const endpoint = 'openAI';
      const tokenCost = 100;
      const initialBalance = 50;
      const refillAmount = 500;

      for (const unit of units) {
        await mongoose.connection.dropDatabase();
        const testUserId = new mongoose.Types.ObjectId();

        await Balance.create({
          user: testUserId,
          tokenCredits: 0,
          endpointLimits: [
            {
              endpoint,
              tokenCredits: initialBalance,
              enabled: true,
              autoRefillEnabled: true,
              refillAmount,
              refillIntervalValue: 1,
              refillIntervalUnit: unit,
              lastRefill: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
            },
          ],
        });

        createModelAutoRefillTransaction.mockImplementation(async ({ user }) => {
          const balance = await Balance.findOne({ user });
          const endpointLimit = balance.endpointLimits.find((el) => el.endpoint === endpoint);
          endpointLimit.tokenCredits += refillAmount;
          endpointLimit.lastRefill = new Date();
          await balance.save();
          return { balance: endpointLimit.tokenCredits };
        });

        const mockReq = { app: { locals: { appConfig: {} } } };
        const mockRes = {};
        const txData = {
          user: testUserId,
          endpoint,
          model: 'gpt-4',
          tokenType: 'prompt',
          amount: tokenCost,
          endpointTokenConfig: null,
        };

        await checkBalance({ req: mockReq, res: mockRes, txData });

        const finalBalance = await Balance.findOne({ user: testUserId });
        const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === endpoint);
        expect(endpointLimit.tokenCredits).toBeGreaterThan(initialBalance);
      }
    });
  });

  describe('Unlimited Spending Behavior', () => {
    it('should allow unlimited when no endpoint limit exists', async () => {
      await Balance.create({
        user: userId,
        tokenCredits: 1000,
        endpointLimits: [],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint: 'openAI',
        model: 'gpt-4',
        tokenType: 'prompt',
        amount: 5000,
        endpointTokenConfig: null,
      };

      const result = await checkBalance({ req: mockReq, res: mockRes, txData });
      expect(result).toBe(true);
    });

    it('should allow unlimited when endpoint limit disabled', async () => {
      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'anthropic',
            tokenCredits: 1000,
            enabled: false,
            autoRefillEnabled: false,
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint: 'anthropic',
        model: 'claude-3-opus',
        tokenType: 'completion',
        amount: 10000,
        endpointTokenConfig: null,
      };

      const result = await checkBalance({ req: mockReq, res: mockRes, txData });
      expect(result).toBe(true);
    });

    it('should handle both endpoint and global sources empty/disabled', async () => {
      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint: 'google',
        model: 'gemini-pro',
        tokenType: 'prompt',
        amount: 1000,
        endpointTokenConfig: null,
      };

      const result = await checkBalance({ req: mockReq, res: mockRes, txData });
      expect(result).toBe(true);
    });
  });

  describe('Budget Alert Integration', () => {
    it('should call checkBudgetAlerts after successful spend', async () => {
      const endpoint = 'openAI';
      const tokenCost = 100;
      const initialBalance = 1000;

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint,
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: false,
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint,
        model: 'gpt-4',
        tokenType: 'prompt',
        amount: tokenCost,
        endpointTokenConfig: null,
      };

      await checkBalance({ req: mockReq, res: mockRes, txData });

      await new Promise((resolve) => setImmediate(resolve));

      expect(checkBudgetAlerts).toHaveBeenCalledWith({
        user: userId,
        endpoint,
        appConfig: {},
      });
    });

    it('should log violation when balance insufficient', async () => {
      const endpoint = 'anthropic';
      const tokenCost = 500;
      const initialBalance = 100;

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint,
            tokenCredits: initialBalance,
            enabled: true,
            autoRefillEnabled: false,
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } } };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint,
        model: 'claude-3-opus',
        tokenType: 'completion',
        amount: tokenCost,
        endpointTokenConfig: null,
      };

      await expect(
        checkBalance({ req: mockReq, res: mockRes, txData }),
      ).rejects.toThrow();

      expect(logViolation).toHaveBeenCalled();
    });
  });

  describe('Balance Source Selection', () => {
    it('should prefer endpoint-specific limit over global balance', async () => {
      const endpoint = 'openAI';
      const globalBalance = 10000;
      const endpointBalance = 500;
      const tokenCost = 100;

      await Balance.create({
        user: userId,
        tokenCredits: globalBalance,
        endpointLimits: [
          {
            endpoint,
            tokenCredits: endpointBalance,
            enabled: true,
            autoRefillEnabled: false,
          },
        ],
      });

      const mockReq = { app: { locals: { appConfig: {} } }, balanceSource: null };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint,
        model: 'gpt-4',
        tokenType: 'prompt',
        amount: tokenCost,
        endpointTokenConfig: null,
      };

      await checkBalance({ req: mockReq, res: mockRes, txData });

      expect(mockReq.balanceSource).toBe(endpoint);

      const finalBalance = await Balance.findOne({ user: userId });
      expect(finalBalance.tokenCredits).toBe(globalBalance);
      const endpointLimit = finalBalance.endpointLimits.find((el) => el.endpoint === endpoint);
      expect(endpointLimit.tokenCredits).toBe(endpointBalance - tokenCost);
    });

    it('should fallback to unlimited when endpoint limit missing', async () => {
      await Balance.create({
        user: userId,
        tokenCredits: 5000,
        endpointLimits: [],
      });

      const mockReq = { app: { locals: { appConfig: {} } }, balanceSource: null };
      const mockRes = {};
      const txData = {
        user: userId,
        endpoint: 'google',
        model: 'gemini-pro',
        tokenType: 'prompt',
        amount: 10000,
        endpointTokenConfig: null,
      };

      const result = await checkBalance({ req: mockReq, res: mockRes, txData });
      expect(result).toBe(true);
      expect(mockReq.balanceSource).toBe('google');
    });
  });
});
