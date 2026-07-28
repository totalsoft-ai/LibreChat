import { request } from 'librechat-data-provider';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, QueryObserverResult } from '@tanstack/react-query';

export type DocumentationItem = {
  title: string;
  link: string;
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
