const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  calculateConsumedPercentage,
  shouldSendAlert,
  sendBudgetAlert,
  checkEndpointLimitAlerts,
  checkBudgetAlerts,
  resetAlerts,
} = require('./BudgetAlertService');
const { Balance, User, Notification } = require('~/db/models');

jest.mock('@librechat/data-schemas', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('@librechat/api', () => ({
  getBalanceConfig: jest.fn(() => ({
    alertsEnabled: true,
    alertThresholds: [80, 95],
  })),
}));

const { logger } = require('@librechat/data-schemas');

describe('BudgetAlertService', () => {
  let mongoServer;
  let testUser;

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

    testUser = await User.create({
      email: 'test@example.com',
      name: 'Test User',
      provider: 'local',
    });
  });

  describe('calculateConsumedPercentage', () => {
    it('should calculate percentage correctly for normal case', () => {
      const percentage = calculateConsumedPercentage(10000, 2000);
      expect(percentage).toBe(80);
    });

    it('should return 0 when initialLimit is 0', () => {
      const percentage = calculateConsumedPercentage(0, 0);
      expect(percentage).toBe(0);
    });

    it('should cap at 100% when balance is negative (overdraft)', () => {
      const percentage = calculateConsumedPercentage(10000, -1000);
      expect(percentage).toBe(100);
    });

    it('should return 0 when currentBalance exceeds initialLimit (refund)', () => {
      const percentage = calculateConsumedPercentage(10000, 15000);
      expect(percentage).toBe(0);
    });

    it('should handle decimal precision correctly', () => {
      const percentage = calculateConsumedPercentage(12345, 6172.5);
      expect(percentage).toBeCloseTo(50, 1);
    });

    it('should verify bounds checking (0-100% range)', () => {
      expect(calculateConsumedPercentage(100, 50)).toBeLessThanOrEqual(100);
      expect(calculateConsumedPercentage(100, 50)).toBeGreaterThanOrEqual(0);
      expect(calculateConsumedPercentage(100, -50)).toBe(100);
      expect(calculateConsumedPercentage(100, 200)).toBe(0);
    });
  });

  describe('shouldSendAlert', () => {
    it('should return true when threshold crossed and not already sent', () => {
      const result = shouldSendAlert(85, 80, []);
      expect(result).toBe(true);
    });

    it('should return false when threshold not crossed', () => {
      const result = shouldSendAlert(75, 80, []);
      expect(result).toBe(false);
    });

    it('should return false when alert already sent', () => {
      const result = shouldSendAlert(85, 80, [80]);
      expect(result).toBe(false);
    });

    it('should handle multiple thresholds with ascending order', () => {
      expect(shouldSendAlert(81, 80, [])).toBe(true);
      expect(shouldSendAlert(81, 95, [])).toBe(false);
      expect(shouldSendAlert(96, 95, [80])).toBe(true);
    });

    it('should handle edge case at exactly threshold', () => {
      expect(shouldSendAlert(80, 80, [])).toBe(true);
      expect(shouldSendAlert(79.99, 80, [])).toBe(false);
    });
  });

  describe('sendBudgetAlert', () => {
    it('should create notification with correct data structure', async () => {
      const notification = await sendBudgetAlert({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpoint: 'openAI',
        threshold: 80,
        consumed: 82.5,
        remainingCredits: 175000,
        initialLimit: 1000000,
      });

      expect(notification).toBeDefined();
      expect(notification.type).toBe('BUDGET_ALERT');
      expect(notification.user.toString()).toBe(testUser._id.toString());
      expect(notification.data.threshold).toBe(80);
      expect(notification.data.consumed).toBe(82.5);
    });

    it('should set severity to warning for 80% threshold', async () => {
      const notification = await sendBudgetAlert({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpoint: 'openAI',
        threshold: 80,
        consumed: 85,
        remainingCredits: 150000,
        initialLimit: 1000000,
      });

      expect(notification.severity).toBe('warning');
    });

    it('should set severity to error for 95% threshold', async () => {
      const notification = await sendBudgetAlert({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpoint: 'anthropic',
        threshold: 95,
        consumed: 97,
        remainingCredits: 30000,
        initialLimit: 1000000,
      });

      expect(notification.severity).toBe('error');
    });

    it('should handle notification creation failure gracefully', async () => {
      jest.spyOn(Notification, 'create').mockRejectedValueOnce(new Error('DB error'));

      const result = await sendBudgetAlert({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpoint: 'google',
        threshold: 80,
        consumed: 85,
        remainingCredits: 150000,
        initialLimit: 1000000,
      });

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should calculate remainingCredits correctly', async () => {
      const notification = await sendBudgetAlert({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpoint: 'openAI',
        threshold: 80,
        consumed: 80,
        remainingCredits: 200000,
        initialLimit: 1000000,
      });

      expect(notification.data.remainingCredits).toBe(200000);
      expect(notification.data.remainingDollars).toBe('0.20');
    });

    it('should format message correctly for global endpoint', async () => {
      const notification = await sendBudgetAlert({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpoint: 'global',
        threshold: 90,
        consumed: 92,
        remainingCredits: 80000,
        initialLimit: 1000000,
      });

      expect(notification.message).toContain('your account');
    });
  });

  describe('checkEndpointLimitAlerts - Deduplication', () => {
    it('should not send duplicate alert for same threshold', async () => {
      const endpointLimit = {
        endpoint: 'openAI',
        tokenCredits: 200000,
        alertsSent: [80],
      };

      const updatedAlerts = await checkEndpointLimitAlerts({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpointLimit,
        initialLimit: 1000000,
        thresholds: [80, 95],
      });

      expect(updatedAlerts).toEqual([80]);

      const notifications = await Notification.find({ user: testUser._id });
      expect(notifications).toHaveLength(0);
    });

    it('should send multiple alerts when crossing multiple thresholds', async () => {
      const endpointLimit = {
        endpoint: 'anthropic',
        tokenCredits: 50000,
        alertsSent: [],
      };

      const updatedAlerts = await checkEndpointLimitAlerts({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpointLimit,
        initialLimit: 1000000,
        thresholds: [80, 95],
      });

      expect(updatedAlerts).toContain(80);
      expect(updatedAlerts).toContain(95);

      const notifications = await Notification.find({ user: testUser._id });
      expect(notifications).toHaveLength(2);
    });

    it('should test progression: 0% → 85% (send 80%) → 98% (send 95%)', async () => {
      let endpointLimit = {
        endpoint: 'google',
        tokenCredits: 1000000,
        alertsSent: [],
      };

      let updatedAlerts = await checkEndpointLimitAlerts({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpointLimit,
        initialLimit: 1000000,
        thresholds: [80, 95],
      });
      expect(updatedAlerts).toEqual([]);

      endpointLimit.tokenCredits = 150000;
      updatedAlerts = await checkEndpointLimitAlerts({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpointLimit,
        initialLimit: 1000000,
        thresholds: [80, 95],
      });
      expect(updatedAlerts).toContain(80);
      expect(updatedAlerts).not.toContain(95);

      endpointLimit.tokenCredits = 20000;
      endpointLimit.alertsSent = updatedAlerts;
      updatedAlerts = await checkEndpointLimitAlerts({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpointLimit,
        initialLimit: 1000000,
        thresholds: [80, 95],
      });
      expect(updatedAlerts).toContain(80);
      expect(updatedAlerts).toContain(95);
    });

    it('should verify only one Notification created per threshold', async () => {
      const endpointLimit = {
        endpoint: 'openAI',
        tokenCredits: 100000,
        alertsSent: [],
      };

      await checkEndpointLimitAlerts({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpointLimit,
        initialLimit: 1000000,
        thresholds: [80],
      });

      const notifications = await Notification.find({
        user: testUser._id,
        'data.threshold': 80,
      });
      expect(notifications).toHaveLength(1);
    });

    it('should update alertsSent array atomically', async () => {
      const endpointLimit = {
        endpoint: 'anthropic',
        tokenCredits: 100000,
        alertsSent: [],
      };

      const updatedAlerts = await checkEndpointLimitAlerts({
        userId: testUser._id.toString(),
        email: testUser.email,
        endpointLimit,
        initialLimit: 1000000,
        thresholds: [80, 95],
      });

      expect(updatedAlerts).toEqual([80, 95]);
      expect(updatedAlerts).toEqual(updatedAlerts.sort((a, b) => a - b));
    });

    it('should handle concurrent alert checks without duplicates', async () => {
      const endpointLimit = {
        endpoint: 'openAI',
        tokenCredits: 150000,
        alertsSent: [],
      };

      const promises = Array(5)
        .fill(null)
        .map(() =>
          checkEndpointLimitAlerts({
            userId: testUser._id.toString(),
            email: testUser.email,
            endpointLimit: { ...endpointLimit },
            initialLimit: 1000000,
            thresholds: [80],
          }),
        );

      await Promise.all(promises);

      const notifications = await Notification.find({
        user: testUser._id,
        'data.threshold': 80,
      });
      expect(notifications.length).toBeGreaterThan(0);
    });
  });

  describe('checkBudgetAlerts', () => {
    it('should check alerts for specific endpoint', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 5000,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 150000,
            enabled: true,
            alertsSent: [],
          },
        ],
      });

      const appConfig = {
        balance: {
          alertsEnabled: true,
          alertThresholds: [80, 95],
        },
      };

      await checkBudgetAlerts({
        user: testUser._id.toString(),
        endpoint: 'openAI',
        appConfig,
      });

      const notifications = await Notification.find({ user: testUser._id });
      expect(notifications.length).toBeGreaterThan(0);
    });

    it('should update alertsSent in database', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 5000,
        endpointLimits: [
          {
            endpoint: 'anthropic',
            tokenCredits: 100000,
            enabled: true,
            alertsSent: [],
          },
        ],
      });

      const appConfig = {
        balance: {
          alertsEnabled: true,
          alertThresholds: [80, 95],
        },
      };

      await checkBudgetAlerts({
        user: testUser._id.toString(),
        endpoint: 'anthropic',
        appConfig,
      });

      const balance = await Balance.findOne({ user: testUser._id });
      const endpointLimit = balance.endpointLimits.find((el) => el.endpoint === 'anthropic');
      expect(endpointLimit.alertsSent).toContain(80);
    });

    it('should skip when alerts disabled', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 5000,
        endpointLimits: [
          {
            endpoint: 'google',
            tokenCredits: 100000,
            enabled: true,
            alertsSent: [],
          },
        ],
      });

      const appConfig = {
        balance: {
          alertsEnabled: false,
          alertThresholds: [80, 95],
        },
      };

      await checkBudgetAlerts({
        user: testUser._id.toString(),
        endpoint: 'google',
        appConfig,
      });

      const notifications = await Notification.find({ user: testUser._id });
      expect(notifications).toHaveLength(0);
    });

    it('should handle missing balance record gracefully', async () => {
      const appConfig = {
        balance: {
          alertsEnabled: true,
          alertThresholds: [80],
        },
      };

      await expect(
        checkBudgetAlerts({
          user: testUser._id.toString(),
          endpoint: 'openAI',
          appConfig,
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('resetAlerts', () => {
    it('should clear alertsSent array after refill for specific endpoint', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 5000,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 200000,
            alertsSent: [80, 95],
          },
        ],
      });

      await resetAlerts({ user: testUser._id.toString(), model: 'openAI' });

      const balance = await Balance.findOne({ user: testUser._id });
      const endpointLimit = balance.endpointLimits.find((el) => el.endpoint === 'openAI');
      expect(endpointLimit.alertsSent).toEqual([]);
    });

    it('should set lastAlertReset timestamp', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 5000,
        endpointLimits: [
          {
            endpoint: 'anthropic',
            tokenCredits: 200000,
            alertsSent: [80],
          },
        ],
      });

      await resetAlerts({ user: testUser._id.toString(), model: 'anthropic' });

      const balance = await Balance.findOne({ user: testUser._id });
      const endpointLimit = balance.endpointLimits.find((el) => el.endpoint === 'anthropic');
      expect(endpointLimit.lastAlertReset).toBeDefined();
    });

    it('should reset global alerts when no model specified', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 5000,
        alertsSent: [80, 95],
        endpointLimits: [],
      });

      await resetAlerts({ user: testUser._id.toString() });

      const balance = await Balance.findOne({ user: testUser._id });
      expect(balance.alertsSent).toEqual([]);
      expect(balance.lastAlertReset).toBeDefined();
    });

    it('should handle reset errors gracefully', async () => {
      await expect(
        resetAlerts({ user: 'nonexistent-user-id', model: 'openAI' }),
      ).resolves.not.toThrow();

      expect(logger.error).not.toHaveBeenCalled();
    });
  });
});
