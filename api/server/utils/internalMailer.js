const path = require('path');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const { logger } = require('@librechat/data-schemas');
const { isEnabled, readFileAsString } = require('@librechat/api');

/**
 * Dedicated SMTP relay for internally-generated notifications (feedback alerts,
 * system status alerts), falling back to the shared EMAIL_* settings. EMAIL_* is
 * often wired centrally for the whole app (e.g. a shared relay an individual
 * deployment can't change), and that relay may not deliver reliably to every
 * internal inbox - set STATUS_ALERT_EMAIL_* to use a different relay for these.
 */
function getInternalEmailConfig() {
  return {
    host: process.env.STATUS_ALERT_EMAIL_HOST || process.env.EMAIL_HOST,
    port: process.env.STATUS_ALERT_EMAIL_PORT || process.env.EMAIL_PORT || 25,
    username: process.env.STATUS_ALERT_EMAIL_USERNAME || process.env.EMAIL_USERNAME,
    password: process.env.STATUS_ALERT_EMAIL_PASSWORD || process.env.EMAIL_PASSWORD,
    from: process.env.STATUS_ALERT_EMAIL_FROM || process.env.EMAIL_FROM,
    fromName:
      process.env.STATUS_ALERT_EMAIL_FROM_NAME ||
      process.env.EMAIL_FROM_NAME ||
      process.env.APP_TITLE ||
      'Tessa',
  };
}

function isInternalEmailConfigured() {
  const { host, from } = getInternalEmailConfig();
  return Boolean(host && from);
}

const templateCache = new Map();

/** Compiles and caches a Handlebars template from api/server/utils/emails/. */
async function renderTemplate(templateName, payload) {
  if (!templateCache.has(templateName)) {
    const templatePath = path.join(__dirname, 'emails', templateName);
    const { content: source } = await readFileAsString(templatePath);
    templateCache.set(templateName, handlebars.compile(source));
  }
  return templateCache.get(templateName)(payload);
}

/**
 * Sends an email through the dedicated internal relay (STATUS_ALERT_EMAIL_*, falling
 * back to EMAIL_*). Mirrors the shape of `~/server/utils/sendEmail`, but never throws -
 * failures are logged and this resolves to `false`, since these are best-effort
 * notifications that must never block the action that triggered them.
 * @param {Object} params
 * @param {string} params.email - Recipient address.
 * @param {string} params.subject
 * @param {Record<string, string>} params.payload - Template data; `payload.name` is used as the display name.
 * @param {string} params.template - Filename under api/server/utils/emails/.
 * @returns {Promise<boolean>} Whether the email was sent.
 */
async function sendInternalEmail({ email, subject, payload, template }) {
  const config = getInternalEmailConfig();
  if (!config.host || !config.from) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: Number(config.port),
    secure: process.env.EMAIL_ENCRYPTION === 'tls',
    requireTls: process.env.EMAIL_ENCRYPTION === 'starttls',
    tls: { rejectUnauthorized: !isEnabled(process.env.EMAIL_ALLOW_SELFSIGNED) },
    auth:
      config.username && config.password
        ? { user: config.username, pass: config.password }
        : undefined,
  });

  try {
    const html = await renderTemplate(template, payload);
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.from}>`,
      to: `"${payload.name}" <${email}>`,
      subject,
      html,
    });
    return true;
  } catch (error) {
    logger.error('[internalMailer] Failed to send email:', error);
    return false;
  }
}

module.exports = { isInternalEmailConfigured, sendInternalEmail };
