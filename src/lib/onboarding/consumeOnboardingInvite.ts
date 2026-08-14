/**
 * After parent onboarding completes: consume invite links and drop live RTDB funnel state.
 * Invite tombstones stay so `?invite=` can resolve to "already completed" (Dori disappointed).
 */
import { remove, ref } from 'firebase/database';
import { consumeBondingInvite } from '@/lib/api/bonding';
import { getDatabaseInstance } from '@/lib/firebase';
import { gameRoomPath } from '@/lib/game/paths';
import {
  clearOnboardingBondingSnapshots,
  readOnboardingBondingPublic,
} from '@/lib/game/bondingPublic';
import { consumeLocalBondingInvite } from '@/lib/onboarding/localBondingInvite';
import { useRtdbBondingInvites } from '@/lib/onboarding/bondingInviteTransport';
import { removeOnboardingChildProgress } from '@/lib/onboarding/childProgress';
import { removeOnboardingParentProgress } from '@/lib/onboarding/parentProgress';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ConsumeOnboardingInvite');

async function clearLeftoverGameRoom(parentId: string): Promise<void> {
  const pub = await readOnboardingBondingPublic(parentId);
  const roomId = pub?.roomId?.trim();
  if (!roomId) return;
  const db = await getDatabaseInstance();
  await remove(ref(db, gameRoomPath(roomId)));
}

async function clearOnboardingRtdb(parentId: string, inviteId?: string | null): Promise<void> {
  await clearLeftoverGameRoom(parentId).catch((error) => {
    logger.warn('clear leftover game room failed', error);
  });

  await Promise.all([
    clearOnboardingBondingSnapshots(parentId),
    removeOnboardingChildProgress(parentId),
    removeOnboardingParentProgress(parentId),
  ]);

  if (inviteId) {
    await consumeLocalBondingInvite(inviteId);
  }
}

export async function consumeOnboardingInviteRecords(params: {
  parentId: string;
  inviteId?: string | null;
}): Promise<void> {
  const inviteId = params.inviteId?.trim() || null;

  try {
    await clearOnboardingRtdb(params.parentId, inviteId);
  } catch (error) {
    logger.warn('RTDB onboarding cleanup failed', error);
  }

  if (useRtdbBondingInvites()) return;

  try {
    await consumeBondingInvite(inviteId);
  } catch (error) {
    logger.warn('consumeBondingInvite callable failed', error);
  }
}
