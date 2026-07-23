const { logger } = require('@librechat/data-schemas');
const ServiceAlert = require('~/models/ServiceAlert');
const { getRecentIncidents } = require('./healthChecks');
const { getEmailsByRealmRole } = require('./keycloakAdmin');
const { isAlertEmailConfigured, sendStatusAlertEmail } = require('./alertEmail');
const { ageText, alertKey, incidentsNeedingAlert } = require('./statusLogic');

// Ported from ticket-classifier's system_status_alerts.py: any component
// continuously 'down' for at least STATUS_ALERT_AFTER_MINUTES gets one email
// to users holding the STATUS_ALERT_ROLE Keycloak realm role — a dedicated
// role, kept separate from LibreChat's own app-level ADMIN role, so who gets
// paged for infra incidents doesn't have to match who administers the app.
// Exactly-once semantics come from ServiceAlert's unique index — the sender
// claims the incident key first, so restarts and multiple backend replicas
// cannot double-send. A failed send releases the claim and the next check
// cycle retries.
const INCIDENT_WINDOW_DAYS = 7;
const WINDOW_EDGE_MARGIN_MS = 15 * 60 * 1000;
const DEFAULT_STATUS_ALERT_ROLE = 'system-status-alerts';

function getAlertThresholdMinutes() {
  const parsed = parseInt(process.env.STATUS_ALERT_AFTER_MINUTES, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function getAlertedKeys(windowStart) {
  const rows = await ServiceAlert.find({ startedAt: { $gte: windowStart } })
    .select('component startedAt')
    .lean();
  return new Set(rows.map((row) => alertKey(row.component, row.startedAt)));
}

async function claimAlert(incident, recipientsCount) {
  try {
    await ServiceAlert.create({
      component: incident.component,
      startedAt: incident.startedAt,
      recipientsCount,
    });
    return true;
  } catch (error) {
    if (error?.code === 11000) {
      return false; // another cycle/replica already claimed this incident
    }
    throw error;
  }
}

async function releaseAlert(incident) {
  try {
    await ServiceAlert.deleteOne({ component: incident.component, startedAt: incident.startedAt });
  } catch (error) {
    logger.error('[SystemStatus] Could not release failed alert claim:', error);
  }
}

async function sendIncidentAlert(recipients, incident, now) {
  const duration = ageText(now - new Date(incident.startedAt).getTime());
  const statusUrl = `${(process.env.DOMAIN_CLIENT || '').replace(/\/$/, '')}/events`;
  const payload = {
    appName: process.env.APP_TITLE || 'LibreChat',
    label: incident.label,
    reason: incident.reason || 'No failure reason recorded.',
    duration,
    startedAt: `${new Date(incident.startedAt).toUTCString()}`,
    statusUrl,
    year: new Date().getFullYear(),
    subject: `[System Status] ${incident.label} has been DOWN for ${duration}`,
  };
  return sendStatusAlertEmail(recipients, payload);
}

/** Sends due incident alerts; returns how many incidents got an email out. */
async function checkAndSendAlerts() {
  const thresholdMinutes = getAlertThresholdMinutes();
  if (thresholdMinutes <= 0) {
    return 0;
  }
  if (!isAlertEmailConfigured()) {
    logger.debug('[SystemStatus] Status alerts skipped: email not configured');
    return 0;
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - INCIDENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const minStartedAt = new Date(windowStart.getTime() + WINDOW_EDGE_MARGIN_MS);

  const incidents = await getRecentIncidents(INCIDENT_WINDOW_DAYS);
  const alertedKeys = await getAlertedKeys(windowStart);
  const due = incidentsNeedingAlert(incidents, alertedKeys, thresholdMinutes, now, minStartedAt);
  if (due.length === 0) {
    return 0;
  }

  const roleName = process.env.STATUS_ALERT_ROLE || DEFAULT_STATUS_ALERT_ROLE;
  const recipients = await getEmailsByRealmRole(roleName);
  if (recipients.length === 0) {
    logger.warn(
      `[SystemStatus] Alert due for ${due.map((i) => i.component).join(', ')} but no user with role '${roleName}' has a valid email`,
    );
    return 0;
  }

  let sent = 0;
  for (const incident of due) {
    const claimed = await claimAlert(incident, recipients.length);
    if (!claimed) {
      continue;
    }
    const success = await sendIncidentAlert(recipients, incident, now);
    if (success) {
      sent += 1;
      logger.info(
        `[SystemStatus] Status alert sent for ${incident.component} (down since ${new Date(incident.startedAt).toISOString()}) to ${recipients.length} recipient(s)`,
      );
    } else {
      await releaseAlert(incident);
    }
  }
  return sent;
}

module.exports = { checkAndSendAlerts };
