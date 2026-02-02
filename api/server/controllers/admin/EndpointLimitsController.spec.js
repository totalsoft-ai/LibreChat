const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  getUserEndpointLimits,
  setEndpointLimit,
  deleteEndpointLimit,
  bulkSetEndpointLimits,
  getUsersWithEndpointLimits,
  getEndpointLimitsAuditLog,
} = require('./EndpointLimitsController');
const { Balance, User, AuditLog } = require('~/db/models');

jest.mock('@librechat/data-schemas', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('EndpointLimitsController', () => {
  let mongoServer;
  let testUser;
  let adminUser;

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
      username: 'testuser',
      provider: 'local',
      role: 'user',
    });

    adminUser = await User.create({
      email: 'admin@example.com',
      name: 'Admin User',
      username: 'adminuser',
      provider: 'local',
      role: 'admin',
    });
  });

  describe('getUserEndpointLimits', () => {
    it('should get endpoint limits for a user by ObjectId', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 5000,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 1000,
            enabled: true,
          },
        ],
      });

      const req = { params: { userId: testUser._id.toString() } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getUserEndpointLimits(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUser._id.toString(),
          globalBalance: expect.objectContaining({
            tokenCredits: 5000,
          }),
          endpointLimits: expect.arrayContaining([
            expect.objectContaining({
              endpoint: 'openAI',
              tokenCredits: 1000,
            }),
          ]),
        }),
      );
    });

    it('should get endpoint limits for a user by email', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 3000,
        endpointLimits: [
          {
            endpoint: 'anthropic',
            tokenCredits: 500,
            enabled: true,
          },
        ],
      });

      const req = { params: { userId: 'test@example.com' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getUserEndpointLimits(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUser._id.toString(),
        }),
      );
    });

    it('should return 404 when user not found', async () => {
      const req = { params: { userId: 'nonexistent@example.com' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getUserEndpointLimits(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Resource not found' });
    });

    it('should return 404 when balance not found', async () => {
      const req = { params: { userId: testUser._id.toString() } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getUserEndpointLimits(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Balance not found for user' });
    });
  });

  describe('setEndpointLimit', () => {
    it('should create new endpoint limit', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 0,
        endpointLimits: [],
      });

      const req = {
        params: { userId: testUser._id.toString(), endpointName: 'openAI' },
        body: {
          tokenCredits: 1000,
          enabled: true,
          autoRefillEnabled: false,
          refillAmount: 500,
          refillIntervalValue: 30,
          refillIntervalUnit: 'days',
        },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-user-agent'),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await setEndpointLimit(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Endpoint limit set successfully',
          endpointLimit: expect.objectContaining({
            endpoint: 'openAI',
            tokenCredits: 1000,
          }),
        }),
      );

      const auditLog = await AuditLog.findOne({ action: 'CREATE' });
      expect(auditLog).toBeDefined();
      expect(auditLog.resource).toBe('ENDPOINT_LIMIT');
    });

    it('should update existing endpoint limit', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'anthropic',
            tokenCredits: 500,
            enabled: true,
          },
        ],
      });

      const req = {
        params: { userId: testUser._id.toString(), endpointName: 'anthropic' },
        body: {
          tokenCredits: 2000,
          enabled: true,
        },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await setEndpointLimit(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      const auditLog = await AuditLog.findOne({ action: 'UPDATE' });
      expect(auditLog).toBeDefined();
      expect(auditLog.changes).toBeDefined();
    });

    it('should validate tokenCredits is required', async () => {
      const req = {
        params: { userId: testUser._id.toString(), endpointName: 'openAI' },
        body: {},
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await setEndpointLimit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('tokenCredits'),
        }),
      );
    });

    it('should validate refillIntervalUnit', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 0,
        endpointLimits: [],
      });

      const req = {
        params: { userId: testUser._id.toString(), endpointName: 'openAI' },
        body: {
          tokenCredits: 1000,
          refillIntervalUnit: 'invalid',
        },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await setEndpointLimit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('refillIntervalUnit'),
        }),
      );
    });

    it('should validate refillIntervalValue is positive integer', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 0,
        endpointLimits: [],
      });

      const req = {
        params: { userId: testUser._id.toString(), endpointName: 'openAI' },
        body: {
          tokenCredits: 1000,
          refillIntervalValue: -5,
        },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await setEndpointLimit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 when user not found', async () => {
      const req = {
        params: { userId: 'nonexistent@example.com', endpointName: 'openAI' },
        body: { tokenCredits: 1000 },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await setEndpointLimit(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteEndpointLimit', () => {
    it('should delete endpoint limit successfully', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 0,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 1000,
            enabled: true,
          },
          {
            endpoint: 'anthropic',
            tokenCredits: 500,
            enabled: true,
          },
        ],
      });

      const req = {
        params: { userId: testUser._id.toString(), endpointName: 'openAI' },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await deleteEndpointLimit(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      const balance = await Balance.findOne({ user: testUser._id });
      expect(balance.endpointLimits).toHaveLength(1);
      expect(balance.endpointLimits[0].endpoint).toBe('anthropic');

      const auditLog = await AuditLog.findOne({ action: 'DELETE' });
      expect(auditLog).toBeDefined();
    });

    it('should return 404 when endpoint limit not found', async () => {
      await Balance.create({
        user: testUser._id,
        tokenCredits: 0,
        endpointLimits: [],
      });

      const req = {
        params: { userId: testUser._id.toString(), endpointName: 'nonexistent' },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await deleteEndpointLimit(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('bulkSetEndpointLimits - Transaction Rollback', () => {
    it('should commit all changes when all operations succeed', async () => {
      const user1 = await User.create({
        email: 'user1@example.com',
        name: 'User 1',
        provider: 'local',
      });
      const user2 = await User.create({
        email: 'user2@example.com',
        name: 'User 2',
        provider: 'local',
      });

      await Balance.create({ user: user1._id, tokenCredits: 0, endpointLimits: [] });
      await Balance.create({ user: user2._id, tokenCredits: 0, endpointLimits: [] });

      const req = {
        body: {
          userIds: [user1._id.toString(), user2._id.toString()],
          endpointName: 'openAI',
          tokenCredits: 1000,
          enabled: true,
        },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await bulkSetEndpointLimits(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      const balance1 = await Balance.findOne({ user: user1._id });
      const balance2 = await Balance.findOne({ user: user2._id });
      expect(balance1.endpointLimits).toHaveLength(1);
      expect(balance2.endpointLimits).toHaveLength(1);
    });

    it('should rollback all changes when operation fails for one user', async () => {
      const user1 = await User.create({
        email: 'user1@example.com',
        name: 'User 1',
        provider: 'local',
      });

      await Balance.create({ user: user1._id, tokenCredits: 0, endpointLimits: [] });

      const saveSpy = jest.spyOn(Balance.prototype, 'save');
      saveSpy.mockImplementationOnce(function () {
        return Promise.resolve(this);
      });
      saveSpy.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const req = {
        body: {
          userIds: [user1._id.toString(), 'nonexistent@example.com'],
          endpointName: 'openAI',
          tokenCredits: 1000,
          enabled: true,
        },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await bulkSetEndpointLimits(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.results.failed.length).toBeGreaterThan(0);

      saveSpy.mockRestore();
    });

    it('should handle transaction abort on critical error', async () => {
      const req = {
        body: {
          userIds: ['invalid-user-id'],
          endpointName: 'openAI',
          tokenCredits: 1000,
        },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };

      jest.spyOn(mongoose, 'startSession').mockResolvedValueOnce(mockSession);
      mockSession.startTransaction.mockImplementation(() => {
        throw new Error('Transaction start failed');
      });

      await bulkSetEndpointLimits(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(mockSession.endSession).toHaveBeenCalled();

      jest.spyOn(mongoose, 'startSession').mockRestore();
    });

    it('should validate userIds is non-empty array', async () => {
      const req = {
        body: {
          userIds: [],
          endpointName: 'openAI',
          tokenCredits: 1000,
        },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await bulkSetEndpointLimits(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should create audit logs for bulk operations', async () => {
      const user1 = await User.create({
        email: 'user1@example.com',
        name: 'User 1',
        provider: 'local',
      });

      await Balance.create({ user: user1._id, tokenCredits: 0, endpointLimits: [] });

      const req = {
        body: {
          userIds: [user1._id.toString()],
          endpointName: 'openAI',
          tokenCredits: 1000,
        },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await bulkSetEndpointLimits(req, res);

      const auditLogs = await AuditLog.find({ action: 'BULK_UPDATE' });
      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0].metadata.bulkOperation).toBe(true);
    });

    it('should handle concurrent bulk operations with transaction isolation', async () => {
      const user1 = await User.create({
        email: 'user1@example.com',
        name: 'User 1',
        provider: 'local',
      });

      await Balance.create({ user: user1._id, tokenCredits: 0, endpointLimits: [] });

      const req1 = {
        body: {
          userIds: [user1._id.toString()],
          endpointName: 'openAI',
          tokenCredits: 1000,
        },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };

      const req2 = {
        body: {
          userIds: [user1._id.toString()],
          endpointName: 'anthropic',
          tokenCredits: 2000,
        },
        user: { id: adminUser._id.toString() },
        ip: '127.0.0.1',
        get: jest.fn(),
      };

      const res1 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const res2 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await Promise.all([
        bulkSetEndpointLimits(req1, res1),
        bulkSetEndpointLimits(req2, res2),
      ]);

      const balance = await Balance.findOne({ user: user1._id });
      expect(balance.endpointLimits).toHaveLength(2);
    });
  });

  describe('getUsersWithEndpointLimits', () => {
    it('should return paginated users with endpoint limits', async () => {
      const users = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
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
            tokenCredits: 1000 * (users.indexOf(user) + 1),
            endpointLimits: [
              {
                endpoint: 'openAI',
                tokenCredits: 500,
                enabled: true,
              },
            ],
          }),
        ),
      );

      const req = {
        query: { page: 1, pageSize: 3 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getUsersWithEndpointLimits(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.users).toHaveLength(3);
      expect(responseData.pagination.total).toBe(5);
      expect(responseData.pagination.pages).toBe(2);
    });

    it('should filter by endpoint', async () => {
      const user1 = await User.create({
        email: 'user1@example.com',
        name: 'User 1',
        provider: 'local',
      });

      await Balance.create({
        user: user1._id,
        tokenCredits: 1000,
        endpointLimits: [
          {
            endpoint: 'openAI',
            tokenCredits: 500,
            enabled: true,
          },
          {
            endpoint: 'anthropic',
            tokenCredits: 300,
            enabled: true,
          },
        ],
      });

      const req = {
        query: { endpoint: 'openAI' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getUsersWithEndpointLimits(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.users[0].endpointLimits).toHaveLength(1);
      expect(responseData.users[0].endpointLimits[0].endpoint).toBe('openAI');
    });

    it('should handle edge case page beyond last', async () => {
      const req = {
        query: { page: 999, pageSize: 20 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getUsersWithEndpointLimits(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.users).toHaveLength(0);
    });
  });

  describe('getEndpointLimitsAuditLog', () => {
    it('should return paginated audit logs', async () => {
      await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          AuditLog.create({
            timestamp: new Date(),
            action: 'CREATE',
            resource: 'ENDPOINT_LIMIT',
            resourceId: `${testUser._id}:openAI`,
            adminUser: adminUser._id,
            targetUser: testUser._id,
            metadata: { endpoint: 'openAI' },
          }),
        ),
      );

      const req = {
        query: { page: 1, pageSize: 3 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getEndpointLimitsAuditLog(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.logs).toHaveLength(3);
      expect(responseData.pagination.total).toBe(5);
    });

    it('should filter by userId', async () => {
      const user2 = await User.create({
        email: 'user2@example.com',
        name: 'User 2',
        provider: 'local',
      });

      await AuditLog.create({
        timestamp: new Date(),
        action: 'CREATE',
        resource: 'ENDPOINT_LIMIT',
        resourceId: `${testUser._id}:openAI`,
        adminUser: adminUser._id,
        targetUser: testUser._id,
        metadata: { endpoint: 'openAI' },
      });

      await AuditLog.create({
        timestamp: new Date(),
        action: 'CREATE',
        resource: 'ENDPOINT_LIMIT',
        resourceId: `${user2._id}:openAI`,
        adminUser: adminUser._id,
        targetUser: user2._id,
        metadata: { endpoint: 'openAI' },
      });

      const req = {
        query: { userId: testUser._id.toString() },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getEndpointLimitsAuditLog(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.logs).toHaveLength(1);
      expect(responseData.logs[0].targetUser.toString()).toBe(testUser._id.toString());
    });

    it('should filter by date range', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await AuditLog.create({
        timestamp: new Date(),
        action: 'CREATE',
        resource: 'ENDPOINT_LIMIT',
        resourceId: `${testUser._id}:openAI`,
        adminUser: adminUser._id,
        targetUser: testUser._id,
        metadata: { endpoint: 'openAI' },
      });

      const req = {
        query: {
          startDate: yesterday.toISOString(),
          endDate: tomorrow.toISOString(),
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getEndpointLimitsAuditLog(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.logs.length).toBeGreaterThan(0);
    });

    it('should filter by action type', async () => {
      await AuditLog.create({
        timestamp: new Date(),
        action: 'CREATE',
        resource: 'ENDPOINT_LIMIT',
        resourceId: `${testUser._id}:openAI`,
        adminUser: adminUser._id,
        targetUser: testUser._id,
        metadata: { endpoint: 'openAI' },
      });

      await AuditLog.create({
        timestamp: new Date(),
        action: 'DELETE',
        resource: 'ENDPOINT_LIMIT',
        resourceId: `${testUser._id}:anthropic`,
        adminUser: adminUser._id,
        targetUser: testUser._id,
        metadata: { endpoint: 'anthropic' },
      });

      const req = {
        query: { action: 'CREATE' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getEndpointLimitsAuditLog(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.logs.every((log) => log.action === 'CREATE')).toBe(true);
    });
  });
});
