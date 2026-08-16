import { markBondingWhatsAppShared, recordBondingInvite, resolveBondingInvite } from '@/lib/api/bonding';
import { getUser, updateUser } from '@/lib/api/users';
import { getOnboardingFirstChildIndex } from '@/lib/onboarding/pickFirstChild';
import { getOnboardingChildIds } from '@/lib/onboarding/persistOnboardingAccount';
import { getOnboardingParentRole, parentRoleToGender } from '@/lib/onboarding/parentRole';
import {
  getBondingChildUrl,
  setBondingChildUrl,
  setBondingChildName,
  setBondingChildGender,
} from '@/lib/onboarding/bondingInvite';
import { getBondingInviteIdFromUrl } from '@/lib/onboarding/bondingInviteUrl';
import { publishOnboardingBondingMeta } from '@/lib/game/bondingPublic';
import { resetOnboardingChildProgress } from '@/lib/onboarding/childProgress';
import { resetOnboardingParentProgress } from '@/lib/onboarding/parentProgress';
import { consumeLocalBondingInvite } from '@/lib/onboarding/localBondingInvite';
import { useRtdbBondingInvites } from '@/lib/onboarding/bondingInviteTransport';
import { getBondingShareBaseUrl } from '@/lib/share/bondingBaseUrl';
import { openWhatsAppChildInvite } from '@/lib/share/whatsapp';
import { getCurrentUserId } from '@/utils/auth';
import {
  ONBOARDING_CHILD_PATH,
  rewriteOnboardingChildUrlToCurrentOrigin,
  withBondingInviteQueryParams,
} from '@/utils/url-encoding';
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

async function candidateInviteIds(parentId: string): Promise<string[]> {
  const ids: string[] = [];
  const fromSession = getOnboardingBondingInviteId()?.trim();
  if (fromSession) ids.push(fromSession);
  const fromUrl = getBondingInviteIdFromUrl(getBondingChildUrl());
  if (fromUrl && !ids.includes(fromUrl)) ids.push(fromUrl);
  try {
    const profile = await getUser(parentId, false);
    const fromUser = profile?.bondingInviteId?.trim();
    if (fromUser && !ids.includes(fromUser)) ids.push(fromUser);
  } catch {
    // ignore
  }
  return ids;
}

async function findReusableInviteId(
  parentId: string,
  childName: string
): Promise<string | null> {
  const wanted = childName.trim();
  for (const inviteId of await candidateInviteIds(parentId)) {
    try {
      const resolved = await resolveBondingInvite(inviteId);
      if (resolved.parentId !== parentId) continue;
      const recorded = resolved.childName?.trim();
      if (recorded && wanted && recorded !== wanted) continue;
      return inviteId;
    } catch {
      // consumed, expired, or missing — try the next candidate
    }
  }
  return null;
}

async function tombstoneSupersededInvite(previousId: string | null, nextId: string): Promise<void> {
  const id = previousId?.trim();
  if (!id || id === nextId) return;
  if (!useRtdbBondingInvites()) return;
  try {
    await consumeLocalBondingInvite(id);
  } catch (error) {
    logger.warn('tombstone superseded invite failed', error);
  }
}

function cachePreparedInvite(params: {
  childUrl: string;
  inviteId: string;
  childName: string;
  childGender?: 'boy' | 'girl';
}): void {
  setBondingChildUrl(params.childUrl);
  setBondingChildName(params.childName);
  if (params.childGender) setBondingChildGender(params.childGender);
  setOnboardingBondingInviteId(params.inviteId);
}

/** Record bonding invite (or reuse a still-open one) and build `?invite=` child URL. */
export async function prepareBondingInvite(params: {
  childName: string;
  childGender?: 'boy' | 'girl';
}): Promise<{ childUrl: string; inviteId: string }> {
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

  const reusableId = await findReusableInviteId(parentId, params.childName);
  if (reusableId) {
    const childUrl = withBondingInviteQueryParams(
      rewriteOnboardingChildUrlToCurrentOrigin(
        `${baseUrl.replace(/\/$/, '')}${ONBOARDING_CHILD_PATH}?invite=${encodeURIComponent(reusableId)}`
      ),
      inviteMeta
    );
    cachePreparedInvite({
      childUrl,
      inviteId: reusableId,
      childName: params.childName,
      childGender: params.childGender,
    });
    try {
      await updateUser(parentId, { bondingInviteId: reusableId });
    } catch (error) {
      logger.warn('Could not persist reused bondingInviteId on user:', error);
    }
    logger.log('reused live bonding invite', { inviteId: reusableId });
    return { childUrl, inviteId: reusableId };
  }

  const previousIds = await candidateInviteIds(parentId);
  const result = await recordBondingInvite({
    childId,
    childName: params.childName,
    parentName,
    parentGender,
    baseUrl,
  });

  const childUrl = withBondingInviteQueryParams(
    rewriteOnboardingChildUrlToCurrentOrigin(result.childUrl),
    inviteMeta
  );

  cachePreparedInvite({
    childUrl,
    inviteId: result.inviteId,
    childName: params.childName,
    childGender: params.childGender,
  });

  try {
    await updateUser(parentId, { bondingInviteId: result.inviteId });
  } catch (error) {
    logger.warn('Could not persist bondingInviteId on user:', error);
  }

  await Promise.all(previousIds.map((id) => tombstoneSupersededInvite(id, result.inviteId)));

  // New invite id — clear prior child milestones before share (not after WhatsApp).
  try {
    await resetOnboardingChildProgress(parentId);
    await resetOnboardingParentProgress(parentId);
  } catch (error) {
    logger.warn('reset onboarding progress before invite failed', error);
  }

  if (parentName) {
    await publishOnboardingBondingMeta(parentId, {
      childName: params.childName,
      childGender: params.childGender,
      parentName,
      parentGender,
    }).catch((e) => logger.warn('publishOnboardingBondingMeta failed', e));
  }

  return { childUrl, inviteId: result.inviteId };
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
