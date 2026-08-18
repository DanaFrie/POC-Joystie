'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';

/** Routes that never use Google/Apple OAuth redirect — skip Auth bootstrap. */
const SKIP_OAUTH_PRIME_PATHS = new Set(['/onboarding/child']);

/**
 * Ensures OAuth redirect capture loads with the onboarding layout chunk.
 * Skipped on child funnel to avoid stale-session `accounts:lookup` noise.
 */
export function OAuthEarlyCapture() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (SKIP_OAUTH_PRIME_PATHS.has(pathname ?? '')) return;
    void import('@/lib/onboarding/oauthRedirectPrime');
  }, [pathname]);

  return null;
}
