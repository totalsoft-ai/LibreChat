import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import EventsTable from './EventsTable';

export default function Events() {
  const [activeTab, setActiveTab] = useState('auth');

  return (
    <div className="flex flex-col gap-5">
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Tabs.List className="inline-flex w-full items-center rounded-lg border border-border-light bg-surface-primary p-1 shadow-sm">
          <Tabs.Trigger
            value="auth"
            className="flex-1 rounded-md px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:text-text-primary data-[state=active]:bg-surface-secondary data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Auth Events</span>
            </div>
          </Tabs.Trigger>
          {/* Internal Events tab hidden */}
          {/* <Tabs.Trigger
            value="internal"
            className="flex-1 rounded-md px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:text-text-primary data-[state=active]:bg-surface-secondary data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Internal Events</span>
            </div>
          </Tabs.Trigger> */}
          <Tabs.Trigger
            value="logs"
            className="flex-1 rounded-md px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:text-text-primary data-[state=active]:bg-surface-secondary data-[state=active]:text-text-primary data-[state=active]:shadow-sm"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Error Logs</span>
            </div>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="auth" className="mt-5">
          <EventsTable type="auth" />
        </Tabs.Content>

        {/* Internal Events content hidden */}
        {/* <Tabs.Content value="internal" className="mt-5">
          <EventsTable type="internal" />
        </Tabs.Content> */}

        <Tabs.Content value="logs" className="mt-5">
          <EventsTable type="logs" />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
