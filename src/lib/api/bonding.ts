/**
 * Bonding invite API (calls Firebase Functions).
 */
import { getFunctionsInstance } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { buildWhatsAppShareUrl } from '@/lib/share/whatsapp';
import { generateChildUrl } from '@/utils/url-encoding';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('BondingAPI');

export interface RecordBondingInviteInput {
  childId?: string;
  challengeId?: string;
  childName?: string;
  parentName?: string;
  baseUrl?: string;
  /** Default: together_now — open WhatsApp while with child */
  shareMode?: 'together_now' | 'remind_later';
  /** ISO datetime — required for remind_later (parent picks when they expect to be together) */
  remindAt?: string;
}

export interface RecordBondingInviteResult {
  inviteId: string;
  childUrl: string;
  whatsappShareUrl: string;
  shareReminderAt: string;
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
  baseUrl?: string;
}): { childUrl: string; whatsappShareUrl: string } {
  const childUrl = generateChildUrl(
    params.parentId,
    params.childId,
    params.challengeId,
    params.baseUrl
  );
  const whatsappShareUrl = buildWhatsAppShareUrl({
    childUrl,
    childName: params.childName,
    parentName: params.parentName,
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
