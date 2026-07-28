import { useMemo, useState } from 'react';
import { Spinner } from '@librechat/client';
import { useGetDocumentationList } from '~/data-provider/Documentation';
import type { DocumentationItem } from '~/data-provider/Documentation';
import { useLocalize } from '~/hooks';

function filterItems(items: DocumentationItem[], query: string) {
  if (!query.trim()) {
    return items;
  }
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => item.title.toLowerCase().includes(normalized));
}

function DocumentationSection({ title, items }: { title: string; items: DocumentationItem[] }) {
  const localize = useLocalize();
  return (
    <div className="rounded-lg border border-border-light bg-surface-primary p-4">
      <h2 className="mb-3 text-lg font-semibold text-text-primary">
        {title} <span className="text-sm font-normal text-text-secondary">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">{localize('com_nav_documentation_empty')}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.link}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Documentation() {
  const localize = useLocalize();
  const [query, setQuery] = useState('');
  const { data, isLoading, isError } = useGetDocumentationList();

  const filteredConfluence = useMemo(
    () => filterItems(data?.confluence ?? [], query),
    [data?.confluence, query],
  );
  const filteredCoda = useMemo(() => filterItems(data?.coda ?? [], query), [data?.coda, query]);

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

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={localize('com_nav_documentation_search_placeholder')}
            className="w-full rounded-md border border-border-light bg-surface-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          )}
          {!isLoading && isError && (
            <p className="text-sm text-red-500">{localize('com_nav_documentation_error')}</p>
          )}
          {!isLoading && !isError && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DocumentationSection title="Confluence" items={filteredConfluence} />
              <DocumentationSection title="Coda" items={filteredCoda} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
