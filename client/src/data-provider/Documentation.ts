import { request } from 'librechat-data-provider';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, QueryObserverResult } from '@tanstack/react-query';

export type DocumentationItem = {
  title: string;
  link: string;
  date: string | null;
};

export type DocumentationList = {
  confluence: DocumentationItem[];
  coda: DocumentationItem[];
};

export const useGetDocumentationList = (
  config?: UseQueryOptions<DocumentationList>,
): QueryObserverResult<DocumentationList> => {
  return useQuery<DocumentationList>(
    ['documentation-list'],
    () => request.get('/api/documentation'),
    { refetchOnWindowFocus: false, ...config },
  );
};

export type CodaTitles = { coda: DocumentationItem[] };

/** Resolves real Coda page titles in the background; slower, meant to upgrade the heuristic titles. */
export const useGetCodaTitles = (
  config?: UseQueryOptions<CodaTitles>,
): QueryObserverResult<CodaTitles> => {
  return useQuery<CodaTitles>(
    ['documentation-coda-titles'],
    () => request.get('/api/documentation/coda-titles'),
    { refetchOnWindowFocus: false, retry: false, ...config },
  );
};

export type ConfluenceTitles = { confluence: DocumentationItem[] };

/** Resolves real Confluence page titles in the background; slower, meant to upgrade the heuristic titles. */
export const useGetConfluenceTitles = (
  config?: UseQueryOptions<ConfluenceTitles>,
): QueryObserverResult<ConfluenceTitles> => {
  return useQuery<ConfluenceTitles>(
    ['documentation-confluence-titles'],
    () => request.get('/api/documentation/confluence-titles'),
    { refetchOnWindowFocus: false, retry: false, ...config },
  );
};
