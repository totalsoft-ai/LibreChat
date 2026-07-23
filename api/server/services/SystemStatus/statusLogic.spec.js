const {
  overallStatus,
  redThreshold,
  bucketDayStatus,
  groupIncidents,
  dominantReason,
  ageText,
  alertKey,
  incidentsNeedingAlert,
} = require('./statusLogic');

describe('overallStatus', () => {
  it('returns ok when all components are ok', () => {
    expect(overallStatus(['ok', 'ok', 'ok'])).toBe('ok');
  });

  it('returns the worst known status', () => {
    expect(overallStatus(['ok', 'degraded', 'ok'])).toBe('degraded');
    expect(overallStatus(['ok', 'degraded', 'down'])).toBe('down');
  });

  it('ignores unknown when other statuses exist', () => {
    expect(overallStatus(['ok', 'unknown', 'ok'])).toBe('ok');
    expect(overallStatus(['unknown', 'degraded'])).toBe('degraded');
  });

  it('returns unknown when all components are unknown or list is empty', () => {
    expect(overallStatus(['unknown', 'unknown'])).toBe('unknown');
    expect(overallStatus([])).toBe('unknown');
  });
});

describe('redThreshold', () => {
  it('requires ~1 cumulative hour of down checks', () => {
    expect(redThreshold(5)).toBe(12);
    expect(redThreshold(10)).toBe(6);
    expect(redThreshold(1)).toBe(60);
  });

  it('falls back to a 5-minute interval for invalid input', () => {
    expect(redThreshold(0)).toBe(12);
    expect(redThreshold(-3)).toBe(12);
  });
});

describe('bucketDayStatus', () => {
  const threshold = redThreshold(5);

  it('returns empty for days with no checks or only unknown checks', () => {
    expect(bucketDayStatus({}, threshold)).toBe('empty');
    expect(bucketDayStatus({ unknownCount: 20 }, threshold)).toBe('empty');
  });

  it('returns ok for fully healthy days', () => {
    expect(bucketDayStatus({ okCount: 288 }, threshold)).toBe('ok');
    expect(bucketDayStatus({ okCount: 280, unknownCount: 8 }, threshold)).toBe('ok');
  });

  it('returns degraded for a short blip (single down check)', () => {
    expect(bucketDayStatus({ okCount: 287, downCount: 1 }, threshold)).toBe('degraded');
  });

  it('returns degraded for any degraded checks', () => {
    expect(bucketDayStatus({ okCount: 280, degradedCount: 8 }, threshold)).toBe('degraded');
  });

  it('returns down only for sustained downtime (>= threshold down checks)', () => {
    expect(bucketDayStatus({ okCount: 277, downCount: 11 }, threshold)).toBe('degraded');
    expect(bucketDayStatus({ okCount: 276, downCount: 12 }, threshold)).toBe('down');
  });
});

describe('groupIncidents', () => {
  const t = (minutes) => new Date(Date.UTC(2026, 6, 17, 10, minutes));
  const row = (status, minutes, reason = '', component = 'rag_api') => ({
    component,
    status,
    reason,
    checkedAt: t(minutes),
  });

  it('returns no incidents for all-ok history', () => {
    expect(groupIncidents([row('ok', 0), row('ok', 5), row('ok', 10)])).toEqual([]);
  });

  it('groups consecutive failures into one incident and closes after 2 consecutive oks', () => {
    const incidents = groupIncidents([
      row('ok', 0),
      row('down', 5, 'timeout'),
      row('down', 10, 'timeout'),
      row('ok', 15),
      row('ok', 20),
      row('ok', 25),
    ]);
    expect(incidents).toHaveLength(1);
    expect(incidents[0]).toMatchObject({
      component: 'rag_api',
      status: 'down',
      reason: 'timeout',
      startedAt: t(5),
      endedAt: t(15),
    });
  });

  it('swallows a lone ok between failures (anti-flapping)', () => {
    const incidents = groupIncidents([
      row('down', 0, 'timeout'),
      row('ok', 5),
      row('down', 10, 'timeout'),
      row('ok', 15),
      row('ok', 20),
    ]);
    expect(incidents).toHaveLength(1);
    expect(incidents[0].startedAt).toEqual(t(0));
    expect(incidents[0].endedAt).toEqual(t(15));
  });

  it('keeps ongoing incidents open (endedAt null)', () => {
    const incidents = groupIncidents([row('ok', 0), row('down', 5, 'refused')]);
    expect(incidents).toHaveLength(1);
    expect(incidents[0].endedAt).toBeNull();
  });

  it('escalates severity within an incident and never de-escalates', () => {
    const incidents = groupIncidents([
      row('degraded', 0, 'slow'),
      row('down', 5, 'timeout'),
      row('degraded', 10, 'slow again'),
    ]);
    expect(incidents).toHaveLength(1);
    expect(incidents[0].status).toBe('down');
    expect(incidents[0].reason).toBe('timeout');
  });

  it('treats unknown as neutral (does not open, extend, or close)', () => {
    expect(groupIncidents([row('unknown', 0), row('unknown', 5)])).toEqual([]);

    const incidents = groupIncidents([
      row('down', 0, 'timeout'),
      row('unknown', 5),
      row('ok', 10),
      row('unknown', 15),
      row('ok', 20),
    ]);
    expect(incidents).toHaveLength(1);
    expect(incidents[0].endedAt).toEqual(t(10));
  });

  it('separates incidents per component and sorts newest first', () => {
    const incidents = groupIncidents([
      row('down', 0, 'timeout', 'rag_api'),
      row('down', 10, 'unreachable', 'meilisearch'),
    ]);
    expect(incidents).toHaveLength(2);
    expect(incidents[0].component).toBe('meilisearch');
    expect(incidents[1].component).toBe('rag_api');
  });
});

