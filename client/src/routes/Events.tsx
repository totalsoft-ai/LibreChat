import { useAuthContext } from '~/hooks';
import Events from '~/components/Nav/SettingsTabs/Events';

export default function EventsPage() {
  const { user } = useAuthContext();

  // Admin-only access check
  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Access Denied</h1>
          <p className="text-text-secondary">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 rounded-lg border border-border-light bg-gradient-to-r from-green-50 to-blue-50 p-6 shadow-sm dark:from-green-900/10 dark:to-blue-900/10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10 dark:bg-green-500/20">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-text-primary">Event Logs</h1>
                <p className="mt-1 text-sm text-text-secondary">
                  Monitor authentication events, application activities, and system errors in real-time
                </p>
              </div>
            </div>
          </div>

          <Events />
        </div>
      </div>
    </div>
  );
}
