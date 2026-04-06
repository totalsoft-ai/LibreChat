import { Navigate } from 'react-router-dom';
import { useAuthContext } from '~/hooks';

export default function AnalyticsPage() {
  const { user } = useAuthContext();

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/c/new" replace={true} />;
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 rounded-lg border border-border-light bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-sm dark:from-blue-900/10 dark:to-purple-900/10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
                <p className="mt-1 text-sm text-text-secondary">
                  Usage statistics and insights
                </p>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Users', value: '—' },
              { label: 'Total Conversations', value: '—' },
              { label: 'Messages Today', value: '—' },
              { label: 'Active Sessions', value: '—' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border-light bg-surface-primary p-5 shadow-sm"
              >
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-text-primary">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Placeholder chart area */}
          <div className="rounded-lg border border-border-light bg-surface-primary p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">Activity Over Time</h2>
            <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border-light">
              <p className="text-sm text-text-secondary">Chart coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
