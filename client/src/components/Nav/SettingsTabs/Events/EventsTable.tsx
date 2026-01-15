import { useState, useMemo, useEffect } from 'react';
import {
  useGetEventsAuthQuery,
  useGetEventsInternalQuery,
  useGetEventsLogsQuery,
} from 'librechat-data-provider/react-query';
import type { EventsQueryParams } from 'librechat-data-provider';
import { dataService } from 'librechat-data-provider';

interface EventsTableProps {
  type: 'auth' | 'internal' | 'logs';
}

// Helper function to safely render any value
const safeRender = (value: any): string => {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

// Helper function to format timestamp safely
const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) {
    return '-';
  }
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return String(timestamp); // Return as-is if invalid
    }
    return date.toLocaleString();
  } catch (error) {
    return String(timestamp);
  }
};

export default function EventsTable({ type }: EventsTableProps) {
  const [page, setPage] = useState(1);
  const [userInput, setUserInput] = useState(''); // Input value (updates immediately)
  const [debouncedUser, setDebouncedUser] = useState(''); // Debounced value (updates after delay)
  const [filters, setFilters] = useState<Omit<EventsQueryParams, 'page' | 'pageSize' | 'user'>>({
    fromDate: '',
    toDate: '',
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState<string[]>([]);

  // Debounce user input (wait 500ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUser(userInput);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [userInput]);

  // Build query params
  const queryParams = useMemo(() => {
    const params: EventsQueryParams = {
      page,
      pageSize: 20,
    };
    if (debouncedUser.trim()) params.user = debouncedUser.trim();
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    return params;
  }, [page, debouncedUser, filters]);

  // Use appropriate hook based on type
  const query =
    type === 'auth'
      ? useGetEventsAuthQuery(queryParams)
      : type === 'internal'
        ? useGetEventsInternalQuery(queryParams)
        : useGetEventsLogsQuery(queryParams);

  const { data, isLoading, error, refetch } = query;

  // Fetch users from MongoDB for autocomplete
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch all users from MongoDB
        const response = await dataService.getUsers();
        if (response?.users && response.users.length > 0) {
          setUserSuggestions(response.users);
          console.log(`✅ Loaded ${response.users.length} users from MongoDB for autocomplete`);
        }
      } catch (error) {
        console.error('Failed to fetch users from MongoDB:', error);
        // Fallback: use users from current events data
        if (data?.data && data.data.length > 0) {
          const users = Array.from(new Set(data.data.map((event) => safeRender(event.user))))
            .filter((user) => user !== '-' && user.trim().length > 0)
            .sort();
          setUserSuggestions(users);
          console.log(`⚠️ Fallback: Using ${users.length} users from current events`);
        }
      }
    };

    fetchUsers();
  }, []);

  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!userInput.trim()) {
      // Show all users when input is empty (limited to 10)
      return userSuggestions.slice(0, 10);
    }
    const input = userInput.toLowerCase();
    return userSuggestions
      .filter((user) => user.toLowerCase().includes(input))
      .slice(0, 10); // Limit to 10 suggestions
  }, [userInput, userSuggestions]);

  // Debug: Log data structure
  if (data?.data) {
    console.log('[EventsTable] First event:', data.data[0]);
    console.log('[EventsTable] Pagination:', data.pagination);
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const toggleRowExpansion = (eventId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const isRowExpanded = (eventId: string) => expandedRows.has(eventId);

  // Export to CSV function - fetches ALL pages with current filters
  const handleExportCSV = async () => {
    if (!data?.pagination?.total || data.pagination.total === 0) {
      return;
    }

    try {
      setIsExporting(true);

      // Build query params for export (same filters, but get ALL results)
      const exportParams: EventsQueryParams = {
        page: 1,
        pageSize: Math.max(data.pagination.total, 10000), // Get all results (max 10000 safety limit)
      };
      if (debouncedUser.trim()) exportParams.user = debouncedUser.trim();
      if (filters.fromDate) exportParams.fromDate = filters.fromDate;
      if (filters.toDate) exportParams.toDate = filters.toDate;

      // Fetch all data based on type using dataService (includes auth)
      let allData;
      if (type === 'auth') {
        allData = await dataService.getEventsAuth(exportParams);
      } else if (type === 'internal') {
        allData = await dataService.getEventsInternal(exportParams);
      } else if (type === 'logs') {
        allData = await dataService.getEventsLogs(exportParams);
      }

      if (!allData?.data || allData.data.length === 0) {
        console.warn('No data to export');
        alert('No data available to export');
        return;
      }

      // CSV headers
      const headers = ['Timestamp', 'User', 'Event Type', 'Details'];

      // CSV rows
      const rows = allData.data.map((event: any) => {
        const timestamp = formatTimestamp(event.timestamp);
        const user = safeRender(event.user);
        const eventType = safeRender(event.eventType);
        const details = safeRender(event.details).replace(/"/g, '""'); // Escape quotes

        return [
          `"${timestamp}"`,
          `"${user}"`,
          `"${eventType}"`,
          `"${details}"`,
        ].join(',');
      });

      // Combine headers and rows
      const csv = [headers.join(','), ...rows].join('\n');

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const filename = `${type}-events-${new Date().toISOString().split('T')[0]}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`✅ Exported ${allData.data.length} ${type} events to CSV`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Card - Always visible */}
      <div className="rounded-lg border border-border-light bg-surface-primary p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-sm font-medium text-text-primary">Filters</span>
          </div>

          {/* Export CSV Button */}
          {!isLoading && data?.data && data.data.length > 0 && (
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600"
            >
              {isExporting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Export CSV ({data.pagination.total} events)</span>
                </>
              )}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              Search user
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter username or email..."
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  setShowUserDropdown(true);
                }}
                onFocus={() => setShowUserDropdown(true)}
                onBlur={() => {
                  // Delay to allow click on dropdown item
                  setTimeout(() => setShowUserDropdown(false), 200);
                }}
                className="w-full rounded-lg border border-border-light bg-surface-secondary px-3 py-2 pr-20 text-sm text-text-primary placeholder:text-text-secondary transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {userInput && (
                  <button
                    onClick={() => {
                      setUserInput('');
                      setShowUserDropdown(false);
                    }}
                    className="rounded-full p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="rounded-full p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  title={`${userSuggestions.length} users available`}
                >
                  <svg className={`h-4 w-4 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Dropdown with user suggestions */}
            {showUserDropdown && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-border-light bg-surface-primary shadow-lg max-h-60 overflow-y-auto">
                {filteredSuggestions.length > 0 ? (
                  <>
                    {filteredSuggestions.map((user, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setUserInput(user);
                          setShowUserDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover transition-colors flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <svg className="h-4 w-4 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">{user}</span>
                      </button>
                    ))}
                    {userSuggestions.length > 10 && (
                      <div className="px-3 py-2 text-xs text-text-secondary text-center border-t border-border-light">
                        Showing {Math.min(10, filteredSuggestions.length)} of {userSuggestions.length} users
                      </div>
                    )}
                  </>
                ) : userInput.trim() ? (
                  <div className="px-3 py-4 text-sm text-text-secondary text-center">
                    <svg className="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    No users found matching "{userInput}"
                  </div>
                ) : (
                  <div className="px-3 py-4 text-sm text-text-secondary text-center">
                    No users available in current results
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="min-w-[140px]">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              From date
            </label>
            <input
              type="date"
              value={filters.fromDate || ''}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              className="w-full rounded-lg border border-border-light bg-surface-secondary px-3 py-2 text-sm text-text-primary transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>
          <div className="min-w-[140px]">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              To date
            </label>
            <input
              type="date"
              value={filters.toDate || ''}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              className="w-full rounded-lg border border-border-light bg-surface-secondary px-3 py-2 text-sm text-text-primary transition-colors focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border-light bg-surface-primary p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border-light border-t-green-500"></div>
          <div className="text-sm font-medium text-text-secondary">Loading events...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
          <div className="mb-3 flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading events
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {(error as Error).message || 'An unexpected error occurred. Please try again.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry
          </button>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !error && (!data?.data || data.data.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border-light bg-surface-primary p-12">
          <svg
            className="h-12 w-12 text-text-secondary opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">No events found</p>
            <p className="mt-1 text-xs text-text-secondary">
              Try adjusting your filters or date range
            </p>
          </div>
        </div>
      )}

      {/* Table - Only show when data exists */}
      {!isLoading && !error && data?.data && data.data.length > 0 && (
        <>
          <div className="overflow-hidden rounded-lg border border-border-light shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Event Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light bg-surface-primary">
                  {data.data.map((event) => {
                    const eventType = safeRender(event.eventType).toLowerCase();
                    const getBadgeColor = () => {
                      if (eventType.includes('error')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                      if (eventType.includes('warn')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
                      if (eventType.includes('info')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
                      if (eventType.includes('debug')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
                      if (eventType.includes('login') || eventType.includes('auth')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                    };

                    return (
                      <tr
                        key={safeRender(event.id)}
                        className="transition-colors hover:bg-surface-hover"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-text-secondary">
                          {formatTimestamp(event.timestamp)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-text-primary">
                          {safeRender(event.user)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeColor()}`}>
                            {safeRender(event.eventType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-text-secondary">
                          {(() => {
                            const details = safeRender(event.details);
                            const isExpanded = isRowExpanded(safeRender(event.id));
                            const isLong = details.length > 150;

                            return (
                              <div className="max-w-2xl space-y-2">
                                <div
                                  className={`whitespace-pre-wrap break-words ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}
                                >
                                  {details}
                                </div>
                                {isLong && (
                                  <button
                                    onClick={() => toggleRowExpansion(safeRender(event.id))}
                                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <span>Show less</span>
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                      </>
                                    ) : (
                                      <>
                                        <span>Show more</span>
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface-primary p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-text-secondary">
              Showing <span className="font-medium text-text-primary">{(page - 1) * 20 + 1}</span> to{' '}
              <span className="font-medium text-text-primary">{Math.min(page * 20, data.pagination.total)}</span> of{' '}
              <span className="font-medium text-text-primary">{data.pagination.total}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-surface-primary px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-surface-primary"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <div className="flex items-center gap-1 rounded-lg border border-border-light bg-surface-secondary px-3 py-2">
                <span className="text-sm font-medium text-text-primary">Page {page}</span>
                <span className="text-sm text-text-secondary">of {data.pagination.totalPages || 0}</span>
              </div>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (data.pagination.totalPages || 0)}
                className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-surface-primary px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-surface-primary"
              >
                Next
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
