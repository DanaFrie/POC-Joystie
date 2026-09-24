'use client';

import { useCallback } from 'react';
import type { LandingLocale } from '@/components/landing/LandingLocaleContext';
import { useMarketingFadeNavigate } from '@/components/landing/useMarketingFadeNavigate';

/**
 * Soft crossfade between HE ↔ EN marketing routes.
 */
export function useMarketingLocaleSwitch(currentLocale: LandingLocale) {
  const fadeNavigate = useMarketingFadeNavigate();

  return useCallback(
    (href: string, targetLocale: LandingLocale) => {
      if (targetLocale === currentLocale) return;
      fadeNavigate(href);
    },
    [currentLocale, fadeNavigate],
  );
}
