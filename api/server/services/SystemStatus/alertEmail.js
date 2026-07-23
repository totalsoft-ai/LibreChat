const path = require('path');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const { logger } = require('@librechat/data-schemas');
const { isEnabled, readFileAsString } = require('@librechat/api');

const TEMPLATE_PATH = path.join(__dirname, '..', '..', 'utils', 'emails', 'statusAlert.handlebars');

/**
 * Dedicated SMTP override for status alerts, falling back to the shared
 * EMAIL_* settings. EMAIL_* is often wired centrally for the whole app (e.g.
 * a shared relay an individual deployment can't change), and that relay may
 * not deliver reliably to every internal inbox — set STATUS_ALERT_EMAIL_*
 * only if alerts need a different relay than other outgoing email.
 */
function alertEmailConfig() {
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
      'LibreChat',
  };
}

function isAlertEmailConfigured() {
  const { host, from } = alertEmailConfig();
  return Boolean(host && from);
}

function textBody({ label, startedAt, duration, reason, statusUrl, appName }) {
  return [
    `${label} is down`,
    '',
    `Down since: ${startedAt} (${duration} and counting)`,
    '',
    `Reason: ${reason}`,
    '',
    `System status: ${statusUrl}`,
    '',
    '---',
    `This is an automated alert from ${appName}.`,
  ].join('\n');
}

let compiledTemplate = null;
async function renderHtml(payload) {
  if (!compiledTemplate) {
    const { content: source } = await readFileAsString(TEMPLATE_PATH);
    compiledTemplate = handlebars.compile(source);
  }
  return compiledTemplate(payload);
}

/** Sends one email addressed to every recipient (matches ticket-classifier: a single message, not one per recipient). */
async function sendStatusAlertEmail(recipients, payload) {
  const config = alertEmailConfig();
  if (!config.host || !config.from || recipients.length === 0) {
    return false;
  }

  let html;
  try {
    html = await renderHtml(payload);
  } catch (error) {
    logger.error('[SystemStatus] Failed to render status alert template:', error);
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: Number(config.port),
    secure: process.env.EMAIL_ENCRYPTION === 'tls',
    requireTls: process.env.EMAIL_ENCRYPTION === 'starttls',
    tls: { rejectUnauthorized: !isEnabled(process.env.EMAIL_ALLOW_SELFSIGNED) },
    auth: config.username && config.password ? { user: config.username, pass: config.password } : undefined,
  });

  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.from}>`,
      to: recipients.join(', '),
      subject: payload.subject,
      text: textBody(payload),
      html,
    });
    return true;
  } catch (error) {
    logger.error('[SystemStatus] Failed to send status alert email:', error);
    return false;
  }
}

module.exports = { isAlertEmailConfigured, sendStatusAlertEmail };
