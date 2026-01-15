const {
  getUserWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  updateMemberRole,
  removeMember,
  getWorkspaceStats,
  leaveWorkspace,
} = require('../../../server/controllers/workspaces');
const Workspace = require('../../../models/Workspace');
const { Conversation, Agent, Prompt, File } = require('../../../db/models');

// Mock dependencies
jest.mock('../../../models/Workspace');
jest.mock('../../../db/models', () => ({
  Conversation: {
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
  },
  Agent: {
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
  },
  Prompt: {
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
  },
  File: {
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
  },
  Message: {
    deleteMany: jest.fn(),
  },
  Activity: {
    deleteMany: jest.fn(),
  },
}));

jest.mock('@librechat/data-schemas', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Workspace Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'user123' },
      params: {},
      body: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getUserWorkspaces', () => {
    it('should return all workspaces for the user', async () => {
      const mockWorkspaces = [
        { workspaceId: 'ws1', name: 'Team A' },
        { workspaceId: 'ws2', name: 'Team B' },
      ];
      Workspace.findUserWorkspaces = jest.fn().mockResolvedValue(mockWorkspaces);

      await getUserWorkspaces(req, res);

      expect(Workspace.findUserWorkspaces).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith({
        workspaces: mockWorkspaces,
        count: 2,
      });
    });

    it('should handle errors properly', async () => {
      Workspace.findUserWorkspaces = jest.fn().mockRejectedValue(new Error('Database error'));

      await getUserWorkspaces(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error retrieving workspaces',
        }),
      );
    });
  });

  describe('getWorkspace', () => {
    it('should return workspace by ID', async () => {
      const mockWorkspace = {
        workspaceId: 'ws1',
        name: 'Team A',
        isMember: jest.fn().mockReturnValue(true),
      };
      req.params.identifier = 'ws1';

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      Workspace.findOne = jest.fn().mockReturnValue(mockQuery);
      mockQuery.populate.mockResolvedValue(mockWorkspace);

      await getWorkspace(req, res);

      expect(Workspace.findOne).toHaveBeenCalledWith({
        $or: [{ workspaceId: 'ws1' }, { slug: 'ws1' }],
        isActive: true,
        isArchived: false,
      });
      expect(mockWorkspace.isMember).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith({ workspace: mockWorkspace });
    });

    it('should return 404 if workspace not found', async () => {
      req.params.identifier = 'nonexistent';

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      Workspace.findOne = jest.fn().mockReturnValue(mockQuery);
      mockQuery.populate.mockResolvedValue(null);

      await getWorkspace(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Workspace not found' });
    });

    it('should return 403 if user is not a member', async () => {
      const mockWorkspace = {
        workspaceId: 'ws1',
        isMember: jest.fn().mockReturnValue(false),
      };
      req.params.identifier = 'ws1';

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
      };
      Workspace.findOne = jest.fn().mockReturnValue(mockQuery);
      mockQuery.populate.mockResolvedValue(mockWorkspace);

      await getWorkspace(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied to this workspace' });
    });
  });

  describe('createWorkspace', () => {
    it('should create a new workspace successfully', async () => {
      req.body = {
        name: 'New Team',
        description: 'Team description',
        color: '#ff0000',
      };

      const mockWorkspace = {
        workspaceId: 'ws-new',
        name: 'New Team',
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      };

      Workspace.generateSlug = jest.fn().mockResolvedValue('new-team');
      Workspace.mockImplementation(() => mockWorkspace);

      await createWorkspace(req, res);

      expect(Workspace.generateSlug).toHaveBeenCalledWith('New Team');
      expect(mockWorkspace.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Workspace created successfully',
          workspace: mockWorkspace,
        }),
      );
    });

    it('should return 400 if name is missing', async () => {
      req.body = { name: '' };

      await createWorkspace(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Workspace name is required' });
    });

    it('should return 400 if name is too long', async () => {
      req.body = { name: 'a'.repeat(101) };

      await createWorkspace(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Workspace name must be less than 100 characters',
      });
    });
  });

  describe('updateWorkspace', () => {
    it('should update workspace successfully', async () => {
      req.params.workspaceId = 'ws1';
      req.body = { name: 'Updated Name', color: '#00ff00' };

      const mockWorkspace = {
        name: 'Old Name',
        hasPermission: jest.fn().mockReturnValue(true),
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);
      Workspace.generateSlug = jest.fn().mockResolvedValue('updated-name');

      await updateWorkspace(req, res);

      expect(mockWorkspace.hasPermission).toHaveBeenCalledWith('user123', 'admin');
      expect(mockWorkspace.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Workspace updated successfully',
        }),
      );
    });

    it('should return 403 if user lacks permission', async () => {
      req.params.workspaceId = 'ws1';
      req.body = { name: 'Updated Name' };

      const mockWorkspace = {
        hasPermission: jest.fn().mockReturnValue(false),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await updateWorkspace(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'You do not have permission to update this workspace',
      });
    });

    it('should return 400 if name is empty', async () => {
      req.params.workspaceId = 'ws1';
      req.body = { name: '   ' };

      const mockWorkspace = {
        hasPermission: jest.fn().mockReturnValue(true),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await updateWorkspace(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Workspace name cannot be empty' });
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete workspace and clean up resources', async () => {
      req.params.workspaceId = 'ws1';

      const mockWorkspace = {
        _id: 'mongo-id-1',
        workspaceId: 'ws1',
        hasPermission: jest.fn().mockReturnValue(true),
        save: jest.fn().mockResolvedValue(true),
        isArchived: false,
        isActive: true,
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);
      Conversation.find.mockResolvedValue([{ conversationId: 'c1' }, { conversationId: 'c2' }]);
      Conversation.deleteMany.mockResolvedValue({ deletedCount: 2 });
      Message.deleteMany.mockResolvedValue({ deletedCount: 8 });
      Agent.updateMany.mockResolvedValue({ modifiedCount: 3 });
      Prompt.updateMany.mockResolvedValue({ modifiedCount: 2 });
      File.updateMany.mockResolvedValue({ modifiedCount: 10 });
      Activity.deleteMany.mockResolvedValue({ deletedCount: 4 });
      Workspace.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

      await deleteWorkspace(req, res);

      expect(mockWorkspace.hasPermission).toHaveBeenCalledWith('user123', 'owner');
      expect(Workspace.deleteOne).toHaveBeenCalledWith({ _id: 'mongo-id-1' });

      // Check resource cleanup
      expect(Conversation.deleteMany).toHaveBeenCalledWith({ workspace: { $in: ['ws1', 'mongo-id-1'] } });
      expect(Agent.updateMany).toHaveBeenCalledWith(
        { workspace: { $in: ['ws1', 'mongo-id-1'] } },
        { $set: { workspace: null } },
      );
      expect(Prompt.updateMany).toHaveBeenCalledWith(
        { workspace: { $in: ['ws1', 'mongo-id-1'] } },
        { $set: { workspace: null } },
      );
      expect(File.updateMany).toHaveBeenCalledWith(
        { workspace: { $in: ['ws1', 'mongo-id-1'] } },
        { $set: { workspace: null } },
      );

      expect(Message.deleteMany).toHaveBeenCalledWith({ conversationId: { $in: ['c1', 'c2'] } });
      expect(Activity.deleteMany).toHaveBeenCalledWith({ workspace: 'mongo-id-1' });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Workspace deleted successfully',
          workspaceId: 'ws1',
        }),
      );
    });

    it('should return 403 if user is not owner', async () => {
      req.params.workspaceId = 'ws1';

      const mockWorkspace = {
        hasPermission: jest.fn().mockReturnValue(false),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await deleteWorkspace(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Only workspace owners can delete the workspace',
      });
    });

    it('should handle cleanup errors gracefully', async () => {
      req.params.workspaceId = 'ws1';

      const mockWorkspace = {
        _id: 'mongo-id-1',
        workspaceId: 'ws1',
        hasPermission: jest.fn().mockReturnValue(true),
        save: jest.fn().mockResolvedValue(true),
        isArchived: false,
        isActive: true,
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);
      Conversation.deleteMany.mockRejectedValue(new Error('DB error'));
      Workspace.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

      await deleteWorkspace(req, res);

      // Should still mark workspace as archived even if cleanup fails
      expect(Workspace.deleteOne).toHaveBeenCalledWith({ _id: 'mongo-id-1' });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Workspace deleted successfully',
        }),
      );
    });
  });

  describe('addMember', () => {
    it('should add member to workspace successfully', async () => {
      req.params.workspaceId = 'ws1';
      req.body = { memberUserId: 'user456', role: 'member' };

      const mockWorkspace = {
        hasPermission: jest.fn().mockReturnValue(true),
        addMember: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await addMember(req, res);

      expect(mockWorkspace.hasPermission).toHaveBeenCalledWith('user123', 'admin');
      expect(mockWorkspace.addMember).toHaveBeenCalledWith('user456', 'member', 'user123');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Member added successfully',
        }),
      );
    });

    it('should return 400 if memberUserId is missing', async () => {
      req.params.workspaceId = 'ws1';
      req.body = {};

      await addMember(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Member user ID is required' });
    });

    it('should use default role if invalid', async () => {
      req.params.workspaceId = 'ws1';
      req.body = { memberUserId: 'user456', role: 'invalid' };

      const mockWorkspace = {
        hasPermission: jest.fn().mockReturnValue(true),
        addMember: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await addMember(req, res);

      // Should default to 'member' role
      expect(mockWorkspace.addMember).toHaveBeenCalledWith('user456', 'member', 'user123');
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role successfully', async () => {
      req.params = { workspaceId: 'ws1', memberUserId: 'user456' };
      req.body = { role: 'admin' };

      const mockWorkspace = {
        hasPermission: jest.fn().mockReturnValue(true),
        updateMemberRole: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis(),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await updateMemberRole(req, res);

      expect(mockWorkspace.hasPermission).toHaveBeenCalledWith('user123', 'admin');
      expect(mockWorkspace.updateMemberRole).toHaveBeenCalledWith('user456', 'admin');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Member role updated successfully',
        }),
      );
    });

    it('should require owner permission to assign owner role', async () => {
      req.params = { workspaceId: 'ws1', memberUserId: 'user456' };
      req.body = { role: 'owner' };

      const mockWorkspace = {
        hasPermission: jest.fn().mockReturnValue(false),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await updateMemberRole(req, res);

      expect(mockWorkspace.hasPermission).toHaveBeenCalledWith('user123', 'owner');
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 400 for invalid role', async () => {
      req.params = { workspaceId: 'ws1', memberUserId: 'user456' };
      req.body = { role: 'superuser' };

      const mockWorkspace = {};
      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await updateMemberRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid role' });
    });
  });

  describe('removeMember', () => {
    it('should allow admin to remove member', async () => {
      req.params = { workspaceId: 'ws1', memberUserId: 'user456' };

      const mockWorkspace = {
        hasPermission: jest.fn().mockReturnValue(true),
        removeMember: jest.fn().mockResolvedValue(true),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await removeMember(req, res);

      expect(mockWorkspace.hasPermission).toHaveBeenCalledWith('user123', 'admin');
      expect(mockWorkspace.removeMember).toHaveBeenCalledWith('user456');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Member removed successfully',
        }),
      );
    });

    it('should allow user to remove themselves', async () => {
      req.params = { workspaceId: 'ws1', memberUserId: 'user123' };

      const mockWorkspace = {
        hasPermission: jest.fn().mockReturnValue(false),
        removeMember: jest.fn().mockResolvedValue(true),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await removeMember(req, res);

      expect(mockWorkspace.removeMember).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Member removed successfully',
        }),
      );
    });

    it('should return 403 if not admin and not self', async () => {
      req.params = { workspaceId: 'ws1', memberUserId: 'user789' };

      const mockWorkspace = {
        hasPermission: jest.fn().mockReturnValue(false),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await removeMember(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'You do not have permission to remove this member',
      });
    });
  });

  describe('getWorkspaceStats', () => {
    it('should return workspace statistics', async () => {
      req.params.workspaceId = 'ws1';

      const mockWorkspace = {
        _id: 'mongo-id-1',
        isMember: jest.fn().mockReturnValue(true),
        memberCount: 5,
        stats: {
          tokenUsage: 10000,
          lastActivityAt: new Date('2025-01-01'),
        },
      };

      const mockConversations = [{ conversationId: 'c1', title: 'Chat 1', updatedAt: new Date() }];

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);
      Conversation.countDocuments.mockResolvedValue(12);
      Agent.countDocuments.mockResolvedValue(5);
      Prompt.countDocuments.mockResolvedValue(8);
      File.countDocuments.mockResolvedValue(20);

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockConversations),
      };
      Conversation.find.mockReturnValue(mockQuery);

      await getWorkspaceStats(req, res);

      expect(mockWorkspace.isMember).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith({
        stats: expect.objectContaining({
          memberCount: 5,
          conversationCount: 12,
          agentCount: 5,
          promptCount: 8,
          fileCount: 20,
          tokenUsage: 10000,
          recentConversations: mockConversations,
        }),
      });
    });

    it('should return 403 if user is not member', async () => {
      req.params.workspaceId = 'ws1';

      const mockWorkspace = {
        isMember: jest.fn().mockReturnValue(false),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await getWorkspaceStats(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied to this workspace' });
    });
  });

  describe('leaveWorkspace', () => {
    it('should allow member to leave workspace', async () => {
      req.params.workspaceId = 'ws1';

      const mockWorkspace = {
        isMember: jest.fn().mockReturnValue(true),
        getMemberRole: jest.fn().mockReturnValue('member'),
        removeMember: jest.fn().mockResolvedValue(true),
        members: [
          { user: 'user123', role: 'member' },
          { user: 'user456', role: 'owner' },
        ],
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await leaveWorkspace(req, res);

      expect(mockWorkspace.removeMember).toHaveBeenCalledWith('user123');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Successfully left workspace',
        }),
      );
    });

    it('should prevent last owner from leaving', async () => {
      req.params.workspaceId = 'ws1';

      const mockWorkspace = {
        isMember: jest.fn().mockReturnValue(true),
        getMemberRole: jest.fn().mockReturnValue('owner'),
        members: [{ user: 'user123', role: 'owner' }],
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await leaveWorkspace(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          'Cannot leave workspace as the last owner. Transfer ownership or delete the workspace.',
      });
    });

    it('should return 400 if user is not member', async () => {
      req.params.workspaceId = 'ws1';

      const mockWorkspace = {
        isMember: jest.fn().mockReturnValue(false),
      };

      Workspace.findOne = jest.fn().mockResolvedValue(mockWorkspace);

      await leaveWorkspace(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'You are not a member of this workspace' });
    });
  });
});
