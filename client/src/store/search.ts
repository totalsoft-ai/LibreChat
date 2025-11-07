import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type SearchState = {
  enabled: boolean | null;
  query: string;
  debouncedQuery: string;
  isSearching: boolean;
  isTyping: boolean;
};

// Main search state atom using Jotai
export const searchAtom = atom<SearchState>({
  enabled: null,
  query: '',
  debouncedQuery: '',
  isSearching: false,
  isTyping: false,
});

// Optional: Persist search preferences
export const searchEnabledAtom = atomWithStorage<boolean | null>('search-enabled', null);

// Derived atom for search query
export const searchQueryAtom = atom(
  (get) => get(searchAtom).query,
  (get, set, newQuery: string) => {
    set(searchAtom, { ...get(searchAtom), query: newQuery });
  },
);

// Derived atom for debounced query
export const searchDebouncedQueryAtom = atom(
  (get) => get(searchAtom).debouncedQuery,
  (get, set, newDebouncedQuery: string) => {
    set(searchAtom, { ...get(searchAtom), debouncedQuery: newDebouncedQuery });
  },
);

// Export for backward compatibility (will be removed after full migration)
export const search = searchAtom;

export default {
  search: searchAtom,
  searchAtom,
  searchEnabledAtom,
  searchQueryAtom,
  searchDebouncedQueryAtom,
};
