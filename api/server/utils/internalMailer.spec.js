const nodemailer = require('nodemailer');
const { readFileAsString } = require('@librechat/api');
const { isInternalEmailConfigured, sendInternalEmail } = require('./internalMailer');

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

jest.mock('@librechat/api', () => ({
  isEnabled: jest.fn(() => false),
  readFileAsString: jest.fn(),
}));

jest.mock('@librechat/data-schemas', () => ({
  logger: {
    error: jest.fn(),
  },
}));

const ENV_KEYS = [
  'STATUS_ALERT_EMAIL_HOST',
  'STATUS_ALERT_EMAIL_PORT',
  'STATUS_ALERT_EMAIL_USERNAME',
  'STATUS_ALERT_EMAIL_PASSWORD',
  'STATUS_ALERT_EMAIL_FROM',
  'STATUS_ALERT_EMAIL_FROM_NAME',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USERNAME',
  'EMAIL_PASSWORD',
  'EMAIL_FROM',
  'EMAIL_FROM_NAME',
  'APP_TITLE',
];

describe('internalMailer', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('isInternalEmailConfigured', () => {
    it('returns false when nothing is configured', () => {
      expect(isInternalEmailConfigured()).toBe(false);
    });

    it('returns true when STATUS_ALERT_EMAIL_HOST/FROM are set', () => {
      process.env.STATUS_ALERT_EMAIL_HOST = 'mail.internal';
      process.env.STATUS_ALERT_EMAIL_FROM = 'alerts@internal';

      expect(isInternalEmailConfigured()).toBe(true);
    });

    it('falls back to the shared EMAIL_HOST/FROM when STATUS_ALERT_EMAIL_* is unset', () => {
      process.env.EMAIL_HOST = 'smtp.shared';
      process.env.EMAIL_FROM = 'noreply@shared';

      expect(isInternalEmailConfigured()).toBe(true);
    });

    it('is false when only one of host/from is set', () => {
      process.env.EMAIL_HOST = 'smtp.shared';

      expect(isInternalEmailConfigured()).toBe(false);
    });
  });

  describe('sendInternalEmail', () => {
    it('returns false without creating a transport when not configured', async () => {
      const result = await sendInternalEmail({
        email: 'user@example.com',
        subject: 'Hi',
        payload: { name: 'User' },
        template: 'whatever.handlebars',
      });

      expect(result).toBe(false);
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
    });

    it('prefers STATUS_ALERT_EMAIL_* over EMAIL_* and sends through the built transport', async () => {
      process.env.STATUS_ALERT_EMAIL_HOST = 'mail.internal';
      process.env.STATUS_ALERT_EMAIL_PORT = '587';
      process.env.STATUS_ALERT_EMAIL_USERNAME = 'alerts';
      process.env.STATUS_ALERT_EMAIL_PASSWORD = 'secret';
      process.env.STATUS_ALERT_EMAIL_FROM = 'alerts@internal';
      process.env.STATUS_ALERT_EMAIL_FROM_NAME = 'Internal Alerts';
      process.env.EMAIL_HOST = 'smtp.shared';
      process.env.EMAIL_FROM = 'noreply@shared';

      readFileAsString.mockResolvedValue({ content: 'Hello {{name}}' });
      const sendMail = jest.fn().mockResolvedValue({});
      nodemailer.createTransport.mockReturnValue({ sendMail });

      const result = await sendInternalEmail({
        email: 'user@example.com',
        subject: 'New feedback',
        payload: { name: 'User' },
        template: 'newFeedback.handlebars',
      });

      expect(result).toBe(true);
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'mail.internal',
          port: 587,
          auth: { user: 'alerts', pass: 'secret' },
        }),
      );
      expect(sendMail).toHaveBeenCalledWith({
        from: '"Internal Alerts" <alerts@internal>',
        to: '"User" <user@example.com>',
        subject: 'New feedback',
        html: 'Hello User',
      });
    });

    it('returns false and logs when sending fails', async () => {
      process.env.EMAIL_HOST = 'smtp.shared';
      process.env.EMAIL_FROM = 'noreply@shared';
      readFileAsString.mockResolvedValue({ content: 'Hello {{name}}' });
      const sendMail = jest.fn().mockRejectedValue(new Error('smtp down'));
      nodemailer.createTransport.mockReturnValue({ sendMail });

      const result = await sendInternalEmail({
        email: 'user@example.com',
        subject: 'New feedback',
        payload: { name: 'User' },
        template: 'newFeedback.handlebars',
      });

      expect(result).toBe(false);
    });

    it('omits auth when no username/password is configured', async () => {
      process.env.EMAIL_HOST = 'smtp.shared';
      process.env.EMAIL_FROM = 'noreply@shared';
      readFileAsString.mockResolvedValue({ content: 'Hello {{name}}' });
      const sendMail = jest.fn().mockResolvedValue({});
      nodemailer.createTransport.mockReturnValue({ sendMail });

      await sendInternalEmail({
        email: 'user@example.com',
        subject: 'New feedback',
        payload: { name: 'User' },
        template: 'newFeedback.handlebars',
      });

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ auth: undefined }),
      );
    });
  });
});
