'use client';

import { useEffect } from 'react';
import { logEventOnce, type AnalyticsEventName } from '@/utils/analytics';

type TrackAnalyticsEventProps = {
  event: AnalyticsEventName;
  /** Defaults to `event` — use a more specific key when the same event can fire twice. */
  onceKey?: string;
  params?: Record<string, string | number | boolean>;
};

/** Fire a Firebase Analytics event once per tab session — deferred so landing paint is not blocked. */
export function TrackAnalyticsEvent({
  event,
  onceKey,
  params,
}: TrackAnalyticsEventProps) {
  useEffect(() => {
    const run = () => {
      void logEventOnce(onceKey ?? event, event, params);
    };

    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(run, { timeout: 5000 });
      return () => cancelIdleCallback(id);
    }

    const t = window.setTimeout(run, 2500);
    return () => window.clearTimeout(t);
    // Intentionally once on mount for this event key.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- page-view style
  }, [event, onceKey]);

  return null;
}
