/**
 * Meta Pixel — client-only conversion events.
 * Pixel ID: `@/constants/meta-pixel` (used by root layout init).
 */

/**
 * Fire after signup succeeds only (not in catch/finally).
 * Sends standard event plus custom fallback in case standard event is restricted.
 */
export function trackMetaCompleteRegistration(
  params: Record<string, string | number | boolean> = { content_name: 'signup' }
): void {
  if (typeof window === 'undefined') return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === 'function') {
    // Some pixels/accounts suppress restricted standard events.
    // Keep a custom fallback so signup can still be measured in Events Manager.
    fbq('trackCustom', 'JoystieSignupSuccess', params);
  }
}
