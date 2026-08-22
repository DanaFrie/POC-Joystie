import { decodeParentToken, isDraftChildId } from '@/utils/url-encoding';
import { getChild, getChildrenByParent } from '@/lib/api/children';
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
  /** Parent אמא/אבא gender for child-facing copy. */
  parentGender?: 'male' | 'female';
};

/**
 * Validate `/dashboard/child?token=` — no parent Auth session required.
 * Challenge is resolved live by parentId (1:1) — not embedded in the token.
 */
export async function validateChildDashboardToken(
  token: string
): Promise<ChildDashboardTokenAccess> {
  const decoded = decodeParentToken(token.trim());
  if (!decoded) {
    return {
      isValid: false,
      error: 'בקשו מההורה לשלוח את הלינק פעם נוספת',
    };
  }

  if (decoded.isExpired) {
    return {
      isValid: false,
      error: 'הקישור פג תוקף. בקשו מההורה לשלוח את הלינק פעם נוספת',
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
      isDraftChildId(parent.primaryChildId) ? null : parent.primaryChildId || null,
    ].filter((id): id is string => Boolean(id?.trim()));

    for (const candidate of candidates) {
      const child = await getChild(candidate, false);
      if (child && child.parentId === parentId) {
        resolvedChildId = child.id;
        break;
      }
    }

    if (!resolvedChildId) {
      try {
        const kids = await getChildrenByParent(parentId);
        const match = kids.find((c) => c.parentId === parentId);
        if (match?.id) resolvedChildId = match.id;
      } catch (listError) {
        logger.warn('getChildrenByParent fallback failed:', listError);
      }
    }

    if (!resolvedChildId) {
      return {
        isValid: false,
        error: 'CHILD_NOT_READY',
      };
    }

    const parentGender =
      parent.gender === 'female' || parent.gender === 'male'
        ? parent.gender
        : undefined;

    return {
      isValid: true,
      parentId,
      childId: resolvedChildId,
      challengeEnabled,
      parentGender,
    };
  } catch (error) {
    logger.error('validateChildDashboardToken failed:', error);
    return { isValid: false, error: 'שגיאה באימות הקישור. נסו שוב.' };
  }
}
