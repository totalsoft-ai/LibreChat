const { SystemRoles } = require('librechat-data-provider');
const { isInternalEmailConfigured, sendInternalEmail } = require('~/server/utils/internalMailer');
const { Feedback, User } = require('~/db/models');
const {
  createFeedback,
  getFeedbackList,
  updateFeedbackStatus,
  respondToFeedback,
  notifyAdminsOfNewFeedback,
  notifyUserOfFeedbackResponse,
  notifyAdminsOfFeedbackResponse,
} = require('./FeedbackService');

jest.mock('~/db/models', () => ({
  Feedback: {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
  User: {
    find: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock('~/server/utils/internalMailer', () => ({
  isInternalEmailConfigured: jest.fn(),
  sendInternalEmail: jest.fn(),
}));

jest.mock('~/config', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('FeedbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('notifyAdminsOfNewFeedback', () => {
    const feedback = { category: 'bug', message: 'Something is broken' };
    const userId = 'user-1';

    it('does nothing when email is not configured', async () => {
      isInternalEmailConfigured.mockReturnValue(false);

      await notifyAdminsOfNewFeedback(feedback, userId);

      expect(User.find).not.toHaveBeenCalled();
      expect(sendInternalEmail).not.toHaveBeenCalled();
    });

    it('sends an email to every admin with an email address', async () => {
      isInternalEmailConfigured.mockReturnValue(true);
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { email: 'admin1@example.com', name: 'Admin One' },
          { email: 'admin2@example.com', username: 'admin2' },
          { email: null, username: 'no-email-admin' },
        ]),
      });
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ name: 'Submitter Name' }),
      });
      sendInternalEmail.mockResolvedValue({});

      await notifyAdminsOfNewFeedback(feedback, userId);

      expect(User.find).toHaveBeenCalledWith({ role: SystemRoles.ADMIN });
      expect(sendInternalEmail).toHaveBeenCalledTimes(2);
      expect(sendInternalEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'admin1@example.com',
          template: 'newFeedback.handlebars',
          payload: expect.objectContaining({
            name: 'Admin One',
            submitterName: 'Submitter Name',
            category: 'bug',
            message: 'Something is broken',
          }),
        }),
      );
      expect(sendInternalEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'admin2@example.com' }),
      );
    });

    it('does not call sendInternalEmail when there are no admins with an email', async () => {
      isInternalEmailConfigured.mockReturnValue(true);
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      await notifyAdminsOfNewFeedback(feedback, userId);

      expect(sendInternalEmail).not.toHaveBeenCalled();
    });

    it('swallows errors instead of throwing', async () => {
      isInternalEmailConfigured.mockReturnValue(true);
      User.find.mockImplementation(() => {
        throw new Error('db error');
      });

      await expect(notifyAdminsOfNewFeedback(feedback, userId)).resolves.toBeUndefined();
    });
  });

  describe('createFeedback', () => {
    it('creates the feedback document and returns it', async () => {
      isInternalEmailConfigured.mockReturnValue(false);
      const created = { _id: 'fb-1', message: 'hello', category: 'other' };
      Feedback.create.mockResolvedValue(created);

      const result = await createFeedback({
        userId: 'user-1',
        message: 'hello',
        category: 'other',
      });

      expect(Feedback.create).toHaveBeenCalledWith({
        user: 'user-1',
        message: 'hello',
        category: 'other',
        images: [],
      });
      expect(result).toBe(created);
    });

    it('does not let a notification failure block the created feedback from being returned', async () => {
      isInternalEmailConfigured.mockReturnValue(true);
      const created = { _id: 'fb-1', message: 'hello', category: 'other' };
      Feedback.create.mockResolvedValue(created);
      User.find.mockImplementation(() => {
        throw new Error('boom');
      });

      const result = await createFeedback({
        userId: 'user-1',
        message: 'hello',
        category: 'other',
      });

      expect(result).toBe(created);
    });

    it('throws when the feedback document fails to save', async () => {
      Feedback.create.mockRejectedValue(new Error('save failed'));

      await expect(
        createFeedback({ userId: 'user-1', message: 'hello', category: 'other' }),
      ).rejects.toThrow('Error creating feedback');
    });
  });

  describe('getFeedbackList', () => {
    it('returns paginated feedback data', async () => {
      const leanMock = jest.fn().mockResolvedValue([{ _id: 'fb-1' }]);
      const sortMock = jest.fn().mockReturnValue({ lean: leanMock });
      const limitMock = jest.fn().mockReturnValue({ sort: sortMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const populateResponseMock = jest.fn().mockReturnValue({ skip: skipMock });
      const populateUserMock = jest.fn().mockReturnValue({ populate: populateResponseMock });
      Feedback.find.mockReturnValue({ populate: populateUserMock });
      Feedback.countDocuments.mockResolvedValue(1);

      const result = await getFeedbackList({ page: 1, pageSize: 20 });

      expect(result).toEqual({
        data: [{ _id: 'fb-1' }],
        pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      });
    });
  });

  describe('notifyUserOfFeedbackResponse', () => {
    const feedback = {
      message: 'Original message',
      response: { text: 'Here is our response' },
      user: { email: 'user@example.com', name: 'Jane User' },
    };

    it('does nothing when email is not configured', async () => {
      isInternalEmailConfigured.mockReturnValue(false);

      await notifyUserOfFeedbackResponse(feedback);

      expect(sendInternalEmail).not.toHaveBeenCalled();
    });

    it('does nothing when the submitter has no email', async () => {
      isInternalEmailConfigured.mockReturnValue(true);

      await notifyUserOfFeedbackResponse({ ...feedback, user: { name: 'No Email' } });

      expect(sendInternalEmail).not.toHaveBeenCalled();
    });

    it('emails the submitter with the response text', async () => {
      isInternalEmailConfigured.mockReturnValue(true);
      sendInternalEmail.mockResolvedValue({});

      await notifyUserOfFeedbackResponse(feedback);

      expect(sendInternalEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          template: 'feedbackResponse.handlebars',
          payload: expect.objectContaining({
            name: 'Jane User',
            originalMessage: 'Original message',
            responseText: 'Here is our response',
          }),
        }),
      );
    });

    it('swallows errors instead of throwing', async () => {
      isInternalEmailConfigured.mockReturnValue(true);
      sendInternalEmail.mockRejectedValue(new Error('smtp down'));

      await expect(notifyUserOfFeedbackResponse(feedback)).resolves.toBeUndefined();
    });
  });

  describe('notifyAdminsOfFeedbackResponse', () => {
    const feedback = {
      category: 'bug',
      message: 'Something is broken',
      response: { text: 'Fixed in the next release' },
      user: { name: 'Submitter Name' },
    };

    it('does nothing when email is not configured', async () => {
      isInternalEmailConfigured.mockReturnValue(false);

      await notifyAdminsOfFeedbackResponse(feedback, 'admin-1');

      expect(User.find).not.toHaveBeenCalled();
      expect(sendInternalEmail).not.toHaveBeenCalled();
    });

    it('emails every other admin, excluding the one who responded', async () => {
      isInternalEmailConfigured.mockReturnValue(true);
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { _id: 'admin-1', email: 'responder@example.com', name: 'Responder Admin' },
          { _id: 'admin-2', email: 'admin2@example.com', name: 'Admin Two' },
          { _id: 'admin-3', email: null, name: 'No Email Admin' },
        ]),
      });
      sendInternalEmail.mockResolvedValue(true);

      await notifyAdminsOfFeedbackResponse(feedback, 'admin-1');

      expect(sendInternalEmail).toHaveBeenCalledTimes(1);
      expect(sendInternalEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'admin2@example.com',
          template: 'feedbackResponded.handlebars',
          payload: expect.objectContaining({
            name: 'Admin Two',
            responderName: 'Responder Admin',
            submitterName: 'Submitter Name',
            category: 'bug',
            message: 'Something is broken',
            responseText: 'Fixed in the next release',
          }),
        }),
      );
    });

    it('does nothing when there are no other admins with an email', async () => {
      isInternalEmailConfigured.mockReturnValue(true);
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest
          .fn()
          .mockResolvedValue([
            { _id: 'admin-1', email: 'responder@example.com', name: 'Responder Admin' },
          ]),
      });

      await notifyAdminsOfFeedbackResponse(feedback, 'admin-1');

      expect(sendInternalEmail).not.toHaveBeenCalled();
    });

    it('swallows errors instead of throwing', async () => {
      isInternalEmailConfigured.mockReturnValue(true);
      User.find.mockImplementation(() => {
        throw new Error('db error');
      });

      await expect(notifyAdminsOfFeedbackResponse(feedback, 'admin-1')).resolves.toBeUndefined();
    });
  });

  describe('respondToFeedback', () => {
    it('returns null when the feedback entry does not exist', async () => {
      Feedback.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await respondToFeedback({ id: 'missing', text: 'hi', adminId: 'admin-1' });

      expect(result).toBeNull();
    });

    it('saves the response, marks the feedback reviewed, and returns it', async () => {
      isInternalEmailConfigured.mockReturnValue(false);
      const updated = {
        _id: 'fb-1',
        message: 'hello',
        response: { text: 'hi there' },
        user: { email: 'user@example.com' },
      };
      Feedback.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(updated),
      });

      const result = await respondToFeedback({ id: 'fb-1', text: 'hi there', adminId: 'admin-1' });

      expect(Feedback.findByIdAndUpdate).toHaveBeenCalledWith(
        'fb-1',
        expect.objectContaining({
          status: 'reviewed',
          response: expect.objectContaining({ text: 'hi there', respondedBy: 'admin-1' }),
        }),
        { new: true },
      );
      expect(result).toBe(updated);
    });

    it('also notifies the other admins that the feedback was responded to', async () => {
      isInternalEmailConfigured.mockReturnValue(true);
      const updated = {
        _id: 'fb-1',
        message: 'hello',
        category: 'bug',
        response: { text: 'hi there' },
        user: { name: 'Submitter Name', email: 'user@example.com' },
      };
      Feedback.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(updated),
      });
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { _id: 'admin-1', email: 'responder@example.com', name: 'Responder Admin' },
          { _id: 'admin-2', email: 'admin2@example.com', name: 'Admin Two' },
        ]),
      });
      sendInternalEmail.mockResolvedValue(true);

      await respondToFeedback({ id: 'fb-1', text: 'hi there', adminId: 'admin-1' });
      await new Promise((resolve) => setImmediate(resolve));

      expect(sendInternalEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'admin2@example.com',
          template: 'feedbackResponded.handlebars',
        }),
      );
      expect(sendInternalEmail).not.toHaveBeenCalledWith(
        expect.objectContaining({ email: 'responder@example.com' }),
      );
    });

    it('does not let a notification failure block the response from being saved', async () => {
      isInternalEmailConfigured.mockReturnValue(true);
      const updated = {
        _id: 'fb-1',
        message: 'hello',
        response: { text: 'hi there' },
        user: { email: 'user@example.com' },
      };
      Feedback.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(updated),
      });
      sendInternalEmail.mockRejectedValue(new Error('smtp down'));

      const result = await respondToFeedback({ id: 'fb-1', text: 'hi there', adminId: 'admin-1' });

      expect(result).toBe(updated);
    });

    it('throws when the update fails', async () => {
      Feedback.findByIdAndUpdate.mockImplementation(() => {
        throw new Error('db error');
      });

      await expect(
        respondToFeedback({ id: 'fb-1', text: 'hi there', adminId: 'admin-1' }),
      ).rejects.toThrow('Error responding to feedback');
    });
  });

  describe('updateFeedbackStatus', () => {
    it('updates and returns the feedback document', async () => {
      Feedback.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'fb-1', status: 'reviewed' }),
      });

      const result = await updateFeedbackStatus({ id: 'fb-1', status: 'reviewed' });

      expect(Feedback.findByIdAndUpdate).toHaveBeenCalledWith(
        'fb-1',
        { status: 'reviewed' },
        { new: true },
      );
      expect(result).toEqual({ _id: 'fb-1', status: 'reviewed' });
    });
  });
});
