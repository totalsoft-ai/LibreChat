import { useEffect, useRef } from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { useGetEndpointHealthQuery } from '~/data-provider';
import { useLocalize } from '~/hooks';

/**
 * Displays a global, auto-clearing banner naming the AI endpoint(s) currently flagged as
 * unavailable by the server-side circuit-breaker. Visible to every user; disappears
 * automatically once the service(s) recover (the server flag expires).
 */
export const EndpointHealthBanner = ({
  onHeightChange,
}: {
  onHeightChange?: (height: number) => void;
}) => {
  const localize = useLocalize();
  const { data } = useGetEndpointHealthQuery();
  const bannerRef = useRef<HTMLDivElement>(null);

  const unavailable = data?.unavailable ?? [];
  const endpoints = unavailable.map((item) => item.endpoint).filter(Boolean);

  useEffect(() => {
    if (onHeightChange) {
      onHeightChange(
        bannerRef.current && endpoints.length > 0 ? bannerRef.current.offsetHeight : 0,
      );
    }
  }, [endpoints.length, onHeightChange]);

  if (endpoints.length === 0) {
    return null;
  }

  const message =
    endpoints.length === 1
      ? localize('com_ui_endpoint_unavailable_banner', { 0: endpoints[0] })
      : localize('com_ui_endpoints_unavailable_banner', { 0: endpoints.join(', ') });

  return (
    <div
      ref={bannerRef}
      role="alert"
      aria-live="polite"
      className="sticky top-0 z-20 flex items-center bg-red-700 px-2 py-1 text-slate-50 dark:bg-red-800 dark:text-white md:relative"
    >
      <AlertTriangleIcon className="ml-2 h-4 w-4 flex-shrink-0" />
      <div className="w-full truncate px-4 text-center text-sm">{message}</div>
    </div>
  );
};
