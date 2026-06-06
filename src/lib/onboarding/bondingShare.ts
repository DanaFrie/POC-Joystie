import {
  getWhatsAppShareUrlForChild,
  markBondingWhatsAppShared,
  recordBondingInvite,
} from '@/lib/api/bonding';
import { getUser } from '@/lib/api/users';
import { getOnboardingFirstChildIndex } from '@/lib/onboarding/pickFirstChild';
import { getOnboardingChildIds } from '@/lib/onboarding/persistOnboardingAccount';
import { setBondingChildUrl } from '@/lib/onboarding/bondingInvite';
import { openWhatsAppChildInvite } from '@/lib/share/whatsapp';
import { getCurrentUserId } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('BondingShare');

const INVITE_ID_KEY = 'onboardingBondingInviteId';

export function setOnboardingBondingInviteId(inviteId: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(INVITE_ID_KEY, inviteId);
  }
}

export function getOnboardingBondingInviteId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(INVITE_ID_KEY);
}

function getSelectedChildId(): string | undefined {
  const ids = getOnboardingChildIds();
  const index = getOnboardingFirstChildIndex() ?? 0;
  return ids[index];
}

async function resolveParentName(parentId: string): Promise<string | undefined> {
  try {
    const profile = await getUser(parentId, false);
    if (!profile) return undefined;
    const full = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    return full || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Record bonding invite (Cloud Function) or fall back to client-side URL.
 */
export async function prepareBondingInvite(params: {
  childName: string;
  shareMode: 'together_now' | 'remind_later';
  remindAt?: string;
}): Promise<{ childUrl: string; inviteId?: string }> {
  const parentId = await getCurrentUserId();
  if (!parentId) {
    throw new Error('יש להירשם לפני שיתוף ההזמנה');
  }

  const childId = getSelectedChildId();
  const parentName = await resolveParentName(parentId);

  try {
    const result = await recordBondingInvite({
      childId,
      childName: params.childName,
      parentName,
      shareMode: params.shareMode,
      remindAt: params.remindAt,
      baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
    });
    setBondingChildUrl(result.childUrl);
    setOnboardingBondingInviteId(result.inviteId);
    return { childUrl: result.childUrl, inviteId: result.inviteId };
  } catch (error) {
    logger.warn('recordBondingInvite failed, using client URL:', error);
    const fallback = getWhatsAppShareUrlForChild({
      parentId,
      childId,
      childName: params.childName,
      parentName,
      baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
    });
    setBondingChildUrl(fallback.childUrl);
    return { childUrl: fallback.childUrl };
  }
}

export async function shareBondingViaWhatsApp(params: {
  childName: string;
  parentName?: string;
  childUrl: string;
}): Promise<void> {
  openWhatsAppChildInvite({
    childUrl: params.childUrl,
    childName: params.childName,
    parentName: params.parentName,
  });

  const inviteId = getOnboardingBondingInviteId();
  if (inviteId) {
    try {
      await markBondingWhatsAppShared(inviteId);
    } catch (error) {
      logger.warn('markBondingWhatsAppShared failed:', error);
    }
  }
}
