/**
 * Bonding invite API (calls Firebase Functions).
 */
import { getFunctionsInstance } from '@/lib/firebase';
import {
  readOnboardingBondingMeta,
  readOnboardingBondingPublic,
} from '@/lib/game/bondingPublic';
import {
  recordLocalBondingInvite,
  resolveLocalBondingInvite,
} from '@/lib/onboarding/localBondingInvite';
import { useRtdbBondingInvites } from '@/lib/onboarding/bondingInviteTransport';
import { httpsCallable } from 'firebase/functions';
import { createContextLogger } from '@/utils/logger';
import { INVITE_COMPLETED_ERROR_MESSAGE } from '@/lib/onboarding/inviteAccessErrors';

const logger = createContextLogger('BondingAPI');

export interface RecordBondingInviteInput {
  childId?: string;
  challengeId?: string;
  childName?: string;
  parentName?: string;
  parentGender?: 'female' | 'male';
  baseUrl?: string;
}

export interface RecordBondingInviteResult {
  inviteId: string;
  childUrl: string;
  whatsappShareUrl: string;
}

export interface ResolveBondingInviteResult {
  inviteId: string;
  parentId: string;
  childId: string | null;
  challengeId: string | null;
  childName: string | null;
  parentName: string | null;
}

export async function resolveBondingInvite(
  inviteId: string
): Promise<ResolveBondingInviteResult> {
  if (useRtdbBondingInvites()) {
    logger.log('resolveBondingInvite (RTDB)', { inviteId });
    return resolveLocalBondingInvite(inviteId);
  }
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<{ inviteId: string }, ResolveBondingInviteResult>(
    functions,
    'resolveBondingInvite'
  );
  logger.log('resolveBondingInvite', { inviteId });
  const { data } = await fn({ inviteId });
  return data;
}

export async function recordBondingInvite(
  input: RecordBondingInviteInput
): Promise<RecordBondingInviteResult> {
  if (useRtdbBondingInvites()) {
    logger.log('recordBondingInvite (RTDB)', { childId: input.childId });
    return recordLocalBondingInvite(input);
  }
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<RecordBondingInviteInput, RecordBondingInviteResult>(
    functions,
    'recordBondingInvite'
  );
  logger.log('recordBondingInvite', { childId: input.childId });
  const { data } = await fn(input);
  return data;
}

export async function markBondingWhatsAppShared(inviteId: string): Promise<void> {
  if (useRtdbBondingInvites()) return;
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<{ inviteId: string }, { ok: boolean }>(
    functions,
    'markBondingWhatsAppShared'
  );
  await fn({ inviteId });
}

export async function markBondingChildLinkOpened(inviteId: string): Promise<void> {
  if (useRtdbBondingInvites()) return;
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<{ inviteId: string }, { ok: boolean }>(
    functions,
    'markBondingChildLinkOpened'
  );
  await fn({ inviteId });
}

export interface ResolveBondingGameRoomInput {
  parentId: string;
  inviteId?: string;
}

export interface ResolveBondingGameRoomResult {
  parentId: string;
  inviteId?: string;
  childName: string | null;
  parentName: string | null;
  roomId: string | null;
  joinCode: string | null;
}

async function resolveBondingGameRoomFromRtdb(
  input: ResolveBondingGameRoomInput
): Promise<ResolveBondingGameRoomResult> {
  let childName: string | null = null;
  let parentName: string | null = null;

  if (input.inviteId) {
    try {
      const invite = await resolveLocalBondingInvite(input.inviteId);
      childName = invite.childName;
      parentName = invite.parentName;
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message === INVITE_COMPLETED_ERROR_MESSAGE || /completed|expired/i.test(message)) {
        throw error;
      }
    }
  }

  const pub = await readOnboardingBondingPublic(input.parentId);
  const meta = await readOnboardingBondingMeta(input.parentId);

  return {
    parentId: input.parentId,
    inviteId: input.inviteId,
    childName: pub?.childName ?? meta?.childName ?? childName,
    parentName: pub?.parentName ?? meta?.parentName ?? parentName,
    roomId: pub?.roomId ?? null,
    joinCode: pub?.joinCode ?? null,
  };
}

export async function resolveBondingGameRoom(
  input: ResolveBondingGameRoomInput
): Promise<ResolveBondingGameRoomResult> {
  if (useRtdbBondingInvites()) {
    logger.log('resolveBondingGameRoom (RTDB)', { parentId: input.parentId });
    return resolveBondingGameRoomFromRtdb(input);
  }
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<ResolveBondingGameRoomInput, ResolveBondingGameRoomResult>(
    functions,
    'resolveBondingGameRoom'
  );
  logger.log('resolveBondingGameRoom', { parentId: input.parentId });
  const { data } = await fn(input);
  return data;
}

export type ChildOnboardingMilestone =
  | 'link_opened'
  | 'egg_complete'
  | 'welcome_reached'
  | 'dori_revealed'
  | 'mission_ready'
  | 'change_selected'
  | 'parent_change_accepted'
  | 'parent_change_declined'
  | 'selfie_mission_done';

export async function reportChildOnboardingMilestone(input: {
  parentId: string;
  milestone: ChildOnboardingMilestone;
  changeText?: string;
}): Promise<{ ok: boolean; reason?: string }> {
  if (useRtdbBondingInvites()) {
    return { ok: true };
  }
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<
    { parentId: string; milestone: ChildOnboardingMilestone },
    { ok: boolean; reason?: string }
  >(functions, 'reportChildOnboardingMilestone');
  const { data } = await fn(input);
  return data;
}

export interface ChildOnboardingProgressResult {
  linkOpened: boolean;
  eggComplete: boolean;
}

export async function getChildOnboardingProgress(): Promise<ChildOnboardingProgressResult> {
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<Record<string, never>, ChildOnboardingProgressResult>(
    functions,
    'getChildOnboardingProgress'
  );
  const { data } = await fn({});
  return data;
}

export async function consumeBondingInvite(inviteId?: string | null): Promise<void> {
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<{ inviteId?: string }, { ok: boolean }>(
    functions,
    'consumeBondingInvite'
  );
  await fn(inviteId ? { inviteId } : {});
}
