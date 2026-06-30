import {
  getWhatsAppShareUrlForChild,
  markBondingWhatsAppShared,
  recordBondingInvite,
} from '@/lib/api/bonding';
import { getUser } from '@/lib/api/users';
import { getOnboardingFirstChildIndex } from '@/lib/onboarding/pickFirstChild';
import { getOnboardingChildIds } from '@/lib/onboarding/persistOnboardingAccount';
import { getOnboardingParentRole, parentRoleToGender } from '@/lib/onboarding/parentRole';
import { setBondingChildUrl, setBondingChildName } from '@/lib/onboarding/bondingInvite';
import { publishOnboardingBondingMeta } from '@/lib/game/bondingPublic';
import { getBondingShareBaseUrl } from '@/lib/share/bondingBaseUrl';
import { openWhatsAppChildInvite } from '@/lib/share/whatsapp';
import { getCurrentUserId } from '@/utils/auth';
import { rewriteOnboardingChildUrlToCurrentOrigin, withBondingInviteQueryParams } from '@/utils/url-encoding';
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

export function clearOnboardingBondingInviteId() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(INVITE_ID_KEY);
  }
}

function isLocalDevHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

function getSelectedChildId(): string | undefined {
  const ids = getOnboardingChildIds();
  const index = getOnboardingFirstChildIndex() ?? 0;
  return ids[index];
}

async function resolveParentGender(parentId: string): Promise<'female' | 'male'> {
  const role = getOnboardingParentRole();
  if (role) return parentRoleToGender(role);

  try {
    const profile = await getUser(parentId, false);
    if (profile?.gender === 'male' || profile?.gender === 'female') {
      return profile.gender;
    }
  } catch {
    // fall through
  }

  return 'male';
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
  childGender?: 'boy' | 'girl';
}): Promise<{ childUrl: string; inviteId?: string }> {
  const parentId = await getCurrentUserId();
  if (!parentId) {
    throw new Error('יש להירשם לפני שיתוף ההזמנה');
  }

  const childId = getSelectedChildId();
  const parentName = await resolveParentName(parentId);
  const parentGender = await resolveParentGender(parentId);
  const baseUrl = getBondingShareBaseUrl();

  const inviteMeta = {
    childName: params.childName,
    childGender: params.childGender,
    parentName,
    parentGender,
  };

  const finalizeChildUrl = (rawUrl: string) => {
    const onOrigin = rewriteOnboardingChildUrlToCurrentOrigin(rawUrl);
    return withBondingInviteQueryParams(onOrigin, inviteMeta);
  };

  const applyClientFallback = async () => {
    clearOnboardingBondingInviteId();
    const fallback = getWhatsAppShareUrlForChild({
      parentId,
      childId,
      childName: params.childName,
      parentName,
      parentGender,
      baseUrl,
    });
    const childUrl = finalizeChildUrl(fallback.childUrl);
    setBondingChildUrl(childUrl);
    setBondingChildName(params.childName);
    if (parentName) {
      await publishOnboardingBondingMeta(parentId, {
        childName: params.childName,
        parentName,
        parentGender,
      }).catch((e) => logger.warn('publishOnboardingBondingMeta failed', e));
    }
    return { childUrl };
  };

  if (isLocalDevHost()) {
    logger.log('local dev — client bonding URL (skip recordBondingInvite CORS)');
    return applyClientFallback();
  }

  try {
    const result = await recordBondingInvite({
      childId,
      childName: params.childName,
      parentName,
      parentGender,
      baseUrl,
    });
    const childUrl = finalizeChildUrl(result.childUrl);
    setBondingChildUrl(childUrl);
    setBondingChildName(params.childName);
    setOnboardingBondingInviteId(result.inviteId);
    if (parentName) {
      await publishOnboardingBondingMeta(parentId, {
        childName: params.childName,
        parentName,
        parentGender,
      }).catch((e) => logger.warn('publishOnboardingBondingMeta failed', e));
    }
    return { childUrl, inviteId: result.inviteId };
  } catch (error) {
    logger.warn('recordBondingInvite failed, using client URL:', error);
    return applyClientFallback();
  }
}

export function shareBondingViaWhatsApp(params: {
  childName: string;
  parentName?: string;
  parentGender?: 'female' | 'male';
  childUrl: string;
}): void {
  openWhatsAppChildInvite({
    childUrl: params.childUrl,
    childName: params.childName,
    parentName: params.parentName,
    parentGender: params.parentGender,
  });

  const inviteId = getOnboardingBondingInviteId();
  if (!inviteId) return;

  void markBondingWhatsAppShared(inviteId).catch((error) => {
    logger.warn('markBondingWhatsAppShared failed:', error);
  });
}
