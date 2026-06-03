import { useState } from 'react';
import { useGetEvalsPRComparisonQuery } from 'librechat-data-provider/react-query';

const formatDate = (ts: string) => {
  try {
    return new Date(ts).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return ts;
  }
};

const Delta = ({ pr, baseline }: { pr: number; baseline: number | null }) => {
  if (baseline === null) {
    return <span className="text-xs text-text-secondary">no baseline</span>;
  }
  const delta = Math.round((pr - baseline) * 100) / 100;
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
        +{delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-500 dark:text-red-400">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
        {delta}
      </span>
    );
  }
  return <span className="text-xs text-text-secondary">—</span>;
};

interface Props {
  repo?: string;
}

export default function PRComparison({ repo }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGetEvalsPRComparisonQuery({ repo: repo || undefined, page, pageSize: 5 });

  // Group by PR number
  const totalPages = data ? Math.ceil(data.total / 5) : 1;

  const prs = data?.data
    ? Object.values(
        data.data.reduce<Record<number, { pr_number: number; branch: string; repo: string; latest_timestamp: string; models: typeof data.data }>>((acc, row) => {
          if (!acc[row.pr_number]) {
            acc[row.pr_number] = {
              pr_number: row.pr_number,
              branch: row.branch,
              repo: row.repo,
              latest_timestamp: row.latest_timestamp,
              models: [],
            };
          }
          acc[row.pr_number].models.push(row);
          return acc;
        }, {}),
      ).sort((a, b) => b.pr_number - a.pr_number)
    : [] as { pr_number: number; branch: string; repo: string; latest_timestamp: string; models: typeof data.data }[];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary">PR Evals</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Score per model on PRs compared to the main branch baseline
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border-light bg-surface-primary p-5 animate-pulse">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700 mb-3" />
              <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-5 text-center">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load PR comparison data.</p>
        </div>
      )}

      {!isLoading && !error && prs.length === 0 && (
        <div className="rounded-xl border border-border-light bg-surface-primary p-10 text-center">
          <p className="text-sm text-text-secondary">No PR eval runs found.</p>
        </div>
      )}

      {!isLoading && !error && prs.map((pr) => (
        <div key={pr.pr_number} className="rounded-xl border border-border-light bg-surface-primary overflow-hidden">
          {/* PR header */}
          <div className="flex items-center justify-between px-5 py-3 bg-surface-secondary border-b border-border-light">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-purple-100 dark:bg-purple-900/30 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-400">
                PR #{pr.pr_number}
              </span>
              <span className="font-mono text-sm text-text-primary">{pr.branch}</span>
              <span className="text-xs text-text-secondary">{pr.repo}</span>
            </div>
            <span className="text-xs text-text-secondary">{formatDate(pr.latest_timestamp)}</span>
          </div>

          {/* Models table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Model</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Baseline</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">PR Score</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Improvement</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Tests</th>
              </tr>
            </thead>
            <tbody>
              {pr.models.map((row, idx) => (
                <tr
                  key={row.agent_model}
                  className={`border-b border-border-light last:border-0 ${idx % 2 === 0 ? '' : 'bg-surface-secondary/40'}`}
                >
                  <td className="px-5 py-3 font-medium text-text-primary">{row.agent_model}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-text-secondary">
                    {row.baseline_avg_score ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-text-primary">
                    {row.pr_avg_score}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Delta pr={row.pr_avg_score} baseline={row.baseline_avg_score} />
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-text-secondary">
                    {row.pr_test_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

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
    </div>
  );
}
