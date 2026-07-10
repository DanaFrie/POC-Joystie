import { decodeParentToken } from '@/utils/url-encoding';
import { getChild } from '@/lib/api/children';
import { getUser } from '@/lib/api/users';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ChildDashboardToken');

export type ChildDashboardTokenAccess = {
  isValid: boolean;
  error?: string;
  parentId?: string;
  childId?: string | null;
  /** Parent paid / unlocked — drives challenge UI on child dashboard. */
  challengeEnabled?: boolean;
};

function isDraftChildId(childId: string | null | undefined): boolean {
  return Boolean(childId && /^draft-/i.test(childId));
}

/**
 * Validate `/dashboard/child?token=` — no parent Auth session required.
 * Challenge is resolved live by parentId (1:1) — not embedded in the token.
 */
export async function validateChildDashboardToken(
  token: string
): Promise<ChildDashboardTokenAccess> {
  const decoded = decodeParentToken(token.trim());
  if (!decoded) {
    return { isValid: false, error: 'כתובת לא תקינה' };
  }

  if (decoded.isExpired) {
    return {
      isValid: false,
      error: 'הקישור פג תוקף. בקש קישור חדש מההורה שלך.',
    };
  }

  const { parentId, childId } = decoded;

  try {
    const parent = await getUser(parentId, false);
    if (!parent) {
      return { isValid: false, error: 'לא נמצא חשבון הורה לקישור זה.' };
    }

    const challengeEnabled =
      Boolean(parent.challengeUnlocked) ||
      parent.subscription?.status === 'trialing' ||
      parent.subscription?.status === 'active';

    // Prefer real Firestore child — ignore onboarding draft-* ids in old tokens.
    let resolvedChildId: string | null = null;
    const candidates = [
      isDraftChildId(childId) ? null : childId,
      parent.primaryChildId || null,
    ].filter((id): id is string => Boolean(id?.trim()));

    for (const candidate of candidates) {
      const child = await getChild(candidate, false);
      if (child && child.parentId === parentId) {
        resolvedChildId = child.id;
        break;
      }
    }

    if (!resolvedChildId) {
      return {
        isValid: false,
        error: 'CHILD_NOT_READY',
      };
    }

    return {
      isValid: true,
      parentId,
      childId: resolvedChildId,
      challengeEnabled,
    };
  } catch (error) {
    logger.error('validateChildDashboardToken failed:', error);
    return { isValid: false, error: 'שגיאה באימות הקישור. נסו שוב.' };
  }
}
