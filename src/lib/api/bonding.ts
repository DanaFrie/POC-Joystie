/**
 * Bonding invite API (calls Firebase Functions).
 */
import { getFunctionsInstance } from '@/lib/firebase';
import { readOnboardingBondingPublic } from '@/lib/game/bondingPublic';
import { httpsCallable } from 'firebase/functions';
import { buildWhatsAppShareUrl } from '@/lib/share/whatsapp';
import { getBondingShareBaseUrl } from '@/lib/share/bondingBaseUrl';
import { generateOnboardingChildUrl } from '@/utils/url-encoding';
import { isLocalDevHost } from '@/utils/is-local-dev-host';
import { createContextLogger } from '@/utils/logger';

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

/**
 * Client-side WhatsApp URL (same pattern as server).
 */
export function getWhatsAppShareUrlForChild(params: {
  parentId: string;
  childId?: string;
  challengeId?: string;
  childName?: string;
  parentName?: string;
  parentGender?: 'female' | 'male';
  baseUrl?: string;
}): { childUrl: string; whatsappShareUrl: string } {
  const childUrl = generateOnboardingChildUrl(
    params.parentId,
    params.childId,
    params.challengeId,
    params.baseUrl ?? getBondingShareBaseUrl()
  );
  const whatsappShareUrl = buildWhatsAppShareUrl({
    childUrl,
    childName: params.childName,
    parentName: params.parentName,
    parentGender: params.parentGender,
  });
  return { childUrl, whatsappShareUrl };
}

export async function recordBondingInvite(
  input: RecordBondingInviteInput
): Promise<RecordBondingInviteResult> {
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
  const functions = await getFunctionsInstance();
  const fn = httpsCallable<{ inviteId: string }, { ok: boolean }>(
    functions,
    'markBondingWhatsAppShared'
  );
  await fn({ inviteId });
}

export async function markBondingChildLinkOpened(inviteId: string): Promise<void> {
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

export async function resolveBondingGameRoom(
  input: ResolveBondingGameRoomInput
): Promise<ResolveBondingGameRoomResult> {
  if (isLocalDevHost()) {
    logger.log('resolveBondingGameRoom (local RTDB)', { parentId: input.parentId });
    const pub = await readOnboardingBondingPublic(input.parentId);
    return {
      parentId: input.parentId,
      inviteId: input.inviteId,
      childName: pub?.childName ?? null,
      parentName: pub?.parentName ?? null,
      roomId: pub?.roomId ?? null,
      joinCode: pub?.joinCode ?? null,
    };
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
  if (isLocalDevHost()) {
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
