'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const MARKETING_EXIT_CLASS = 'marketing-locale-exit';
export const MARKETING_EXIT_MS = 200;

export function clearMarketingExit() {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove(MARKETING_EXIT_CLASS);
}

export function startMarketingExit(onDone?: () => void) {
  if (typeof window === 'undefined') {
    onDone?.();
    return;
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    onDone?.();
    return;
  }

  document.documentElement.classList.add(MARKETING_EXIT_CLASS);
  window.setTimeout(() => {
    onDone?.();
  }, MARKETING_EXIT_MS);
}

/**
 * Fade the current marketing screen out, then navigate.
 * Prefetches first so load feels shorter while the page is already dimmed.
 */
export function useMarketingFadeNavigate() {
  const router = useRouter();

  useEffect(() => {
    clearMarketingExit();
  }, []);

  return useCallback(
    (href: string) => {
      if (typeof window === 'undefined') return;

      try {
        router.prefetch(href);
      } catch {
        /* prefetch best-effort */
      }

      startMarketingExit(() => {
        router.push(href);
      });
    },
    [router],
  );
}
