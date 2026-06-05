import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '~/hooks';
import { useGetEvalsFiltersQuery } from 'librechat-data-provider/react-query';
import ModelScoresDashboard from '~/components/Nav/SettingsTabs/Evals/ModelScoresDashboard';
import PRComparison from '~/components/Nav/SettingsTabs/Evals/PRComparison';
import EvalsTable from '~/components/Nav/SettingsTabs/Evals/EvalsTable';

const ENDPOINT_LABELS: Record<string, string> = {
  '/debug/classify': 'Orchestrator - Routes',
  '/v1/chat/completions': 'Assistant with Knowledge',
};

const ENDPOINT_REPO_KEYWORD: Record<string, string> = {
  '/debug/classify': 'orchestrator',
  '/v1/chat/completions': 'assistant-with-knowledge',
};

export default function EvalsPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const DEFAULT_ENDPOINT = '/debug/classify';

  const [endpoint, setEndpoint] = useState(DEFAULT_ENDPOINT);
  const [repo, setRepo] = useState('');
  const { data: filterOptions } = useGetEvalsFiltersQuery();

  useEffect(() => {
    if (filterOptions?.repos && !repo) {
      const keyword = ENDPOINT_REPO_KEYWORD[DEFAULT_ENDPOINT];
      const match = filterOptions.repos.find((r) => r.toLowerCase().includes(keyword));
      setRepo(match ?? '');
    }
  }, [filterOptions]);

  const selectEndpoint = (ep: string) => {
    if (endpoint === ep) { setEndpoint(''); setRepo(''); return; }
    setEndpoint(ep);
    const keyword = ENDPOINT_REPO_KEYWORD[ep];
    if (keyword && filterOptions?.repos) {
      const match = filterOptions.repos.find((r) => r.toLowerCase().includes(keyword));
      setRepo(match ?? '');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold text-text-primary">Access Denied</h1>
          <p className="text-text-secondary">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-surface-primary dark:bg-gray-900">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-border-light bg-surface-primary/95 backdrop-blur-sm dark:bg-gray-900/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center h-9 w-9 rounded-lg border border-border-light text-text-secondary hover:bg-surface-hover transition-colors"
                title="Back"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-text-primary leading-tight">Eval Baselines</h1>
            </div>
            <div className="flex rounded-lg border border-border-light overflow-hidden text-sm shrink-0">
              {filterOptions?.endpoints.map((ep, i) => (
                <button
                  key={ep}
                  onClick={() => selectEndpoint(ep)}
                  className={`px-4 py-2 transition-colors ${i > 0 ? 'border-l border-border-light' : ''} ${endpoint === ep ? 'bg-purple-600 text-white' : 'bg-surface-primary text-text-secondary hover:bg-surface-hover'}`}
                >
                  {ENDPOINT_LABELS[ep] ?? ep}
                </button>
              ))}
              <button
                disabled
                className="px-4 py-2 border-l border-border-light bg-surface-primary text-text-secondary opacity-40 cursor-not-allowed"
              >
                PPM
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

          <ModelScoresDashboard endpoint={endpoint} repo={repo} />

          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-border-light" />
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">PR vs Baseline Comparison</span>
            <div className="flex-1 border-t border-border-light" />
          </div>

          <PRComparison repo={repo} />

          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-border-light" />
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Run History</span>
            <div className="flex-1 border-t border-border-light" />
          </div>

          <EvalsTable endpoint={endpoint} repo={repo} />

        </div>
      </div>
    </div>
  );
}
