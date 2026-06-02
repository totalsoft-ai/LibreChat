import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '~/hooks';
import ModelScoresDashboard from '~/components/Nav/SettingsTabs/Evals/ModelScoresDashboard';
import EvalsTable from '~/components/Nav/SettingsTabs/Evals/EvalsTable';

export default function EvalsPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

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
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600 shadow-md shadow-purple-500/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary leading-tight">Eval Baselines</h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Evaluation results per model, endpoint and category
              </p>
            </div>
          </div>

          <ModelScoresDashboard />

          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-border-light" />
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">All runs</span>
            <div className="flex-1 border-t border-border-light" />
          </div>

          <EvalsTable />

        </div>
      </div>
    </div>
  );
}
