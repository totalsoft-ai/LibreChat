import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '~/hooks';
import {
  useGetAnalyticsStats,
  useGetTokenUsageStats,
  useGetHealthStats,
  useGetActiveUsersStats,
  useGetFeedbackStats,
  useGetCategoryDistribution,
} from '~/data-provider/Analytics';
import type { Period, Window, ExtendedWindow, Pagination } from '~/data-provider/Analytics';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

const PERIOD_LABEL: Record<Period, string> = {
  daily: 'Date',
  weekly: 'Week',
  monthly: 'Month',
};

const WINDOWS: { value: Window; label: string }[] = [
  { value: 'day', label: 'Last Day' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last Month' },
];

const EXTENDED_WINDOWS: { value: ExtendedWindow; label: string }[] = [
  { value: 'day', label: 'Last Day' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last Month' },
  { value: 'all', label: 'All Time' },
];

export default function AnalyticsPage() {
  const { user } = useAuthContext();
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/c/new" replace={true} />;
  }
  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="rounded-lg border border-border-light bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-sm dark:from-blue-900/10 dark:to-purple-900/10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
                <p className="mt-1 text-sm text-text-secondary">Usage statistics and insights</p>
              </div>
            </div>
          </div>

          <MessagesCard />
          <ActiveUsersCard />
          <CategoryDistributionCard />
          <FeedbackCard />
          <HealthCard />
          <TokenUsageCard />
        </div>
      </div>
    </div>
  );
}

