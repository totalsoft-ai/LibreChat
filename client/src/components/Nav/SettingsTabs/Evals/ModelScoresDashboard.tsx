import { useState, useEffect } from 'react';
import { useGetEvalsModelScoresQuery } from 'librechat-data-provider/react-query';

const getScoreStyle = (score: number) => {
  if (score >= 0.8) return { bar: 'bg-green-500', text: 'text-green-700 dark:text-green-400', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', card: 'border-green-200 dark:border-green-900/40 from-green-50 to-emerald-50 dark:from-green-900/15 dark:to-emerald-900/10' };
  if (score >= 0.6) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', card: 'border-amber-200 dark:border-amber-900/40 from-amber-50 to-yellow-50 dark:from-amber-900/15 dark:to-yellow-900/10' };
  if (score >= 0.4) return { bar: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', card: 'border-orange-200 dark:border-orange-900/40 from-orange-50 to-amber-50 dark:from-orange-900/15 dark:to-amber-900/10' };
  return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', card: 'border-red-200 dark:border-red-900/40 from-red-50 to-rose-50 dark:from-red-900/15 dark:to-rose-900/10' };
};

interface Props {
  endpoint?: string;
  repo?: string;
}

const PAGE_SIZE = 5;
const TOP_N = 10;

export default function ModelScoresDashboard({ endpoint = '', repo = '' }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGetEvalsModelScoresQuery({
    endpoint: endpoint || undefined,
    repo: repo || undefined,
  });

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [endpoint, repo]);

  const totalTests = data && data.length > 0 ? Math.max(...data.map((r) => Number(r.test_count))) : 0;
  const maxScore = 1;

  const top10 = data ? [...data].sort((a, b) => Number(b.latest_score) - Number(a.latest_score)).slice(0, TOP_N) : [];
  const totalPages = Math.ceil(top10.length / PAGE_SIZE);
  const pagedData = top10.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header + filtre */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Model Comparison</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Average score per AI model
            {data ? ` · ${data.length} models · ${totalTests} tests` : ''}
          </p>
        </div>
        <div />
      </div>


      {/* Empty state */}
      {!isLoading && !error && data && data.length === 0 && (
        <div className="rounded-xl border border-border-light bg-surface-primary p-10 text-center">
          <svg className="mx-auto h-8 w-8 text-text-secondary opacity-30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm text-text-secondary">No models found for the selected endpoint.</p>
        </div>
      )}

      {/* Bar chart CSS + clasament */}
      {!isLoading && !error && data && data.length > 0 && (
        <div key={page}>
          <div className="rounded-xl border border-border-light bg-surface-primary p-5">
            <p className="text-sm font-semibold text-text-primary mb-5">Score per model</p>
            <div className="space-y-3">
              {pagedData.map((row) => {
                return (
                  <div key={row.agent_model} className="flex items-start gap-3">
                    <div className="w-44 shrink-0 pt-1">
                      <span className="text-xs text-text-primary leading-snug font-medium">{row.agent_model}</span>
                      <span className="block text-xs text-text-secondary opacity-50">{row.test_count} tests</span>
                    </div>
                    <div className="flex flex-1 items-center gap-2 pt-1">
                      <div className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getScoreStyle(row.latest_score).bar}`}
                          style={{ width: `${Math.round((Number(row.latest_score) / maxScore) * 100)}%` }}
                        />
                      </div>
                      <span className={`w-10 shrink-0 text-right text-xs font-bold tabular-nums ${getScoreStyle(row.latest_score).text}`}>
                        {row.latest_score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Axis labels */}
            <div className="mt-3 ml-[188px] flex justify-between text-xs text-text-secondary">
              <span>0</span>
              <span>{(maxScore / 2).toFixed(2)}</span>
              <span>{Number(maxScore).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading bar chart skeleton */}
      {isLoading && (
        <div className="rounded-xl border border-border-light bg-surface-primary p-5 animate-pulse">
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700 mb-5" />
          <div className="space-y-3">
            {[80, 65, 52, 41, 28].map((w) => (
              <div key={w} className="flex items-center gap-3">
                <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="h-5 rounded-full bg-gray-200 dark:bg-gray-700" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-border-light px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                p === page
                  ? 'border-purple-600 bg-purple-600 text-white'
                  : 'border-border-light text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-border-light px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-5 text-center">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Failed to load data. Make sure{' '}
            <code className="font-mono text-xs">POSTGRES_EVALS_URI</code> is configured.
          </p>
        </div>
      )}
    </div>
  );
}
