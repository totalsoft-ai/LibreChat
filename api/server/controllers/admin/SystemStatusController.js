const { logger } = require('@librechat/data-schemas');
const ServiceHealthCheck = require('~/models/ServiceHealthCheck');
const { listComponents } = require('~/server/services/SystemStatus/healthChecks');
const { getCheckIntervalMinutes } = require('~/server/services/SystemStatus/scheduler');
const {
  overallStatus,
  redThreshold,
  bucketDayStatus,
  groupIncidents,
  dominantReason,
} = require('~/server/services/SystemStatus/statusLogic');

const clampDays = (value, fallback, max) => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, 1), max);
};

/** GET /api/admin/system-status — latest check per component + overall status */
const getStatus = async (req, res) => {
  try {
    const registry = await listComponents();
    const latest = await ServiceHealthCheck.aggregate([
      { $sort: { component: 1, checkedAt: -1 } },
      {
        $group: {
          _id: '$component',
          status: { $first: '$status' },
          reason: { $first: '$reason' },
          details: { $first: '$details' },
          checkedAt: { $first: '$checkedAt' },
        },
      },
    ]);

    const latestMap = new Map(latest.map((row) => [row._id, row]));
    const components = registry.map(({ component, label, group }) => {
      const row = latestMap.get(component);
      if (!row) {
        return {
          component,
          label,
          group,
          status: 'unknown',
          reason: 'No health check recorded yet',
          details: {},
          checkedAt: null,
        };
      }
      return {
        component,
        label,
        group,
        status: row.status,
        reason: row.reason,
        details: row.details || {},
        checkedAt: row.checkedAt,
      };
    });

    res.json({
      overall: overallStatus(components.map((c) => c.status)),
      components,
      checkIntervalMinutes: getCheckIntervalMinutes(),
    });
  } catch (err) {
    logger.error('[SystemStatusController] getStatus error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/** GET /api/admin/system-status/history?days=90 — per-component daily uptime buckets */
const getHistory = async (req, res) => {
  try {
    const days = clampDays(req.query.days, 90, 180);
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const intervalMinutes = getCheckIntervalMinutes();
    const threshold = redThreshold(intervalMinutes);

    const registry = await listComponents();
    const rows = await ServiceHealthCheck.aggregate([
      { $match: { checkedAt: { $gte: start } } },
      {
        $group: {
          _id: {
            component: '$component',
            day: { $dateToString: { format: '%Y-%m-%d', date: '$checkedAt' } },
          },
          okCount: { $sum: { $cond: [{ $eq: ['$status', 'ok'] }, 1, 0] } },
          degradedCount: { $sum: { $cond: [{ $eq: ['$status', 'degraded'] }, 1, 0] } },
          downCount: { $sum: { $cond: [{ $eq: ['$status', 'down'] }, 1, 0] } },
          unknownCount: { $sum: { $cond: [{ $eq: ['$status', 'unknown'] }, 1, 0] } },
          reasons: {
            $push: { $cond: [{ $in: ['$status', ['degraded', 'down']] }, '$reason', null] },
          },
        },
      },
      { $sort: { '_id.component': 1, '_id.day': 1 } },
    ]);

    const byComponent = new Map();
    for (const row of rows) {
      const { component, day } = row._id;
      if (!byComponent.has(component)) {
        byComponent.set(component, []);
      }
      const failed = row.degradedCount + row.downCount;
      byComponent.get(component).push({
        day,
        status: bucketDayStatus(row, threshold),
        checks: row.okCount + row.degradedCount + row.downCount + row.unknownCount,
        failed,
        failedMinutes: failed * intervalMinutes,
        topReason: dominantReason(row.reasons.filter(Boolean)),
        okCount: row.okCount,
        unknownCount: row.unknownCount,
      });
    }

    const components = registry.map(({ component, label, group }) => {
      const dayBuckets = byComponent.get(component) || [];
      let okSum = 0;
      let knownSum = 0;
      for (const bucket of dayBuckets) {
        okSum += bucket.okCount;
        knownSum += bucket.checks - bucket.unknownCount;
      }
      const uptimePct = knownSum > 0 ? Math.round((okSum / knownSum) * 10000) / 100 : null;
      return {
        component,
        label,
        group,
        uptimePct,
        days: dayBuckets.map(({ okCount: _ok, unknownCount: _unknown, ...bucket }) => bucket),
      };
    });

    res.json({ days, checkIntervalMinutes: intervalMinutes, components });
  } catch (err) {
    logger.error('[SystemStatusController] getHistory error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/** GET /api/admin/system-status/incidents?days=7 — grouped incidents, newest first */
const getIncidents = async (req, res) => {
  try {
    const days = clampDays(req.query.days, 7, 90);
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const registry = await listComponents();
    const labelMap = new Map(registry.map(({ component, label }) => [component, label]));

    const rows = await ServiceHealthCheck.find({ checkedAt: { $gte: start } })
      .select('component status reason checkedAt')
      .sort({ checkedAt: 1 })
      .lean();

    const incidents = groupIncidents(rows).map((incident) => ({
      ...incident,
      label: labelMap.get(incident.component) || incident.component,
    }));

    res.json({ days, incidents });
  } catch (err) {
    logger.error('[SystemStatusController] getIncidents error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getStatus, getHistory, getIncidents };
