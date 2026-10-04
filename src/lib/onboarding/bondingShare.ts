import { markBondingWhatsAppShared, recordBondingInvite, resolveBondingInvite } from '@/lib/api/bonding';
import { getUser, updateUser } from '@/lib/api/users';
import type { FirestoreUser } from '@/types/firestore';
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

async function loadParentProfile(parentId: string): Promise<FirestoreUser | null> {
  try {
    return await getUser(parentId, true);
  } catch {
    return null;
  }
}

function resolveParentGender(profile: FirestoreUser | null): 'female' | 'male' {
  const role = getOnboardingParentRole();
  if (role) return parentRoleToGender(role);
  if (profile?.gender === 'male' || profile?.gender === 'female') {
    return profile.gender;
  }
  return 'male';
}

function resolveParentName(profile: FirestoreUser | null): string | undefined {
  if (!profile) return undefined;
  const full = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  return full || undefined;
}

function candidateInviteIds(profile: FirestoreUser | null): string[] {
  const ids: string[] = [];
  const fromSession = getOnboardingBondingInviteId()?.trim();
  if (fromSession) ids.push(fromSession);
  const fromUrl = getBondingInviteIdFromUrl(getBondingChildUrl());
  if (fromUrl && !ids.includes(fromUrl)) ids.push(fromUrl);
  const fromUser = profile?.bondingInviteId?.trim();
  if (fromUser && !ids.includes(fromUser)) ids.push(fromUser);
  return ids;
}

async function findReusableInviteId(
  parentId: string,
  childName: string,
  inviteIds: string[]
): Promise<string | null> {
  const wanted = childName.trim();
  for (const inviteId of inviteIds) {
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

function persistInviteSideEffects(params: {
  parentId: string;
  inviteId: string;
  previousIds: string[];
  resetProgress: boolean;
  childName: string;
  childGender?: 'boy' | 'girl';
  parentName?: string;
  parentGender: 'female' | 'male';
}): void {
  void (async () => {
    try {
      await updateUser(params.parentId, { bondingInviteId: params.inviteId });
    } catch (error) {
      logger.warn('Could not persist bondingInviteId on user:', error);
    }

    await Promise.all(
      params.previousIds.map((id) => tombstoneSupersededInvite(id, params.inviteId))
    );

    if (params.resetProgress) {
      try {
        await resetOnboardingChildProgress(params.parentId);
        await resetOnboardingParentProgress(params.parentId);
      } catch (error) {
        logger.warn('reset onboarding progress before invite failed', error);
      }
    }

    if (params.parentName) {
      await publishOnboardingBondingMeta(params.parentId, {
        childName: params.childName,
        childGender: params.childGender,
        parentName: params.parentName,
        parentGender: params.parentGender,
      }).catch((e) => logger.warn('publishOnboardingBondingMeta failed', e));
    }
  })();
}

let prepareInFlight: {
  key: string;
  promise: Promise<{ childUrl: string; inviteId: string }>;
} | null = null;

function prepareInviteKey(params: { childName: string; childGender?: 'boy' | 'girl' }): string {
  return `${params.childName.trim()}|${params.childGender ?? ''}`;
}

/** Record bonding invite (or reuse a still-open one) and build `?invite=` child URL. */
export async function prepareBondingInvite(params: {
  childName: string;
  childGender?: 'boy' | 'girl';
}): Promise<{ childUrl: string; inviteId: string }> {
  const key = prepareInviteKey(params);
  if (prepareInFlight?.key === key) {
    return prepareInFlight.promise;
  }
  const promise = prepareBondingInviteOnce(params).finally(() => {
    if (prepareInFlight?.promise === promise) {
      prepareInFlight = null;
    }
  });
  prepareInFlight = { key, promise };
  return promise;
}

async function prepareBondingInviteOnce(params: {
  childName: string;
  childGender?: 'boy' | 'girl';
}): Promise<{ childUrl: string; inviteId: string }> {
  const parentId = await getCurrentUserId();
  if (!parentId) {
    throw new Error('יש להירשם לפני שיתוף ההזמנה');
  }

  const childId = getSelectedChildId();
  const profile = await loadParentProfile(parentId);
  const parentName = resolveParentName(profile);
  const parentGender = resolveParentGender(profile);
  const baseUrl = getBondingShareBaseUrl();
  const previousIds = candidateInviteIds(profile);

  const inviteMeta = {
    childName: params.childName,
    childGender: params.childGender,
    parentName,
    parentGender,
  };

  const reusableId = previousIds.length
    ? await findReusableInviteId(parentId, params.childName, previousIds)
    : null;
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
    persistInviteSideEffects({
      parentId,
      inviteId: reusableId,
      previousIds: [],
      resetProgress: false,
      childName: params.childName,
      childGender: params.childGender,
      parentName,
      parentGender,
    });
    logger.log('reused live bonding invite', { inviteId: reusableId });
    return { childUrl, inviteId: reusableId };
  }

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

  persistInviteSideEffects({
    parentId,
    inviteId: result.inviteId,
    previousIds,
    resetProgress: true,
    childName: params.childName,
    childGender: params.childGender,
    parentName,
    parentGender,
  });

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
