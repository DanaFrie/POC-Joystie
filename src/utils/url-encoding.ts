// URL encoding/decoding for child dashboard access (`/dashboard/child?token=`)
import { clientConfig } from '@/config/client.config';
import {
  parseBondingInviteQueryParams,
  preserveBondingInviteQueryParams,
  withBondingInviteQueryParams,
} from '@/lib/onboarding/bondingInviteUrl';
import { createContextLogger } from './logger';

const logger = createContextLogger('URL Encoding');

export { parseBondingInviteQueryParams, withBondingInviteQueryParams };

/** v0.3 onboarding funnel — child invite from parent bonding share */
export const ONBOARDING_CHILD_PATH = '/onboarding/child';

const CHILD_DASHBOARD_PATH = '/dashboard/child';

/** Onboarding placeholder ids — never embed in dashboard tokens. */
export function isDraftChildId(childId: string | null | undefined): boolean {
  return Boolean(childId && /^draft-/i.test(childId));
}

/**
 * Encode parent (+ optional child) into a compact URL-safe token.
 * Format: base64url(parentId|childId|expiresAt)
 * 1:1 parent↔child — challenge is resolved live via getActiveChallenge(parentId).
 * Valid for clientConfig.token.expirationDays (30).
 */
export function encodeParentToken(parentId: string, childId?: string): string {
  const expiresAt =
    Date.now() + clientConfig.token.expirationDays * 24 * 60 * 60 * 1000;

  const safeChildId = isDraftChildId(childId) ? '' : childId || '';
  const parts = [parentId, safeChildId, expiresAt.toString()];
  const compact = parts.join('|');
  return btoa(compact).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** Decode `/dashboard/child?token=` and validate expiration. */
export function decodeParentToken(token: string): {
  parentId: string;
  childId: string | null;
  expiresAt: number;
  isExpired: boolean;
} | null {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);

    if (!decoded.includes('|')) return null;

    const parts = decoded.split('|');

    // v0.3: parentId|childId|expiresAt
    // legacy v0.2: parentId|childId|challengeId|expiresAt (challengeId ignored)
    let parentId: string;
    let childId: string | null;
    let expiresAt: number;

    if (parts.length === 3) {
      parentId = parts[0];
      childId = parts[1] || null;
      expiresAt = parseInt(parts[2], 10);
    } else if (parts.length === 4) {
      parentId = parts[0];
      childId = parts[1] || null;
      expiresAt = parseInt(parts[3], 10);
    } else {
      return null;
    }

    if (!parentId || !expiresAt || Number.isNaN(expiresAt)) return null;

    return {
      parentId,
      childId,
      expiresAt,
      isExpired: Date.now() > expiresAt,
    };
  } catch (error) {
    logger.error('Error decoding parent token:', error);
    return null;
  }
}

/**
 * Child dashboard share URL — token valid 30 days.
 * Not bonding `?invite=` (that is onboarding-only).
 */
export function generateChildUrl(
  parentId: string,
  childId?: string,
  baseUrl?: string
): string {
  const token = encodeParentToken(parentId, childId);
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${CHILD_DASHBOARD_PATH}?token=${encodeURIComponent(token)}`;
}

/** Same-origin `/dashboard/child?token=` path for `router.push` / `replace`. */
export function childDashboardNavPath(parentId: string, childId?: string): string {
  const absolute = generateChildUrl(parentId, childId);
  try {
    const parsed = new URL(absolute);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return `${CHILD_DASHBOARD_PATH}?token=${encodeURIComponent(encodeParentToken(parentId, childId))}`;
  }
}

/**
 * Rebuild bonding child invite URL on the current origin (keeps `invite=` + cn/cg/pn/pg).
 * Onboarding / game only — not dashboard.
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
