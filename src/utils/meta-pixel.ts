/**
 * Meta Pixel — client-only conversion events.
 * Pixel ID: `@/constants/meta-pixel` (used by root layout init).
 */

/**
 * Fire after signup succeeds only (not in catch/finally).
 * Standard event for Meta conversion optimization.
 */
export function trackMetaCompleteRegistration(
  params: Record<string, string | number | boolean> = { content_name: 'signup' }
): void {
  if (typeof window === 'undefined') return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === 'function') {
    fbq('track', 'CompleteRegistration', params);
  }
}
