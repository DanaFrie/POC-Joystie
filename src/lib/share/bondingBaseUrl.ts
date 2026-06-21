import { isLocalDevHost } from '@/utils/is-local-dev-host';

const DEFAULT_SHARE_BASE_URL = 'https://joystie.com';

/**
 * Public origin for child invite links in WhatsApp/copy.
 * On localhost use a real https host — WhatsApp does not linkify localhost URLs.
 */
export function getBondingShareBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BONDING_SHARE_BASE_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;

  if (typeof window !== 'undefined') {
    if (isLocalDevHost()) return DEFAULT_SHARE_BASE_URL;
    return window.location.origin;
  }

  return DEFAULT_SHARE_BASE_URL;
}
