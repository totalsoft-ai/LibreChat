import type { TFile } from 'librechat-data-provider';
import { useGetFiles } from '~/data-provider';
import { useFileStatusPolling } from '~/hooks/Files';
import { columns } from './PanelColumns';
import DataTable from './PanelTable';

export default function FilesPanel() {
  const { data: files = [] } = useGetFiles<TFile[]>(
    null  // Explicitly request only personal files (exclude workspace files)
  );

  // Enable polling for RAG processing files
  useFileStatusPolling(files, {
    enabled: true,
    pollInterval: 3000,    // Check every 3 seconds
    maxDuration: 300000,   // Stop after 5 minutes
  });

  return (
    <div className="h-auto max-w-full overflow-x-hidden">
      <DataTable columns={columns} data={files} />
    </div>
  );
}
