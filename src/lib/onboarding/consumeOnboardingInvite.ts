/**
 * After parent onboarding completes: consume invite links and drop live RTDB funnel state.
 * Invite tombstones stay so `?invite=` can resolve to "already completed" (Dori disappointed).
 *
 * Split: tombstone the link as soon as Screen 66 appears; delete live progress / public
 * snapshots only when the parent actually leaves to dashboard. Deleting progress earlier
 * desyncs waiting-for-selfie / completion screens back to the start of the funnel.
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

/** Mark this invite consumed so leftover `?invite=` links cannot re-enter the child funnel. */
export async function tombstoneOnboardingInviteLink(inviteId?: string | null): Promise<void> {
  const trimmed = inviteId?.trim();
  if (!trimmed) return;
  try {
    await consumeLocalBondingInvite(trimmed);
  } catch (error) {
    logger.warn('tombstone RTDB invite failed', error);
  }
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

  await tombstoneOnboardingInviteLink(inviteId);
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