function PeriodToggle({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-border-light">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-4 py-1.5 text-sm transition-colors ${
            period === p.value ? 'bg-blue-500 text-white' : 'text-text-secondary hover:bg-surface-hover'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function WindowToggle({ window: win, onChange }: { window: Window; onChange: (w: Window) => void }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-border-light">
      {WINDOWS.map((w) => (
        <button
          key={w.value}
          onClick={() => onChange(w.value)}
          className={`px-4 py-1.5 text-sm transition-colors ${
            win === w.value ? 'bg-blue-500 text-white' : 'text-text-secondary hover:bg-surface-hover'
          }`}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}

function ExtendedWindowToggle({ window: win, onChange }: { window: ExtendedWindow; onChange: (w: ExtendedWindow) => void }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-border-light">
      {EXTENDED_WINDOWS.map((w) => (
        <button
          key={w.value}
          onClick={() => onChange(w.value)}
          className={`px-4 py-1.5 text-sm transition-colors ${
            win === w.value ? 'bg-blue-500 text-white' : 'text-text-secondary hover:bg-surface-hover'
          }`}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}

function TableFooter({
  page,
  pageSize,
  pagination,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  pagination?: Pagination;
  isLoading: boolean;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  return (
    <div className="flex items-center justify-between border-t border-border-light px-6 py-3">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded border border-border-light bg-surface-primary px-2 py-1 text-sm text-text-primary"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {!isLoading && pagination && (
          <span className="ml-2">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {[
          { label: '«', action: () => onPageChange(1), disabled: page === 1 },
          { label: '‹', action: () => onPageChange(Math.max(1, page - 1)), disabled: page === 1 },
          { label: '›', action: () => onPageChange(Math.min(totalPages, page + 1)), disabled: page >= totalPages },
          { label: '»', action: () => onPageChange(totalPages), disabled: page >= totalPages },
        ].map(({ label, action, disabled }) => (
          <button
            key={label}
            onClick={action}
            disabled={disabled}
            className="rounded px-2 py-1 text-sm text-text-secondary disabled:opacity-40 hover:bg-surface-hover"
          >
            {label}
          </button>
        ))}
        <span className="px-2 text-sm text-text-primary">{page} / {totalPages}</span>
      </div>
    </div>
  );
}

function SkeletonRows({ cols, rows }: { cols: number; rows: number }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i}>
          {[...Array(cols)].map((__, j) => (
            <td key={j} className="px-6 py-3">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function HorizontalBar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
      <div className={`h-full rounded-full transition-all duration-300 ${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function SentimentBar({ likes, total }: { likes: number; total: number }) {
  const pct = total > 0 ? (likes / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-red-200 dark:bg-red-900/40">
        <div className="h-full rounded-full bg-green-500 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 text-right text-xs font-medium text-text-primary">{pct.toFixed(1)}%</span>
    </div>
  );
}

function StatTile({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border-light bg-surface-secondary p-4">
      <span className={`text-3xl font-bold ${colorClass}`}>{value.toLocaleString()}</span>
      <span className="mt-1 text-center text-xs text-text-secondary">{label}</span>
    </div>
  );
}

const CHART_H = 160;

function MessagesCard() {
  const [period, setPeriod] = useState<Period>('daily');
  const { data, isLoading, isError } = useGetAnalyticsStats(period, 1, 50);

  const rows = data?.data ?? [];
  const maxVal = Math.max(1, ...rows.map((r) => Math.max(r.messageCount, r.conversationCount)));
  const showLabel = (i: number) => rows.length <= 15 || i % Math.ceil(rows.length / 12) === 0;

  return (
    <div className="rounded-lg border border-border-light bg-surface-primary shadow-sm">
      <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
        <h2 className="text-lg font-semibold text-text-primary">Messages &amp; Conversations</h2>
        <PeriodToggle period={period} onChange={setPeriod} />
      </div>

      <div className="px-6 pt-6 pb-2">
        {isError ? (
          <p className="py-8 text-center text-red-500">Failed to load data.</p>
        ) : isLoading ? (
          <div className="flex items-end gap-1" style={{ height: CHART_H + 24 }}>
            {[...Array(14)].map((_, i) => (
              <div key={i} className="flex flex-1 animate-pulse flex-col items-center justify-end gap-px">
                <div className="w-full rounded-t bg-blue-200 dark:bg-blue-900/40" style={{ height: `${30 + (i * 17) % 70}%` }} />
                <div className="w-full rounded-t bg-purple-200 dark:bg-purple-900/40" style={{ height: `${15 + (i * 11) % 40}%` }} />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-text-secondary">No data</p>
        ) : (
          <>
            <div className="flex items-end gap-0.5" style={{ height: CHART_H }}>
              {rows.map((r, i) => (
                <div key={r.period} className="group relative flex flex-1 flex-col items-center justify-end">
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                    <div className="font-medium">{r.period}</div>
                    <div className="mt-1 flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-sm bg-blue-400" /> Messages: <strong>{r.messageCount.toLocaleString()}</strong></div>
                    <div className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-sm bg-purple-400" /> Conversations: <strong>{r.conversationCount.toLocaleString()}</strong></div>
                  </div>
                  <div className="flex w-full items-end gap-px">
                    <div
                      className="flex-1 rounded-t bg-blue-500 transition-all duration-200 hover:bg-blue-400"
                      style={{ height: `${(r.messageCount / maxVal) * CHART_H}px` }}
                    />
                    <div
                      className="flex-1 rounded-t bg-purple-400 transition-all duration-200 hover:bg-purple-300"
                      style={{ height: `${(r.conversationCount / maxVal) * CHART_H}px` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* X-axis labels */}
            <div className="mt-1 flex gap-0.5">
              {rows.map((r, i) => (
                <div key={r.period} className="flex-1 truncate text-center" style={{ fontSize: '9px', color: 'var(--color-text-secondary, #9ca3af)' }}>
                  {showLabel(i) ? r.period.replace(/^\d{4}-/, '') : ''}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 border-t border-border-light px-6 py-3">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-blue-500" />
          <span className="text-xs text-text-secondary">Messages</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-purple-400" />
          <span className="text-xs text-text-secondary">Conversations</span>
        </div>
      </div>
    </div>
  );
}

function ActiveUsersCard() {
  const [win, setWin] = useState<Window>('week');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetActiveUsersStats(win, page, pageSize);

  const maxMessages = Math.max(1, ...(data?.data ?? []).map((r) => r.messageCount));
  const offset = (page - 1) * pageSize;

  return (
    <div className="rounded-lg border border-border-light bg-surface-primary shadow-sm">
      <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
        <h2 className="text-lg font-semibold text-text-primary">Active Users</h2>
        <WindowToggle window={win} onChange={(w) => { setWin(w); setPage(1); }} />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-light text-left text-text-secondary">
            <th className="w-10 px-6 py-3 font-medium">#</th>
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Email</th>
            <th className="px-6 py-3 font-medium">Messages</th>
            <th className="px-6 py-3 font-medium">Conversations</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {isLoading ? (
            <SkeletonRows cols={5} rows={pageSize} />
          ) : isError || !data ? (
            <tr><td colSpan={5} className="px-6 py-4 text-center text-red-500">Failed to load data.</td></tr>
          ) : data.data.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-4 text-center text-text-secondary">No data</td></tr>
          ) : (
            data.data.map((row, i) => (
              <tr key={row.userId} className="hover:bg-surface-hover">
                <td className="px-6 py-3 text-sm font-medium text-text-secondary">{offset + i + 1}</td>
                <td className="px-6 py-3 font-medium text-text-primary">{row.name}</td>
                <td className="px-6 py-3 text-text-secondary">{row.email}</td>
                <td className="px-6 py-2">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm text-text-primary">{row.messageCount.toLocaleString()}</span>
                    <HorizontalBar value={row.messageCount} max={maxMessages} colorClass="bg-blue-500" />
                  </div>
                </td>
                <td className="px-6 py-3 text-text-primary">{row.conversationCount.toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <TableFooter
        page={page}
        pageSize={pageSize}
        pagination={data?.pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    </div>
  );
}

function CategoryDistributionCard() {
  const [win, setWin] = useState<ExtendedWindow>('week');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetCategoryDistribution(win, page, pageSize);

  const maxCount = Math.max(1, ...(data?.data ?? []).map((r) => r.conversationCount));
  const pageTotal = (data?.data ?? []).reduce((s, r) => s + r.conversationCount, 0);

  return (
    <div className="rounded-lg border border-border-light bg-surface-primary shadow-sm">
      <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
        <h2 className="text-lg font-semibold text-text-primary">Questions by Category</h2>
        <ExtendedWindowToggle window={win} onChange={(w) => { setWin(w); setPage(1); }} />
      </div>

      <div className="divide-y divide-border-light">
        {isLoading ? (
          <div className="space-y-5 px-6 py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-2 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" style={{ width: `${40 + (i * 13) % 55}%` }} />
              </div>
            ))}
          </div>
        ) : isError || !data ? (
          <p className="px-6 py-4 text-center text-red-500">Failed to load data.</p>
        ) : data.data.length === 0 ? (
          <p className="px-6 py-4 text-center text-text-secondary">No data</p>
        ) : (
          data.data.map((row) => (
            <div key={row.category} className="flex items-center gap-4 px-6 py-3 hover:bg-surface-hover">
              <div className="w-40 flex-shrink-0 truncate text-sm font-medium text-text-primary" title={row.label}>
                {row.label}
              </div>
              <div className="flex-1">
                <HorizontalBar value={row.conversationCount} max={maxCount} colorClass="bg-blue-500" />
              </div>
              <div className="w-14 flex-shrink-0 text-right text-sm text-text-primary">
                {row.conversationCount.toLocaleString()}
              </div>
              <div className="w-14 flex-shrink-0 text-right text-xs text-text-secondary">
                {pageTotal > 0 ? ((row.conversationCount / pageTotal) * 100).toFixed(1) : '0.0'}%
              </div>
            </div>
          ))
        )}
      </div>

      <TableFooter
        page={page}
        pageSize={pageSize}
        pagination={data?.pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    </div>
  );
}

function FeedbackCard() {
  const [period, setPeriod] = useState<Period>('daily');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetFeedbackStats(period, page, pageSize);

  return (
    <div className="rounded-lg border border-border-light bg-surface-primary shadow-sm">
      <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
        <h2 className="text-lg font-semibold text-text-primary">Like / Dislike Rate</h2>
        <PeriodToggle period={period} onChange={(p) => { setPeriod(p); setPage(1); }} />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-light text-left text-text-secondary">
            <th className="px-6 py-3 font-medium">{PERIOD_LABEL[period]}</th>
            <th className="px-6 py-3 font-medium">👍 Likes</th>
            <th className="px-6 py-3 font-medium">👎 Dislikes</th>
            <th className="px-6 py-3 font-medium">Rated</th>
            <th className="w-52 px-6 py-3 font-medium">Sentiment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {isLoading ? (
            <SkeletonRows cols={5} rows={pageSize} />
          ) : isError || !data ? (
            <tr><td colSpan={5} className="px-6 py-4 text-center text-red-500">Failed to load data.</td></tr>
          ) : data.data.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-4 text-center text-text-secondary">No data</td></tr>
          ) : (
            data.data.map((row) => (
              <tr key={row.period} className="hover:bg-surface-hover">
                <td className="px-6 py-3 text-text-primary">{row.period}</td>
                <td className="px-6 py-3 font-medium text-green-500">{row.thumbsUp.toLocaleString()}</td>
                <td className="px-6 py-3 font-medium text-red-500">{row.thumbsDown.toLocaleString()}</td>
                <td className="px-6 py-3 text-text-primary">{row.total.toLocaleString()}</td>
                <td className="px-6 py-3">
                  <SentimentBar likes={row.thumbsUp} total={row.total} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <TableFooter
        page={page}
        pageSize={pageSize}
        pagination={data?.pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    </div>
  );
}

function HealthCard() {
  const [period, setPeriod] = useState<Period>('daily');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetHealthStats(period, page, pageSize);

  const totals = data?.totals ?? { conversations: 0, errors: 0, noResponse: 0, abandoned: 0 };

  return (
    <div className="rounded-lg border border-border-light bg-surface-primary shadow-sm">
      <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
        <h2 className="text-lg font-semibold text-text-primary">Conversation Health</h2>
        <PeriodToggle period={period} onChange={(p) => { setPeriod(p); setPage(1); }} />
      </div>

      {/* KPI tiles */}
      {!isLoading && !isError && data && data.data.length > 0 && (
        <div className="grid grid-cols-4 gap-4 border-b border-border-light p-4">
          <StatTile label="Conversations" value={totals.conversations} colorClass="text-blue-500" />
          <StatTile label="Errors" value={totals.errors} colorClass="text-red-500" />
          <StatTile label="No Response" value={totals.noResponse} colorClass="text-yellow-500" />
          <StatTile label="Abandoned" value={totals.abandoned} colorClass="text-orange-500" />
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-light text-left text-text-secondary">
            <th className="px-6 py-3 font-medium">{PERIOD_LABEL[period]}</th>
            <th className="px-6 py-3 font-medium">Conversations</th>
            <th className="px-6 py-3 font-medium">Errors</th>
            <th className="px-6 py-3 font-medium">No Response</th>
            <th className="px-6 py-3 font-medium">Abandoned</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {isLoading ? (
            <SkeletonRows cols={5} rows={pageSize} />
          ) : isError || !data ? (
            <tr><td colSpan={5} className="px-6 py-4 text-center text-red-500">Failed to load data.</td></tr>
          ) : data.data.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-4 text-center text-text-secondary">No data</td></tr>
          ) : (
            data.data.map((row) => (
              <tr key={row.period} className="hover:bg-surface-hover">
                <td className="px-6 py-3 text-text-primary">{row.period}</td>
                <td className="px-6 py-3 text-text-primary">{row.conversationCount.toLocaleString()}</td>
                <td className="px-6 py-3 font-medium text-red-500">{row.errorCount.toLocaleString()}</td>
                <td className="px-6 py-3 font-medium text-yellow-500">{row.noResponseCount.toLocaleString()}</td>
                <td className="px-6 py-3 font-medium text-orange-500">{row.abandonedCount.toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <TableFooter
        page={page}
        pageSize={pageSize}
        pagination={data?.pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    </div>
  );
}

function TokenUsageCard() {
  const [win, setWin] = useState<Window>('day');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetTokenUsageStats(win, page, pageSize);

  const maxTokens = Math.max(1, ...(data?.data ?? []).map((r) => r.totalTokens));

  return (
    <div className="rounded-lg border border-border-light bg-surface-primary shadow-sm">
      <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
        <h2 className="text-lg font-semibold text-text-primary">Token Usage by Model</h2>
        <WindowToggle window={win} onChange={(w) => { setWin(w); setPage(1); }} />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-light text-left text-text-secondary">
            <th className="px-6 py-3 font-medium">Model</th>
            <th className="px-6 py-3 font-medium">Prompt</th>
            <th className="px-6 py-3 font-medium">Completion</th>
            <th className="px-6 py-3 font-medium">Total</th>
            <th className="w-44 px-6 py-3 font-medium">Usage</th>
            <th className="px-6 py-3 font-medium">Est. Cost (USD)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {isLoading ? (
            <SkeletonRows cols={6} rows={pageSize} />
          ) : isError || !data ? (
            <tr><td colSpan={6} className="px-6 py-4 text-center text-red-500">Failed to load data.</td></tr>
          ) : data.data.length === 0 ? (
            <tr><td colSpan={6} className="px-6 py-4 text-center text-text-secondary">No data</td></tr>
          ) : (
            data.data.map((row) => (
              <tr key={row.model} className="hover:bg-surface-hover">
                <td className="px-6 py-3 font-medium text-text-primary">{row.model}</td>
                <td className="px-6 py-3 text-text-primary">{row.promptTokens.toLocaleString()}</td>
                <td className="px-6 py-3 text-text-primary">{row.completionTokens.toLocaleString()}</td>
                <td className="px-6 py-3 text-text-primary">{row.totalTokens.toLocaleString()}</td>
                <td className="px-6 py-2">
                  <HorizontalBar value={row.totalTokens} max={maxTokens} colorClass="bg-indigo-500" />
                </td>
                <td className="px-6 py-3 text-text-primary">${row.estimatedCostUSD.toFixed(4)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <TableFooter
        page={page}
        pageSize={pageSize}
        pagination={data?.pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />
    </div>
  );
}
