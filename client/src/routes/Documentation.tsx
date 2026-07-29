import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '@librechat/client';
import {
  useGetDocumentationList,
  useGetCodaTitles,
  useGetConfluenceTitles,
} from '~/data-provider/Documentation';
import type { DocumentationItem } from '~/data-provider/Documentation';
import { useLocalize } from '~/hooks';

const PAGE_SIZE = 25;

type SourceLabel = 'Confluence' | 'Coda';
type SourceFilter = 'all' | SourceLabel;
type MergedItem = DocumentationItem & { sourceLabel: SourceLabel };

function buildMergedList(confluence: DocumentationItem[], coda: DocumentationItem[]): MergedItem[] {
  const merged: MergedItem[] = [
    ...confluence.map((item) => ({ ...item, sourceLabel: 'Confluence' as const })),
    ...coda.map((item) => ({ ...item, sourceLabel: 'Coda' as const })),
  ];
  merged.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  return merged;
}

// A query is treated as a link search if it looks like a URL/domain (e.g. "https://...",
// "www...." or "wiki.logo.com.tr/..."), otherwise it searches the title.
const LINK_QUERY_PATTERN = /^(https?:\/\/|www\.)|\.[a-z]{2,}(\/|$)/i;

function filterMergedList(items: MergedItem[], query: string, sourceFilter: SourceFilter) {
  let filtered = items;
  if (sourceFilter !== 'all') {
    filtered = filtered.filter((item) => item.sourceLabel === sourceFilter);
  }
  const normalized = query.trim().toLowerCase();
  if (normalized) {
    const searchByLink = LINK_QUERY_PATTERN.test(normalized);
    filtered = filtered.filter((item) =>
      searchByLink
        ? item.link.toLowerCase().includes(normalized)
        : item.title.toLowerCase().includes(normalized),
    );
  }
  return filtered;
}

function formatDate(date: string | null) {
  if (!date) {
    return '—';
  }
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
}

export default function Documentation() {
  const localize = useLocalize();
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetDocumentationList();
  // Background upgrade: swaps in real Coda/Confluence page titles once the (slower) APIs resolve.
  const { data: codaTitles } = useGetCodaTitles({ enabled: !isLoading && !isError });
  const { data: confluenceTitles } = useGetConfluenceTitles({ enabled: !isLoading && !isError });

  const coda = useMemo(() => codaTitles?.coda ?? data?.coda ?? [], [codaTitles?.coda, data?.coda]);
  const confluence = useMemo(
    () => confluenceTitles?.confluence ?? data?.confluence ?? [],
    [confluenceTitles?.confluence, data?.confluence],
  );
  const merged = useMemo(() => buildMergedList(confluence, coda), [confluence, coda]);
  const filtered = useMemo(
    () => filterMergedList(merged, query, sourceFilter),
    [merged, query, sourceFilter],
  );

  useEffect(() => {
    setPage(1);
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {localize('com_nav_documentation_list')}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {localize('com_nav_documentation_description')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={localize('com_nav_documentation_search_placeholder')}
              className="w-full rounded-md border border-border-light bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-56"
            />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
              className="flex-1 rounded-md border border-border-light bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{localize('com_nav_documentation_source_all')}</option>
              <option value="Confluence">{'Confluence'}</option>
              <option value="Coda">{'Coda'}</option>
            </select>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          )}
          {!isLoading && isError && (
            <p className="text-sm text-red-500">{localize('com_nav_documentation_error')}</p>
          )}
          {!isLoading && !isError && (
            <div className="overflow-hidden rounded-lg border border-border-light bg-surface-primary">
              {filtered.length === 0 ? (
                <p className="p-4 text-sm text-text-secondary">
                  {localize('com_nav_documentation_empty')}
                </p>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-light text-left text-text-secondary">
                        <th className="px-4 py-3 font-medium">
                          {localize('com_nav_documentation_column_title')}
                        </th>
                        <th className="w-32 px-4 py-3 font-medium">
                          {localize('com_nav_documentation_column_source')}
                        </th>
                        <th className="w-32 px-4 py-3 font-medium">
                          {localize('com_nav_documentation_column_date')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {pageItems.map((item) => (
                        <tr key={item.link} className="hover:bg-surface-hover">
                          <td className="px-4 py-3">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {item.title}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-text-secondary">{item.sourceLabel}</td>
                          <td className="px-4 py-3 text-text-secondary">{formatDate(item.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between border-t border-border-light px-4 py-3">
                    <span className="text-xs text-text-secondary">
                      {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}{' '}
                      {localize('com_ui_of')} {filtered.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded px-2 py-1 text-sm text-text-secondary hover:bg-surface-hover disabled:opacity-40"
                      >
                        ‹
                      </button>
                      <span className="px-2 text-sm text-text-primary">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="rounded px-2 py-1 text-sm text-text-secondary hover:bg-surface-hover disabled:opacity-40"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
