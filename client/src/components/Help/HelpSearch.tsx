import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '~/hooks/Help';
import { cn } from '~/utils';

interface DocSection {
  id: string;
  title: string;
  order: number;
  filename: string;
}

interface SearchResult {
  id: string;
  title: string;
  score: number;
}

interface HelpSearchProps {
  sections: DocSection[];
  onSelectResult: (sectionId: string) => void;
}

/**
 * Simple fuzzy search implementation
 * Returns a score between 0 and 1 (higher is better match)
 */
function fuzzySearch(searchTerm: string, text: string): number {
  const search = searchTerm.toLowerCase();
  const target = text.toLowerCase();

  // Exact match
  if (target === search) {
    return 1;
  }

  // Contains exact phrase
  if (target.includes(search)) {
    return 0.8;
  }

  // Fuzzy match - check if all characters appear in order
  let searchIndex = 0;
  let matches = 0;

  for (let i = 0; i < target.length && searchIndex < search.length; i++) {
    if (target[i] === search[searchIndex]) {
      matches++;
      searchIndex++;
    }
  }

  if (searchIndex === search.length) {
    // All characters found in order
    return 0.5 * (matches / target.length);
  }

  return 0;
}

export default function HelpSearch({ sections, onSelectResult }: HelpSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 200);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search results
  const results = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      return [];
    }

    const searchResults: SearchResult[] = sections
      .map((section) => ({
        id: section.id,
        title: section.title,
        score: fuzzySearch(debouncedSearch, section.title),
      }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Limit to top 5 results

    return searchResults;
  }, [debouncedSearch, sections]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectResult = (sectionId: string) => {
    onSelectResult(sectionId);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full rounded-md border-0 bg-white py-2 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:placeholder:text-gray-500 dark:focus:ring-green-500 sm:text-sm sm:leading-6"
          placeholder="Search documentation... (Ctrl+K)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          aria-label="Search documentation"
          aria-expanded={isOpen && results.length > 0}
          aria-controls="search-results"
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-500" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {isOpen && results.length > 0 && (
        <div
          id="search-results"
          className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700"
          role="listbox"
        >
          <ul className="max-h-60 overflow-auto rounded-md py-1 text-base focus:outline-none sm:text-sm">
            {results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  className="relative w-full cursor-pointer select-none px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSelectResult(result.id)}
                  role="option"
                  aria-selected="false"
                >
                  <div className="flex items-center justify-between">
                    <span className="block truncate text-gray-900 dark:text-white">
                      {result.title}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(result.score * 100)}% match
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results message */}
      {isOpen && debouncedSearch.length >= 2 && results.length === 0 && (
        <div
          className="absolute z-10 mt-2 w-full rounded-md bg-white px-4 py-3 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700"
          role="status"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No results found for &quot;{debouncedSearch}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
