import { useEffect, useMemo, useRef, useState } from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent, HoverCardPortal } from '@librechat/client';
import {
  useGetSystemStatus,
  useGetSystemStatusHistory,
  useGetSystemIncidents,
} from '~/data-provider/SystemStatus';
import type {
  ComponentStatus,
  UptimeDayStatus,
  UptimeDay,
  HistoryComponent,
  Incident,
  StatusComponent,
} from '~/data-provider/SystemStatus';

const SEVERITY: Record<ComponentStatus, number> = { ok: 0, unknown: 1, degraded: 2, down: 3 };

const GROUPS: { key: 'core' | 'ai' | 'orchestrator'; label: string }[] = [
  { key: 'core', label: 'Core Services' },
  { key: 'orchestrator', label: 'Orchestrator' },
  { key: 'ai', label: 'AI Endpoints' },
];

const DOT_COLORS: Record<ComponentStatus, string> = {
  ok: 'bg-green-500',
  degraded: 'bg-amber-500',
  down: 'bg-red-500',
  unknown: 'bg-gray-400',
};

const CELL_COLORS: Record<UptimeDayStatus, string> = {
  ok: 'bg-green-500',
  degraded: 'bg-amber-400',
  down: 'bg-red-500',
  unknown: 'bg-gray-300 dark:bg-gray-600',
  empty: 'bg-gray-200 dark:bg-gray-700',
};

const STATUS_LABELS: Record<ComponentStatus, string> = {
  ok: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
  unknown: 'Unknown',
};

const BANNER: Record<ComponentStatus, { text: string; className: string }> = {
  ok: {
    text: 'All Systems Operational',
    className:
      'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300',
  },
  degraded: {
    text: 'Degraded Performance',
    className:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300',
  },
  down: {
    text: 'Service Disruption',
    className:
      'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300',
  },
  unknown: {
    text: 'Status Unknown',
    className:
      'border-border-light bg-surface-secondary text-text-secondary',
  },
};

const DAY_OPTIONS = [30, 60, 90];

function worstStatus(statuses: ComponentStatus[]): ComponentStatus {
  const known = statuses.filter((s) => s !== 'unknown');
  if (known.length === 0) {
    return 'unknown';
  }
  return known.reduce<ComponentStatus>(
    (worst, s) => (SEVERITY[s] > SEVERITY[worst] ? s : worst),
    'ok',
  );
}

function ageText(ms: number): string {
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

function impactText(failedMinutes: number): string {
  if (failedMinutes <= 0) {
    return '';
  }
  const hours = Math.floor(failedMinutes / 60);
  const minutes = failedMinutes % 60;
  if (hours === 0) {
    return `~${minutes}m`;
  }
  return minutes > 0 ? `~${hours}h ${minutes}m` : `~${hours}h`;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type DayCellData = UptimeDay & { isEmpty?: boolean };

/**
 * Builds a continuous run of day cells ending today. The bar spans only from
 * the first recorded check (across all members) to today, capped at rangeDays;
 * gaps render as `empty`.
 */
function buildDayCells(days: UptimeDay[], rangeDays: number, firstDay: string | null): DayCellData[] {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const today = new Date();
  const rangeStart = new Date(today.getTime() - (rangeDays - 1) * 24 * 60 * 60 * 1000);
  let start = rangeStart;
  if (firstDay != null) {
    const first = new Date(`${firstDay}T00:00:00Z`);
    if (first > rangeStart) {
      start = first;
    }
  }

  const cells: DayCellData[] = [];
  for (let d = new Date(start); dayKey(d) <= dayKey(today); d.setDate(d.getDate() + 1)) {
    const key = dayKey(d);
    const bucket = byDay.get(key);
    if (bucket) {
      cells.push(bucket);
    } else {
      cells.push({
        day: key,
        status: 'empty',
        checks: 0,
        failed: 0,
        failedMinutes: 0,
        topReason: '',
        isEmpty: true,
      });
    }
  }
  return cells;
}

/** Per-day worst status across group members, for collapsed group bars. */
function aggregateGroupDays(members: HistoryComponent[]): UptimeDay[] {
  const byDay = new Map<string, UptimeDay>();
  for (const member of members) {
    for (const day of member.days) {
      const existing = byDay.get(day.day);
      const memberReason = day.topReason ? `${member.label}: ${day.topReason}` : '';
      if (!existing) {
        byDay.set(day.day, { ...day, topReason: memberReason });
        continue;
      }
      const dayStatus = day.status === 'empty' ? 'unknown' : day.status;
      const existingStatus = existing.status === 'empty' ? 'unknown' : existing.status;
      const worse = SEVERITY[dayStatus as ComponentStatus] > SEVERITY[existingStatus as ComponentStatus];
      byDay.set(day.day, {
        day: day.day,
        status: worse ? day.status : existing.status,
        checks: existing.checks + day.checks,
        failed: existing.failed + day.failed,
        failedMinutes: Math.max(existing.failedMinutes, day.failedMinutes),
        topReason: worse ? memberReason || existing.topReason : existing.topReason || memberReason,
      });
    }
  }
  return Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day));
}

