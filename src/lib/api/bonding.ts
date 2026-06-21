/**
 * Bonding invite API (calls Firebase Functions).
 */
import { getFunctionsInstance } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { buildWhatsAppShareUrl } from '@/lib/share/whatsapp';
import { getBondingShareBaseUrl } from '@/lib/share/bondingBaseUrl';
import { generateOnboardingChildUrl } from '@/utils/url-encoding';
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
