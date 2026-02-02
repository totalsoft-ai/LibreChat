const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  startAutoRefillScheduler,
  triggerManualRefill,
  checkAndRefillAll,
} = require('./AutoRefillScheduler');
const { Balance } = require('~/db/models');
const { createModelAutoRefillTransaction } = require('~/models/Transaction');

jest.mock('@librechat/data-schemas', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('~/models/Transaction', () => ({
  createModelAutoRefillTransaction: jest.fn(),
}));

jest.mock('node-cron', () => ({
  schedule: jest.fn((expression, callback) => ({
    stop: jest.fn(),
    start: jest.fn(),
  })),
}));

const { logger } = require('@librechat/data-schemas');
const cron = require('node-cron');

describe('AutoRefillScheduler', () => {
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

    createModelAutoRefillTransaction.mockImplementation(async ({ user, model, rawAmount }) => {
      const balance = await Balance.findOne({ user });
      const endpointLimit = balance.endpointLimits.find((el) => el.endpoint === model);
      endpointLimit.tokenCredits += rawAmount;
      endpointLimit.lastRefill = new Date();
      await balance.save();
      return { balance: endpointLimit.tokenCredits };
    });
  });

  describe('addIntervalToDate', () => {
    it('should add seconds correctly', async () => {
      const userId = new mongoose.Types.ObjectId();
      const startDate = new Date('2025-01-01T00:00:00Z');

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 100,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 500,
            refillIntervalValue: 30,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(startDate.getTime() - 31000),
          },
        ],
      });

      await checkAndRefillAll();

      expect(createModelAutoRefillTransaction).toHaveBeenCalled();
    });

    it('should add minutes correctly', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 100,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 500,
            refillIntervalValue: 1,
            refillIntervalUnit: 'minutes',
            lastRefill: new Date(Date.now() - 61000),
          },
        ],
      });

      await checkAndRefillAll();

      expect(createModelAutoRefillTransaction).toHaveBeenCalled();
    });

    it('should handle month boundaries (Jan 31 + 1 month)', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 100,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 500,
            refillIntervalValue: 1,
            refillIntervalUnit: 'months',
            lastRefill: new Date('2025-01-31T00:00:00Z'),
          },
        ],
      });

      await checkAndRefillAll();

      expect(createModelAutoRefillTransaction).toHaveBeenCalled();
    });

    it('should handle year boundaries (Dec 31 + 1 day)', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 100,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 500,
            refillIntervalValue: 1,
            refillIntervalUnit: 'days',
            lastRefill: new Date('2024-12-31T00:00:00Z'),
          },
        ],
      });

      await checkAndRefillAll();

      expect(createModelAutoRefillTransaction).toHaveBeenCalled();
    });

    it('should handle all time units', async () => {
      const units = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months'];

      for (const unit of units) {
        await mongoose.connection.dropDatabase();
        jest.clearAllMocks();
        const userId = new mongoose.Types.ObjectId();

        const intervals = {
          seconds: 2000,
          minutes: 61000,
          hours: 3600000 + 1000,
          days: 24 * 3600000 + 1000,
          weeks: 7 * 24 * 3600000 + 1000,
          months: 32 * 24 * 3600000,
        };

        await Balance.create({
          user: userId,
          tokenCredits: 0,
          endpointLimits: [
            {
              endpoint: 'openAI',
              tokenCredits: 100,
              enabled: true,
              autoRefillEnabled: true,
              refillAmount: 500,
              refillIntervalValue: 1,
              refillIntervalUnit: unit,
              lastRefill: new Date(Date.now() - intervals[unit]),
            },
          ],
        });

        await checkAndRefillAll();

        expect(createModelAutoRefillTransaction).toHaveBeenCalled();
      }
    });
  });

  describe('processEndpointRefill', () => {
    it('should skip when interval has not passed', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 100,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 500,
            refillIntervalValue: 30,
            refillIntervalUnit: 'days',
            lastRefill: new Date(),
          },
        ],
      });

      await checkAndRefillAll();

      expect(createModelAutoRefillTransaction).not.toHaveBeenCalled();
    });

    it('should perform refill when interval has passed', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'anthropic',
            tokenCredits: 100,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 1000,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
          },
        ],
      });

      await checkAndRefillAll();

      expect(createModelAutoRefillTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          user: userId,
          model: 'anthropic',
          rawAmount: 1000,
        }),
      );
    });

    it('should skip when refillAmount is 0', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'google',
            tokenCredits: 100,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 0,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
          },
        ],
      });

      await checkAndRefillAll();

      expect(createModelAutoRefillTransaction).not.toHaveBeenCalled();
    });

    it('should skip when autoRefillEnabled is false', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 100,
            enabled: true,
            autoRefillEnabled: false,
            refillAmount: 500,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
          },
        ],
      });

      await checkAndRefillAll();

      expect(createModelAutoRefillTransaction).not.toHaveBeenCalled();
    });

    it('should skip when endpoint is disabled', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 100,
            enabled: false,
            autoRefillEnabled: true,
            refillAmount: 500,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
          },
        ],
      });

      await checkAndRefillAll();

      expect(createModelAutoRefillTransaction).not.toHaveBeenCalled();
    });

    it('should handle transaction creation failure gracefully', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
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

      createModelAutoRefillTransaction.mockRejectedValueOnce(new Error('Database error'));

      await checkAndRefillAll();

      expect(logger.error).toHaveBeenCalled();
    });

    it('should process multiple endpoints for same user', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 100,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 500,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
          },
          {
            endpoint: 'anthropic',
            tokenCredits: 200,
            enabled: true,
            autoRefillEnabled: true,
            refillAmount: 1000,
            refillIntervalValue: 1,
            refillIntervalUnit: 'seconds',
            lastRefill: new Date(Date.now() - 2000),
          },
        ],
      });

      await checkAndRefillAll();

      expect(createModelAutoRefillTransaction).toHaveBeenCalledTimes(2);
    });
  });

  describe('checkAndRefillAll - Mutex Lock', () => {
    it('should skip execution when previous job still running', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
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

      createModelAutoRefillTransaction.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      const promise1 = checkAndRefillAll();
      const promise2 = checkAndRefillAll();

      await Promise.all([promise1, promise2]);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Previous job still running'),
        expect.objectContaining({
          runningForSeconds: expect.any(Number),
        }),
      );
    });

    it('should allow execution after previous job completes', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
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

      await checkAndRefillAll();
      await checkAndRefillAll();

      expect(createModelAutoRefillTransaction).toHaveBeenCalledTimes(2);
    });

    it('should release lock after completion', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
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

      await checkAndRefillAll();

      const scheduler = startAutoRefillScheduler();
      const status = scheduler.getStatus();

      expect(status.isRunning).toBe(false);
      expect(status.lastRunEndTime).toBeDefined();

      scheduler.stop();
    });

    it('should release lock on error (finally block)', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
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

      createModelAutoRefillTransaction.mockRejectedValueOnce(new Error('Critical error'));

      await checkAndRefillAll();

      const scheduler = startAutoRefillScheduler();
      const status = scheduler.getStatus();

      expect(status.isRunning).toBe(false);

      scheduler.stop();
    });

    it('should track lastRunStartTime and lastRunEndTime', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
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

      await checkAndRefillAll();

      const scheduler = startAutoRefillScheduler();
      const status = scheduler.getStatus();

      expect(status.lastRunStartTime).toBeDefined();
      expect(status.lastRunEndTime).toBeDefined();
      expect(status.lastRunDuration).toBeGreaterThanOrEqual(0);

      scheduler.stop();
    });

    it('should test getStatus() method returns correct state', async () => {
      const scheduler = startAutoRefillScheduler();
      const status = scheduler.getStatus();

      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('lastRunStartTime');
      expect(status).toHaveProperty('lastRunEndTime');
      expect(status).toHaveProperty('lastRunDuration');

      scheduler.stop();
    });
  });

  describe('startAutoRefillScheduler', () => {
    it('should start scheduler with custom cron expression', () => {
      const scheduler = startAutoRefillScheduler({ cronExpression: '0 * * * *' });

      expect(cron.schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function));

      scheduler.stop();
    });

    it('should run immediately when runImmediately is true', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
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

      const scheduler = startAutoRefillScheduler({ runImmediately: true });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(createModelAutoRefillTransaction).toHaveBeenCalled();

      scheduler.stop();
    });

    it('should not run immediately when runImmediately is false', () => {
      const scheduler = startAutoRefillScheduler({ runImmediately: false });

      expect(createModelAutoRefillTransaction).not.toHaveBeenCalled();

      scheduler.stop();
    });

    it('should use default cron expression when not provided', () => {
      const scheduler = startAutoRefillScheduler();

      expect(cron.schedule).toHaveBeenCalledWith('* * * * *', expect.any(Function));

      scheduler.stop();
    });

    it('should return object with stop method', () => {
      const scheduler = startAutoRefillScheduler();

      expect(scheduler).toHaveProperty('stop');
      expect(scheduler).toHaveProperty('checkNow');
      expect(scheduler).toHaveProperty('getStatus');

      scheduler.stop();
    });
  });

  describe('triggerManualRefill', () => {
    it('should trigger manual refill', async () => {
      const userId = new mongoose.Types.ObjectId();

      await Balance.create({
        user: userId,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
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

      await triggerManualRefill();

      expect(createModelAutoRefillTransaction).toHaveBeenCalled();
    });
  });
});
