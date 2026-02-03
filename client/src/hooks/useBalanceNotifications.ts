import { useEffect, useRef } from 'react';
import { useToastContext } from '@librechat/client';
import { useGetBalanceQuery } from 'librechat-data-provider';

/**
 * Balance notification thresholds configuration
 */
const THRESHOLDS = [
  {
    threshold: 5000,
    message: '⚠️ Tokens are approaching the limit',
    type: 'warning' as const,
  },
  {
    threshold: 2000, 
    message: '⚠️ You have only a few tokens left',
    type: 'warning' as const,
  },
  {
    threshold: 100, 
    message: '❌ You are close to reaching the limit',
    type: 'error' as const,
  },
] as const;

/**
 * Custom hook for balance polling and toast notifications
 *
 * Polls the /api/balance endpoint every 30 seconds and shows
 * toast notifications when balance drops below configured thresholds.
 *
 * Features:
 * - Automatic polling every 30 seconds
 * - Shows notifications only once per threshold
 * - Resets shown notifications when balance increases
 * - Handles authentication errors gracefully
 *
 * @param enabled - Whether to enable polling (default: true)
 * @param pollingInterval - Polling interval in milliseconds (default: 30000)
 */
export const useBalanceNotifications = (
  enabled = true,
  pollingInterval = 5000,
) => {
  const { showToast } = useToastContext();
  const shownThresholdsRef = useRef(new Set<number>());
  const previousBalanceRef = useRef<number | null>(null);

  // Query balance with refetch interval
  const { data: balanceData, isError, error } = useGetBalanceQuery({
    enabled,
    refetchInterval: enabled ? pollingInterval : false,
    refetchIntervalInBackground: true,
    retry: 1, // Retry only once on failure
    onError: (err: any) => {
      // Only log non-401 errors (401 means user is not authenticated)
      if (err?.response?.status !== 401) {
        console.error('[useBalanceNotifications] Failed to fetch balance:', err);
      }
    },
  });

  useEffect(() => {
    if (!enabled || !balanceData?.tokenCredits) {
      return;
    }

    const balance = balanceData.tokenCredits;
    const previousBalance = previousBalanceRef.current;

    // Reset shown thresholds if balance increased significantly
    // (e.g., after manual refill or auto-refill)
    if (previousBalance !== null && balance > previousBalance + 20000) {
      shownThresholdsRef.current.clear();
    }

    // Update previous balance
    previousBalanceRef.current = balance;

    // Check thresholds in order (highest to lowest)
    for (const threshold of THRESHOLDS) {
      // Show notification if balance is below threshold and not already shown
      if (balance <= threshold.threshold && !shownThresholdsRef.current.has(threshold.threshold)) {
        shownThresholdsRef.current.add(threshold.threshold);

        // Format balance for display
        const balanceUSD = (balance / 1000000).toFixed(4);
        const balanceFormatted = balance.toLocaleString();

        // Create message with balance
        const messageWithBalance = `${threshold.message}\nBalance: ${balanceFormatted}`;

        // Show toast notification
        showToast({
          message: messageWithBalance,
          status: threshold.type,
        });

        // Optional: Log for debugging
        console.warn(
          `[Balance Alert] ${threshold.message} (Balance: ${balance}`,
        );

        // Only show one notification per check
        break;
      }
    }
  }, [balanceData?.tokenCredits, enabled, showToast]);

  // Return balance data for optional display in UI
  return {
    balance: balanceData?.tokenCredits,
    autoRefillEnabled: balanceData?.autoRefillEnabled,
    isError,
    error,
  };
};