describe('dominantReason', () => {
  it('returns the most frequent non-empty reason', () => {
    expect(dominantReason(['timeout', 'refused', 'timeout', ''])).toBe('timeout');
  });

  it('returns empty string when there are no reasons', () => {
    expect(dominantReason([])).toBe('');
    expect(dominantReason(['', ''])).toBe('');
  });
});

describe('incidentsNeedingAlert', () => {
  const T0 = new Date(Date.UTC(2026, 6, 15, 8, 0, 0));
  const t = (minutesFromT0) => new Date(T0.getTime() + minutesFromT0 * 60000);
  const THRESHOLD = 60;
  const NOW = T0;

  const incident = (minutesAgo, { status = 'down', endedAt = null } = {}) => ({
    component: 'comp_a',
    label: 'Component A',
    status,
    reason: 'r',
    startedAt: t(-minutesAgo),
    endedAt,
  });

  const due = (incidents, { alerted = [], minStartedAt = null } = {}) =>
    incidentsNeedingAlert(incidents, new Set(alerted), THRESHOLD, NOW, minStartedAt);

  it('flags an ongoing down incident past the threshold', () => {
    expect(due([incident(90)])).toHaveLength(1);
  });

  it('leaves a younger-than-threshold incident alone', () => {
    expect(due([incident(30)])).toEqual([]);
  });

  it('treats exactly-at-threshold as crossed', () => {
    expect(due([incident(60)])).toHaveLength(1);
  });

  it('ignores incidents that already ended', () => {
    expect(due([incident(90, { endedAt: t(-10) })])).toEqual([]);
  });

  it('ignores non-down incidents (degraded, unknown)', () => {
    expect(due([incident(90, { status: 'degraded' })])).toEqual([]);
  });

  it('deduplicates an already-alerted (component, startedAt) key', () => {
    const inc = incident(90);
    const alerted = [alertKey(inc.component, inc.startedAt)];
    expect(due([inc], { alerted })).toEqual([]);
  });

  it('skips a start clipped at the query-window edge', () => {
    const inc = incident(90);
    expect(due([inc], { minStartedAt: t(-90) })).toEqual([]);
  });

  it('only blocks starts at or before the edge margin', () => {
    const inc = incident(90);
    expect(due([inc], { minStartedAt: t(-200) })).toHaveLength(1);
  });
});

describe('ageText', () => {
  const MINUTE = 60000;

  it('formats sub-hour durations in minutes', () => {
    expect(ageText(42 * MINUTE)).toBe('42m');
    expect(ageText(30000)).toBe('0m');
  });

  it('formats sub-2-day durations in hours and minutes', () => {
    expect(ageText(190 * MINUTE)).toBe('3h 10m');
    expect(ageText(120 * MINUTE)).toBe('2h');
    expect(ageText(47 * 60 * MINUTE)).toBe('47h');
  });

  it('formats 48h+ durations in days', () => {
    expect(ageText(5 * 24 * 60 * MINUTE)).toBe('5 days');
    expect(ageText(48 * 60 * MINUTE)).toBe('2 days');
  });
});
