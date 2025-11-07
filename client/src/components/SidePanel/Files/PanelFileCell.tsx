import type { Row } from '@tanstack/react-table';
import type { TFile } from 'librechat-data-provider';
import ImagePreview from '~/components/Chat/Input/Files/ImagePreview';
import FilePreview from '~/components/Chat/Input/Files/FilePreview';
import { getFileType } from '~/utils';

export default function PanelFileCell({ row }: { row: Row<TFile | undefined> }) {
  const file = row.original;

  // Determine if file is a document type that should be embedded in RAG
  const isDocument = file?.type && !file.type.startsWith('image');

  // Determine embedding status badge
  let embeddingBadge = null;
  if (isDocument) {
    if (file?.embedded === true) {
      embeddingBadge = (
        <span className="ml-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
          Indexat
        </span>
      );
    } else if (file?.embedded === false) {
      embeddingBadge = (
        <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Procesare RAG...
        </span>
      );
    }
  }

  return (
    <div className="flex w-full items-center gap-2">
      {file?.type?.startsWith('image') === true ? (
        <ImagePreview
          url={file.filepath}
          className="h-10 w-10 flex-shrink-0"
          source={file.source}
          alt={file.filename}
        />
      ) : (
        <FilePreview fileType={getFileType(file?.type)} file={file} />
      )}
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex items-center gap-1">
          <span className="block overflow-hidden truncate text-ellipsis whitespace-nowrap text-xs">
            {file?.filename}
          </span>
          {embeddingBadge}
        </div>
      </div>
    </div>
  );
}
