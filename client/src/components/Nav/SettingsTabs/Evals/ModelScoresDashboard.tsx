import { useState } from 'react';
import {
  useGetEvalsModelScoresQuery,
  useGetEvalsFiltersQuery,
} from 'librechat-data-provider/react-query';

const ENDPOINT_LABELS: Record<string, string> = {
  '/debug/classify': 'Orchestrator - Routes',
  '/v1/chat/completions': 'Assistant with Knowledge',
};

const ENDPOINT_REPO_KEYWORD: Record<string, string> = {
  '/debug/classify': 'orchestrator',
  '/v1/chat/completions': 'assistant-with-knowledge',
};

const endpointLabel = (ep: string) => ENDPOINT_LABELS[ep] ?? ep;

const getScoreStyle = (score: number) => {
  if (score >= 0.8) return { bar: 'bg-green-500', text: 'text-green-700 dark:text-green-400', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', card: 'border-green-200 dark:border-green-900/40 from-green-50 to-emerald-50 dark:from-green-900/15 dark:to-emerald-900/10' };
  if (score >= 0.6) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', card: 'border-amber-200 dark:border-amber-900/40 from-amber-50 to-yellow-50 dark:from-amber-900/15 dark:to-yellow-900/10' };
  if (score >= 0.4) return { bar: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', card: 'border-orange-200 dark:border-orange-900/40 from-orange-50 to-amber-50 dark:from-orange-900/15 dark:to-amber-900/10' };
  return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', card: 'border-red-200 dark:border-red-900/40 from-red-50 to-rose-50 dark:from-red-900/15 dark:to-rose-900/10' };
};

const rankBadge = (i: number) => {
  if (i === 0) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  if (i === 1) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  if (i === 2) return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
  return 'bg-surface-secondary text-text-secondary';
};

interface Props {
  endpoint?: string;
  repo?: string;
}

const PAGE_SIZE = 5;
const TOP_N = 10;

export default function ModelScoresDashboard({ endpoint = '', repo = '' }: Props) {
  const [page, setPage] = useState(1);
  const { data: filterOptions } = useGetEvalsFiltersQuery();
  const { data, isLoading, error } = useGetEvalsModelScoresQuery({
    endpoint: endpoint || undefined,
    repo: repo || undefined,
  });

  const totalRuns = data?.reduce((s, r) => s + Number(r.run_count), 0) ?? 0;
  const totalTests = data ? Math.max(...data.map((r) => Number(r.test_count))) : 0;
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


      {/* Bar chart CSS + clasament */}
      {!isLoading && !error && data && data.length > 0 && (
        <div key={page}>
          <div className="rounded-xl border border-border-light bg-surface-primary p-5">
            <p className="text-sm font-semibold text-text-primary mb-5">Score per model</p>
            <div className="space-y-3">
              {pagedData.map((row) => {
                const style = getScoreStyle(row.avg_score);
                const pct = Math.round((Number(row.avg_score) / maxScore) * 100);
                return (
                  <div key={row.agent_model} className="flex items-start gap-3">
                    <div className="w-36 shrink-0 text-right pt-1">
                      <span className="text-xs text-text-secondary leading-snug">{row.agent_model}</span>
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
            <div className="mt-3 ml-[152px] flex justify-between text-xs text-text-secondary">
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Page <span className="font-medium text-text-primary">{page}</span> of{' '}
            <span className="font-medium text-text-primary">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border-light px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-border-light px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
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
