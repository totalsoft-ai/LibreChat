import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from 'librechat-data-provider';
import type { TFile } from 'librechat-data-provider';

interface UseFileStatusPollingOptions {
  enabled?: boolean;
  pollInterval?: number;
  maxDuration?: number;
}

/**
 * Hook for polling file embedding status.
 * Automatically refetches files query when there are files being processed.
 * Stops polling when all files are embedded or max duration is reached.
 */
export const useFileStatusPolling = (
  files: TFile[],
  options: UseFileStatusPollingOptions = {},
) => {
  const { enabled = true, pollInterval = 3000, maxDuration = 300000 } = options; // 3s interval, 5min max
  const queryClient = useQueryClient();
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled || !files || !Array.isArray(files)) {
      return;
    }

    // Check if there are any files being processed (embedded === false)
    const hasProcessingFiles = files.some(
      (file) => file.embedded === false && file.filepath === 'vectordb',
    );

    if (!hasProcessingFiles) {
      // Clear interval if no files are processing
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start polling if not already started
    if (!intervalRef.current) {
      startTimeRef.current = Date.now();

      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;

        // Stop polling after max duration
        if (elapsed > maxDuration) {
          console.warn(
            `[useFileStatusPolling] Max polling duration (${maxDuration}ms) reached, stopping polling`,
          );
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        // Refetch files to check for updated status
        console.log('[useFileStatusPolling] Refetching files to check embedding status');
        queryClient.invalidateQueries([QueryKeys.files]);
      }, pollInterval);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, files, pollInterval, maxDuration, queryClient]);

  return {
    isPolling: intervalRef.current !== null,
  };
};

export default useFileStatusPolling;
