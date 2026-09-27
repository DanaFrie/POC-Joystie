'use client';

import { useCallback } from 'react';
import type { LandingLocale } from '@/components/landing/LandingLocaleContext';
import { startMarketingExit } from '@/components/landing/useMarketingFadeNavigate';

/**
 * HE ↔ EN crosses the `/en` client layout. Next 13.4 client navigation
 * loads the other page chunk into the current webpack runtime and throws
 * `TypeError: i[e] is not a function`. Full load keeps a fresh runtime.
 */
export function useMarketingLocaleSwitch(currentLocale: LandingLocale) {
  return useCallback(
    (href: string, targetLocale: LandingLocale) => {
      if (targetLocale === currentLocale) return;
      if (typeof window === 'undefined') return;
      startMarketingExit(() => {
        window.location.assign(href);
      });
    },
    [currentLocale],
  );
}
