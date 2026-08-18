const DEFAULT_SHARE_BASE_URL = 'https://joystie.com';

/**
 * Origin for child invite links (copy + WhatsApp).
 * In the browser uses the current host (e.g. http://localhost:3000).
 * Override with NEXT_PUBLIC_BONDING_SHARE_BASE_URL for fixed staging/prod hosts.
 */
export function getBondingShareBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BONDING_SHARE_BASE_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return DEFAULT_SHARE_BASE_URL;
}
