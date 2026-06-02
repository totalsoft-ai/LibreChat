import { useState } from 'react';
import {
  useGetEvalsModelScoresQuery,
  useGetEvalsFiltersQuery,
} from 'librechat-data-provider/react-query';

const ENDPOINT_LABELS: Record<string, string> = {
  '/debug/classify': 'Orchestrator - Routes',
  '/v1/chat/completions': 'Assistant with Knowledge',
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

export default function ModelScoresDashboard() {
  const [endpoint, setEndpoint] = useState('');
  const [category, setCategory] = useState('');

  const { data: filterOptions } = useGetEvalsFiltersQuery();
  const { data, isLoading, error } = useGetEvalsModelScoresQuery({
    endpoint: endpoint || undefined,
    category: category || undefined,
  });

  const best = data?.[0];
  const worst = data && data.length > 1 ? data[data.length - 1] : null;
  const totalRuns = data?.reduce((s, r) => s + Number(r.run_count), 0) ?? 0;
  const maxScore = data ? Math.max(...data.map((r) => Number(r.avg_score))) : 100;

  return (
    <div className="space-y-5">
      {/* Header + filtre */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Model Comparison</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Average score per AI model
            {data ? ` · ${data.length} models · ${totalRuns} runs` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border-light overflow-hidden text-sm">
            {filterOptions?.endpoints.map((ep, i) => (
              <button
                key={ep}
                onClick={() => setEndpoint(endpoint === ep ? '' : ep)}
                className={`px-3 py-2 transition-colors ${i > 0 ? 'border-l border-border-light' : ''} ${endpoint === ep ? 'bg-purple-600 text-white' : 'bg-surface-primary text-text-secondary hover:bg-surface-hover'}`}
              >
                {endpointLabel(ep)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards sumar */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border-light bg-surface-secondary p-5 animate-pulse">
              <div className="h-2.5 w-20 rounded bg-gray-200 dark:bg-gray-700 mb-3" />
              <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
              <div className="h-8 w-14 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className={`rounded-xl border bg-gradient-to-br p-5 ${getScoreStyle(best?.latest_score ?? 0).card}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">Best model</p>
            <p className="text-sm font-semibold text-text-primary mb-1 leading-snug">{best?.agent_model}</p>
            <p className={`text-3xl font-extrabold leading-none ${getScoreStyle(best?.latest_score ?? 0).text}`}>{best?.latest_score}</p>
            <p className="text-xs text-text-secondary mt-1">avg {best?.avg_score}</p>
          </div>

          <div className="rounded-xl border border-border-light bg-surface-secondary p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">Total runs</p>
            <p className="text-sm font-semibold text-text-secondary mb-1">{data.length} models evaluated</p>
            <p className="text-3xl font-extrabold leading-none text-text-primary">{totalRuns}</p>
          </div>

          {worst && (
            <div className={`rounded-xl border bg-gradient-to-br p-5 ${getScoreStyle(worst.latest_score).card}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">Worst model</p>
              <p className="text-sm font-semibold text-text-primary mb-1 leading-snug">{worst.agent_model}</p>
              <p className={`text-3xl font-extrabold leading-none ${getScoreStyle(worst.latest_score).text}`}>{worst.latest_score}</p>
              <p className="text-xs text-text-secondary mt-1">avg {worst.avg_score}</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Bar chart CSS + clasament */}
      {!isLoading && !error && data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Chart — 3/5 */}
          <div className="lg:col-span-3 rounded-xl border border-border-light bg-surface-primary p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-text-primary">Score per model</p>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded-full bg-gray-400 opacity-60" /> avg</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-4 rounded-full bg-blue-500" /> latest</span>
              </div>
            </div>
            <div className="space-y-3">
              {data.map((row) => {
                const style = getScoreStyle(row.avg_score);
                const pct = Math.round((Number(row.avg_score) / maxScore) * 100);
                return (
                  <div key={row.agent_model} className="flex items-start gap-3">
                    <div className="w-36 shrink-0 text-right pt-1">
                      <span className="text-xs text-text-secondary leading-snug">{row.agent_model}</span>
                      <span className="block text-xs text-text-secondary opacity-50">{row.run_count} runs</span>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 pt-1">
                      {/* Latest score bar */}
                      <div className="flex items-center gap-2">
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
                      {/* Avg score bar */}
                      <div className="flex items-center gap-2 opacity-50">
                        <div className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gray-400 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-text-secondary">
                          {row.avg_score}
                        </span>
                      </div>
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

          {/* Clasament — 2/5 */}
          <div className="lg:col-span-2 rounded-xl border border-border-light bg-surface-primary p-5">
            <p className="text-sm font-semibold text-text-primary mb-5">Ranking</p>
            <div className="space-y-3">
              {data.map((row, i) => {
                const style = getScoreStyle(row.avg_score);
                return (
                  <div key={row.agent_model} className="flex items-center gap-3">
                    <span className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-xs font-bold ${rankBadge(i)}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-xs font-medium text-text-primary leading-snug">
                          {row.agent_model}
                        </p>
                        <span className="shrink-0 text-xs text-text-secondary tabular-nums">{row.run_count} runs</span>
                      </div>
                      <div className="mt-1 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-1 rounded-full transition-all duration-500 ${getScoreStyle(row.latest_score).bar}`}
                          style={{ width: `${Math.round((Number(row.latest_score) / maxScore) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-0.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getScoreStyle(row.latest_score).badge}`}>
                        {row.latest_score}
                      </span>
                      <span className="text-xs text-text-secondary tabular-nums">avg {row.avg_score}</span>
                    </div>
                  </div>
                );
              })}
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
