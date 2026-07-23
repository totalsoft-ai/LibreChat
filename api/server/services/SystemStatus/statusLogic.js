/**
 * Pure status computation logic — no I/O, fully unit-testable.
 * Ported from ticket-classifier's system_status_logic.py.
 */

const SEVERITY = { ok: 0, unknown: 1, degraded: 2, down: 3 };

/**
 * Worst status across components, ignoring `unknown` unless everything is
 * unknown — disabled/unconfigured services should not grey out the banner.
 */
function overallStatus(statuses) {
  const known = statuses.filter((s) => s !== 'unknown');
  if (known.length === 0) {
    return 'unknown';
  }
  return known.reduce((worst, s) => (SEVERITY[s] > SEVERITY[worst] ? s : worst), 'ok');
}

/**
 * Number of `down` checks in a day required to paint it red: roughly one
 * cumulative hour of downtime at the configured check interval.
 */
function redThreshold(intervalMinutes) {
  const interval = intervalMinutes > 0 ? intervalMinutes : 5;
  return Math.ceil(60 / interval);
}

/**
 * Day-bucket status for uptime bars. A short blip renders amber (degraded);
 * only sustained downtime turns the day red.
 */
function bucketDayStatus(counts, threshold) {
  const okCount = counts.okCount || 0;
  const degradedCount = counts.degradedCount || 0;
  const downCount = counts.downCount || 0;
  const unknownCount = counts.unknownCount || 0;
  const total = okCount + degradedCount + downCount + unknownCount;

  if (total === 0 || total === unknownCount) {
    return 'empty';
  }
  if (downCount >= threshold) {
    return 'down';
  }
  if (downCount > 0 || degradedCount > 0) {
    return 'degraded';
  }
  return 'ok';
}

/**
 * Groups per-check rows into incidents, per component.
 *
 * Anti-flapping rules:
 * - consecutive non-ok checks form one incident;
 * - an incident closes only after 2 consecutive `ok` checks (a lone ok
 *   between failures is swallowed back into the incident);
 * - `unknown` is neutral: it neither opens, extends, nor closes incidents;
 * - severity escalates within an incident (degraded -> down), never de-escalates.
 *
 * @param {Array<{component: string, status: string, reason?: string, checkedAt: Date|string}>} rows
 *   Must be sorted by checkedAt ascending (any component order).
 * @returns {Array<{component: string, status: string, reason: string, startedAt: Date, endedAt: Date|null}>}
 *   Newest incidents first.
 */
function groupIncidents(rows) {
  const byComponent = new Map();
  for (const row of rows) {
    if (!byComponent.has(row.component)) {
      byComponent.set(row.component, []);
    }
    byComponent.get(row.component).push(row);
  }

  const incidents = [];
  for (const [component, checks] of byComponent) {
    let open = null;
    let pendingEndAt = null;

    for (const check of checks) {
      const checkedAt = new Date(check.checkedAt);
      if (check.status === 'unknown') {
        continue;
      }
      if (check.status === 'ok') {
        if (open == null) {
          continue;
        }
        if (pendingEndAt == null) {
          pendingEndAt = checkedAt;
        } else {
          open.endedAt = pendingEndAt;
          incidents.push(open);
          open = null;
          pendingEndAt = null;
        }
        continue;
      }
      // degraded or down
      pendingEndAt = null;
      if (open == null) {
        open = {
          component,
          status: check.status,
          reason: check.reason || '',
          startedAt: checkedAt,
          endedAt: null,
        };
      } else if (SEVERITY[check.status] > SEVERITY[open.status]) {
        open.status = check.status;
        open.reason = check.reason || open.reason;
      }
    }

    if (open != null) {
      incidents.push(open);
    }
  }

  incidents.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  return incidents;
}

/** Most frequent non-empty reason in a list. */
function dominantReason(reasons) {
  const counts = new Map();
  for (const reason of reasons) {
    if (!reason) {
      continue;
    }
    counts.set(reason, (counts.get(reason) || 0) + 1);
  }
  let top = '';
  let topCount = 0;
  for (const [reason, count] of counts) {
    if (count > topCount) {
      top = reason;
      topCount = count;
    }
  }
  return top;
}

/** Compact human duration: "42m", "3h 10m", "5 days" (days once >= 48h). */
function ageText(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 48) {
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${totalHours}h ${minutes}m` : `${totalHours}h`;
  }
  return `${Math.floor(totalHours / 24)} days`;
}

/** Stable dedup key for a (component, startedAt) incident. */
function alertKey(component, startedAt) {
  return `${component}|${new Date(startedAt).toISOString()}`;
}

/**
 * Ongoing 'down' incidents that crossed the alert threshold, unannounced.
 *
 * `alertedKeys` holds keys (see alertKey) already claimed for a sent alert.
 * `minStartedAt` guards against incidents whose start is clipped at the
 * query-window edge: their apparent startedAt shifts on every cycle, which
 * would mint a fresh key (and a fresh email) each time — anything at or
 * before the margin is skipped instead.
 */
function incidentsNeedingAlert(incidents, alertedKeys, thresholdMinutes, now, minStartedAt) {
  const due = [];
  for (const incident of incidents) {
    if (incident.endedAt != null) {
      continue;
    }
    if (incident.status !== 'down') {
      continue;
    }
    const startedAt = new Date(incident.startedAt);
    if (minStartedAt != null && startedAt <= minStartedAt) {
      continue;
    }
    if ((now - startedAt) / 60000 < thresholdMinutes) {
      continue;
    }
    if (alertedKeys.has(alertKey(incident.component, startedAt))) {
      continue;
    }
    due.push(incident);
  }
  return due;
}

module.exports = {
  SEVERITY,
  overallStatus,
  redThreshold,
  bucketDayStatus,
  groupIncidents,
  dominantReason,
  ageText,
  alertKey,
  incidentsNeedingAlert,
};