function firstRecordedDay(components: HistoryComponent[]): string | null {
  let first: string | null = null;
  for (const component of components) {
    for (const day of component.days) {
      if (first == null || day.day < first) {
        first = day.day;
      }
    }
  }
  return first;
}

function StatusDot({ status, className = '' }: { status: ComponentStatus; className?: string }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${DOT_COLORS[status]} ${className}`}
      aria-label={STATUS_LABELS[status]}
    />
  );
}

function DayCell({ day }: { day: DayCellData }) {
  const date = new Date(`${day.day}T00:00:00Z`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return (
    <HoverCard openDelay={150} closeDelay={0}>
      <HoverCardTrigger asChild>
        <div
          className={`h-8 min-w-[3px] flex-1 cursor-default rounded-[2px] ${CELL_COLORS[day.status]}`}
        />
      </HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent side="top" className="w-64 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-text-primary">{date}</span>
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <StatusDot status={day.status === 'empty' ? 'unknown' : (day.status as ComponentStatus)} />
              {day.status === 'empty' ? 'No data' : STATUS_LABELS[day.status as ComponentStatus]}
            </span>
          </div>
          {day.checks > 0 && (
            <div className="mt-2 space-y-1 text-xs text-text-secondary">
              {day.failed > 0 ? (
                <>
                  <div>
                    Estimated impact: <span className="font-medium">{impactText(day.failedMinutes)}</span>
                  </div>
                  <div>
                    {day.failed} of {day.checks} checks failed
                  </div>
                  {day.topReason && <div className="italic">{day.topReason}</div>}
                </>
              ) : (
                <div>All {day.checks} checks passed</div>
              )}
            </div>
          )}
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  );
}

function UptimeBar({ days, rangeDays, firstDay }: { days: UptimeDay[]; rangeDays: number; firstDay: string | null }) {
  const cells = useMemo(() => buildDayCells(days, rangeDays, firstDay), [days, rangeDays, firstDay]);
  return <div className="flex w-full gap-[2px]">{cells.map((cell) => <DayCell key={cell.day} day={cell} />)}</div>;
}

function IncidentRow({ incident, now }: { incident: Incident; now: number }) {
  const started = new Date(incident.startedAt).getTime();
  const ended = incident.endedAt ? new Date(incident.endedAt).getTime() : null;
  return (
    <div className="flex flex-col gap-1 border-b border-border-light py-3 last:border-b-0">
      <div className="flex items-center gap-2">
        <StatusDot status={incident.status} />
        <span className="font-medium text-text-primary">{incident.label}</span>
        {ended == null && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
            Ongoing
          </span>
        )}
      </div>
      <div className="text-sm text-text-secondary">{incident.reason || 'No reason recorded'}</div>
      <div className="text-xs text-text-secondary">
        {ended == null
          ? `Started ${ageText(now - started)} ago`
          : `${ageText(now - started)} ago · lasted ${ageText(ended - started)}`}
      </div>
    </div>
  );
}

export default function SystemStatusSection() {
  const [historyDays, setHistoryDays] = useState(30);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showAllIncidents, setShowAllIncidents] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const autoExpandedRef = useRef(false);

  const statusQuery = useGetSystemStatus();
  const historyQuery = useGetSystemStatusHistory(historyDays);
  const incidentsQuery = useGetSystemIncidents(7);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const status = statusQuery.data;
  const history = historyQuery.data;
  const incidents = incidentsQuery.data?.incidents ?? [];
  const ongoing = incidents.filter((incident) => incident.endedAt == null);

  // Auto-expand problem groups once on first load; after that, the expand
  // state belongs to the user.
  useEffect(() => {
    if (autoExpandedRef.current || !status) {
      return;
    }
    autoExpandedRef.current = true;
    const next: Record<string, boolean> = {};
    for (const group of GROUPS) {
      const members = status.components.filter((c) => c.group === group.key);
      next[group.key] = worstStatus(members.map((m) => m.status)) !== 'ok';
    }
    setExpandedGroups(next);
  }, [status]);

  if (statusQuery.isLoading && !status) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border border-border-light bg-surface-secondary" />
        ))}
      </div>
    );
  }

  if (statusQuery.isError && !status) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
        Failed to load system status. Retrying automatically…
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const banner = BANNER[status.overall];
  const affected = status.components.filter(
    (c) => c.status === 'down' || c.status === 'degraded',
  );
  const historyByComponent = new Map(
    (history?.components ?? []).map((c) => [c.component, c]),
  );
  const firstDay = history ? firstRecordedDay(history.components) : null;
  const visibleIncidents = showAllIncidents ? incidents : incidents.slice(0, 10);

  return (
    <div className="flex flex-col gap-5">
      {statusQuery.isError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
          Live updates are failing — showing the last known state.
        </div>
      )}

      {/* Overall banner */}
      <div className={`flex items-center justify-between rounded-lg border p-5 shadow-sm ${banner.className}`}>
        <div className="flex items-center gap-3">
          <StatusDot status={status.overall} className="h-3.5 w-3.5" />
          <span className="text-lg font-semibold">{banner.text}</span>
        </div>
        <div className="text-sm">
          {affected.length > 0
            ? `${affected.length} component${affected.length > 1 ? 's' : ''} affected`
            : `Checked every ${status.checkIntervalMinutes} min`}
        </div>
      </div>

      {/* Ongoing incident strips */}
      {ongoing.map((incident) => (
        <div
          key={`${incident.component}-${incident.startedAt}`}
          className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-900/20"
        >
          <StatusDot status={incident.status} />
          <span className="font-medium text-red-800 dark:text-red-300">{incident.label}</span>
          <span className="text-red-700 dark:text-red-400">
            {incident.reason || 'Unavailable'} — since {ageText(now - new Date(incident.startedAt).getTime())} ago
          </span>
        </div>
      ))}

      {/* History range selector */}
      <div className="flex items-center justify-end gap-1">
        {DAY_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setHistoryDays(option)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              historyDays === option
                ? 'bg-surface-secondary text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {option} days
          </button>
        ))}
      </div>

      {/* Service groups */}
      {GROUPS.map((group) => {
        const members: StatusComponent[] = status.components.filter((c) => c.group === group.key);
        if (members.length === 0) {
          return null;
        }
        const groupStatus = worstStatus(members.map((m) => m.status));
        const expanded = expandedGroups[group.key] ?? false;
        const memberHistories = members
          .map((m) => historyByComponent.get(m.component))
          .filter((h): h is HistoryComponent => h != null);
        const groupDays = aggregateGroupDays(memberHistories);

        return (
          <div key={group.key} className="rounded-lg border border-border-light bg-surface-primary shadow-sm">
            <button
              type="button"
              onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.key]: !expanded }))}
              className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-surface-hover"
              aria-expanded={expanded}
            >
              <svg
                className={`h-4 w-4 flex-shrink-0 text-text-secondary transition-transform ${expanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <StatusDot status={groupStatus} />
              <span className="font-semibold text-text-primary">{group.label}</span>
              <span className="text-xs text-text-secondary">{STATUS_LABELS[groupStatus]}</span>
              {!expanded && (
                <div className="ml-4 hidden flex-1 sm:block">
                  <UptimeBar days={groupDays} rangeDays={historyDays} firstDay={firstDay} />
                </div>
              )}
            </button>

            {expanded && (
              <div className="divide-y divide-border-light border-t border-border-light">
                {members.map((member) => {
                  const memberHistory = historyByComponent.get(member.component);
                  return (
                    <div key={member.component} className="px-5 py-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusDot status={member.status} />
                          <span className="font-medium text-text-primary">{member.label}</span>
                          <span className="text-xs text-text-secondary">{STATUS_LABELS[member.status]}</span>
                          {member.status !== 'ok' && member.reason && (
                            <span className="text-xs italic text-text-secondary">— {member.reason}</span>
                          )}
                        </div>
                        {memberHistory?.uptimePct != null && (
                          <span className="text-xs text-text-secondary">
                            {memberHistory.uptimePct.toFixed(2)}% uptime
                          </span>
                        )}
                      </div>
                      <UptimeBar days={memberHistory?.days ?? []} rangeDays={historyDays} firstDay={firstDay} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Static frontend row: if you can read this page, the web client is up */}
      <div className="flex items-center gap-2 rounded-lg border border-border-light bg-surface-primary px-5 py-4 shadow-sm">
        <StatusDot status="ok" />
        <span className="font-medium text-text-primary">Web client</span>
        <span className="text-xs text-text-secondary">Operational</span>
      </div>

      {/* Incident history */}
      <div className="rounded-lg border border-border-light bg-surface-primary shadow-sm">
        <div className="border-b border-border-light px-5 py-4">
          <h3 className="font-semibold text-text-primary">Incidents — last 7 days</h3>
        </div>
        <div className="px-5">
          {visibleIncidents.length === 0 ? (
            <div className="py-6 text-sm text-text-secondary">No incidents recorded.</div>
          ) : (
            visibleIncidents.map((incident) => (
              <IncidentRow key={`${incident.component}-${incident.startedAt}`} incident={incident} now={now} />
            ))
          )}
        </div>
        {incidents.length > 10 && (
          <div className="border-t border-border-light px-5 py-3">
            <button
              type="button"
              onClick={() => setShowAllIncidents((prev) => !prev)}
              className="text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              {showAllIncidents ? 'Show fewer' : `Show all ${incidents.length} incidents`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
