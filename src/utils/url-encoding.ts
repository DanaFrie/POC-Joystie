// URL encoding/decoding for v0.2 child setup/redemption (`/child?token=`)
import { clientConfig } from '@/config/client.config';
import {
  parseBondingInviteQueryParams,
  preserveBondingInviteQueryParams,
  withBondingInviteQueryParams,
} from '@/lib/onboarding/bondingInviteUrl';
import { createContextLogger } from './logger';

const logger = createContextLogger('URL Encoding');

export { parseBondingInviteQueryParams, withBondingInviteQueryParams };

/**
 * Encode parent ID, child ID, and optional challenge ID into compact URL-safe token.
 * Format: base64url(parentId|childId|challengeId|expiresAt)
 * Used by `/child` setup + redemption only.
 */
export function encodeParentToken(
  parentId: string,
  childId?: string,
  challengeId?: string
): string {
  const expiresAt = Date.now() + clientConfig.token.expirationDays * 24 * 60 * 60 * 1000;

  const parts = [parentId, childId || '', challengeId || '', expiresAt.toString()];
  const compact = parts.join('|');
  const encoded = btoa(compact)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return encoded;
}

/** Decode `/child?token=` and validate expiration. */
export function decodeParentToken(token: string): {
  parentId: string;
  childId: string | null;
  challengeId: string | null;
  timestamp: number;
  expiresAt: number;
  isExpired: boolean;
} | null {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);

    if (!decoded.includes('|')) {
      return null;
    }

    const parts = decoded.split('|');
    if (parts.length !== 4) {
      return null;
    }

    const parentId = parts[0];
    const childId = parts[1] || null;
    const challengeId = parts[2] || null;
    const expiresAt = parseInt(parts[3], 10);

    if (!parentId || !expiresAt || isNaN(expiresAt)) {
      return null;
    }

    const now = Date.now();
    const isExpired = now > expiresAt;

    return {
      parentId,
      childId,
      challengeId,
      timestamp: Date.now(),
      expiresAt,
      isExpired,
    };
  } catch (error) {
    logger.error('Error decoding parent token:', error);
    return null;
  }
}

const CHILD_PATH = '/child';

/** v0.3 onboarding funnel — child invite from parent bonding share */
export const ONBOARDING_CHILD_PATH = '/onboarding/child';

/**
 * Generate the v0.2 child URL (setup and redemption use the same link).
 */
export function generateChildUrl(
  parentId: string,
  childId?: string,
  challengeId?: string,
  baseUrl?: string
): string {
  const token = encodeParentToken(parentId, childId, challengeId);
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${CHILD_PATH}?token=${encodeURIComponent(token)}`;
}

/**
 * Rebuild bonding child invite URL on the current origin (keeps `invite=` + cn/cg/pn/pg).
 */
export function rewriteOnboardingChildUrlToCurrentOrigin(urlOrToken: string): string {
  if (typeof window === 'undefined' || !urlOrToken.trim()) return urlOrToken;

  try {
    const parsed = new URL(urlOrToken, window.location.origin);
    const inviteId = parsed.searchParams.get('invite');
    if (!inviteId) return urlOrToken;
    const base = `${window.location.origin}${ONBOARDING_CHILD_PATH}?invite=${encodeURIComponent(inviteId)}`;
    return preserveBondingInviteQueryParams(urlOrToken, base);
  } catch {
    return urlOrToken;
  }
}

/** Ball-game route — carries bonding `invite` + display query params. */
export function buildGameChildUrlWithInvite(inviteId: string): string {
  const encoded = encodeURIComponent(inviteId);
  if (typeof window === 'undefined') {
    return `/game/child?invite=${encoded}`;
  }
  const base = `${window.location.origin}/game/child?invite=${encoded}`;
  return preserveBondingInviteQueryParams(window.location.href, base);
}
