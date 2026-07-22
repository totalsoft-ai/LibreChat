import { request } from 'librechat-data-provider';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, QueryObserverResult } from '@tanstack/react-query';

export type ComponentStatus = 'ok' | 'degraded' | 'down' | 'unknown';
export type UptimeDayStatus = ComponentStatus | 'empty';
export type ComponentGroup = 'core' | 'ai';

export type StatusComponent = {
  component: string;
  label: string;
  group: ComponentGroup;
  status: ComponentStatus;
  reason: string;
  details: Record<string, unknown>;
  checkedAt: string | null;
};

export type SystemStatusResponse = {
  overall: ComponentStatus;
  components: StatusComponent[];
  checkIntervalMinutes: number;
};

export type UptimeDay = {
  day: string;
  status: UptimeDayStatus;
  checks: number;
  failed: number;
  failedMinutes: number;
  topReason: string;
};

export type HistoryComponent = {
  component: string;
  label: string;
  group: ComponentGroup;
  uptimePct: number | null;
  days: UptimeDay[];
};

export type SystemStatusHistoryResponse = {
  days: number;
  checkIntervalMinutes: number;
  components: HistoryComponent[];
};

export type Incident = {
  component: string;
  label: string;
  status: ComponentStatus;
  reason: string;
  startedAt: string;
  endedAt: string | null;
};

export type SystemIncidentsResponse = {
  days: number;
  incidents: Incident[];
};

const STATUS_POLL_MS = 60_000;
const HISTORY_POLL_MS = 300_000;

export const useGetSystemStatus = (
  config?: UseQueryOptions<SystemStatusResponse>,
): QueryObserverResult<SystemStatusResponse> => {
  return useQuery<SystemStatusResponse>(
    ['admin-system-status'],
    () => request.get('/api/admin/system-status'),
    {
      refetchOnWindowFocus: false,
      refetchInterval: STATUS_POLL_MS,
      refetchIntervalInBackground: true,
      ...config,
    },
  );
};

export const useGetSystemStatusHistory = (
  days: number,
  config?: UseQueryOptions<SystemStatusHistoryResponse>,
): QueryObserverResult<SystemStatusHistoryResponse> => {
  return useQuery<SystemStatusHistoryResponse>(
    ['admin-system-status-history', days],
    () => request.get(`/api/admin/system-status/history?days=${days}`),
    {
      refetchOnWindowFocus: false,
      refetchInterval: HISTORY_POLL_MS,
      refetchIntervalInBackground: true,
      keepPreviousData: true,
      ...config,
    },
  );
};

export const useGetSystemIncidents = (
  days: number = 7,
  config?: UseQueryOptions<SystemIncidentsResponse>,
): QueryObserverResult<SystemIncidentsResponse> => {
  return useQuery<SystemIncidentsResponse>(
    ['admin-system-status-incidents', days],
    () => request.get(`/api/admin/system-status/incidents?days=${days}`),
    {
      refetchOnWindowFocus: false,
      refetchInterval: STATUS_POLL_MS,
      refetchIntervalInBackground: true,
      ...config,
    },
  );
};
