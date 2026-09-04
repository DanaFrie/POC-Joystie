/**
 * After parent onboarding completes: consume invite links and drop live RTDB funnel state.
 * Invite tombstones stay so `?invite=` can resolve to "already completed" (Dori disappointed).
 *
 * Keep child/parent progress until the child can leave waiting — deleting it when the
 * parent opens dashboard stranded the child on the waiting GIF with no RTDB signal.
 * Tombstone the invite + clear the game room / public snapshots only.
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

  await clearOnboardingBondingSnapshots(parentId);

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
