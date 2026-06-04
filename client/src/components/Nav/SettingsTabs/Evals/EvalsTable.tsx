import { useState, useMemo, useEffect } from 'react';
import {
  useGetEvalsBaselinesQuery,
  useGetEvalsFiltersQuery,
} from 'librechat-data-provider/react-query';
import type { EvalsQueryParams } from 'librechat-data-provider';


const formatTimestamp = (ts: string | null | undefined): string => {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? ts : d.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return ts;
  }
};

const ScoreBadge = ({ score }: { score: number }) => {
  let cls = '';
  if (score >= 0.8) cls = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  else if (score >= 0.6) cls = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  else if (score >= 0.4) cls = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  else cls = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${cls}`}>
      {score}
    </span>
  );
};

interface Props {
  endpoint?: string;
  repo?: string;
}

export default function EvalsTable({ endpoint: externalEndpoint = '', repo: externalRepo = '' }: Props) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<EvalsQueryParams, 'page' | 'pageSize'>>({});
  const [testNameInput, setTestNameInput] = useState('');

  const queryParams = useMemo<EvalsQueryParams>(
    () => ({
      page,
      pageSize: 20,
      ...filters,
      endpoint: filters.endpoint ?? (externalEndpoint || undefined),
      repo: filters.repo ?? (externalRepo || undefined),
    }),
    [page, filters, externalEndpoint, externalRepo],
  );

  // Reset page when global filters change
  useEffect(() => { setPage(1); }, [externalEndpoint, externalRepo]);

  const { data, isLoading, error, refetch } = useGetEvalsBaselinesQuery(queryParams);
  const { data: filterOptions } = useGetEvalsFiltersQuery();

  const set = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };


  const hasActiveFilters = Object.values(filters).some(Boolean);
  const { pagination } = data ?? {};

  return (
    <div className="space-y-4">
      {/* Filtre */}
      <div className="rounded-xl border border-border-light bg-surface-secondary p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: 'Model', key: 'agentModel' as const, opts: filterOptions?.agentModels ?? [] },
            { label: 'Branch', key: 'branch' as const, opts: filterOptions?.branches ?? [] },
          ].map(({ label, key, opts, labelFn, onChangeFn }: { label: string; key: keyof typeof filters; opts: string[]; labelFn?: (v: string) => string; onChangeFn?: (v: string) => void }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-secondary">{label}</label>
              <select
                value={(filters[key] as string) ?? ''}
                onChange={(e) => onChangeFn ? onChangeFn(e.target.value) : set(key, e.target.value)}
                className="rounded-lg border border-border-light bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="">All</option>
                {opts.map((o) => <option key={o} value={o}>{labelFn ? labelFn(o) : o}</option>)}
              </select>
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">From</label>
            <input type="date" value={filters.fromDate ?? ''} onChange={(e) => set('fromDate', e.target.value)}
              className="rounded-lg border border-border-light bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">To</label>
            <input type="date" value={filters.toDate ?? ''} onChange={(e) => set('toDate', e.target.value)}
              className="rounded-lg border border-border-light bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 min-w-[200px] max-w-sm items-center gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={testNameInput}
                onChange={(e) => setTestNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { set('testName', testNameInput); } }}
                placeholder="Search by test name…"
                className="w-full rounded-lg border border-border-light bg-surface-primary py-2 pl-8 pr-3 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
            <button
              onClick={() => set('testName', testNameInput)}
              className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
            >
              Search
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={() => { setFilters({}); setTestNameInput(''); setPage(1); }}
                className="text-xs text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-2 text-xs text-text-secondary hover:bg-surface-hover transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="rounded-xl border border-border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-secondary border-b border-border-light">
                {['Test Name', 'Score', 'Endpoint', 'Model', 'Branch', 'PR', 'Date'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-border-light animate-pulse">
                  {[...Array(11)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 rounded bg-gray-100 dark:bg-gray-800" style={{ width: `${40 + ((i + j) % 4) * 12}%` }} />
                    </td>
                  ))}
                </tr>
              ))}

              {error && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load data</p>
                      <p className="text-xs text-text-secondary">Make sure <code className="font-mono">POSTGRES_EVALS_URI</code> is configured correctly.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && data?.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-8 w-8 text-text-secondary opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm text-text-secondary">No results for the selected filters.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && data?.data.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-border-light transition-colors hover:bg-purple-50/40 dark:hover:bg-purple-900/5 ${idx % 2 === 0 ? 'bg-surface-primary' : 'bg-surface-secondary/40'}`}
                >
                  <td className="px-4 py-2.5 max-w-[220px]">
                    <span className="block truncate font-medium text-text-primary" title={row.test_name}>{row.test_name ?? '—'}</span>
                  </td>
                  <td className="px-4 py-2.5"><ScoreBadge score={row.score} /></td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-text-primary">{row.endpoint ?? '—'}</td>
                  <td className="px-4 py-2.5 text-text-primary">{row.agent_model ?? '—'}</td>
                  <td className="px-4 py-2.5 text-text-secondary">{row.branch ?? '—'}</td>
                  <td className="px-4 py-2.5 text-text-secondary">
                    {row.pr_number != null ? <span className="text-purple-600 dark:text-purple-400 font-medium">#{row.pr_number}</span> : '—'}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-xs text-text-secondary">{formatTimestamp(row.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginare */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">{pagination.total}</span> results · page{' '}
            <span className="font-medium text-text-primary">{pagination.page}</span> of{' '}
            <span className="font-medium text-text-primary">{pagination.totalPages}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="rounded-lg border border-border-light px-2.5 py-1.5 text-xs text-text-secondary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">«</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-lg border border-border-light px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === 'ellipsis' ? (
                  <span key={`e${idx}`} className="px-1 text-xs text-text-secondary">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      p === page ? 'border-purple-600 bg-purple-600 text-white' : 'border-border-light text-text-secondary hover:bg-surface-hover'
                    }`}>{p}</button>
                )
              )}
            <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
              className="rounded-lg border border-border-light px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
            <button onClick={() => setPage(pagination.totalPages)} disabled={page === pagination.totalPages}
              className="rounded-lg border border-border-light px-2.5 py-1.5 text-xs text-text-secondary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">»</button>
          </div>
        </div>
      )}
    </div>
  );
}
