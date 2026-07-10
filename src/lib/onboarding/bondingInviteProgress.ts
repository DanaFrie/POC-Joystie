/**
 * Parent listens to bonding_invites for child milestones (Firestore).
 * Resolves invite id from user.bondingInviteId or latest invite by parentId —
 * not sessionStorage.
 */
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { getUser } from '@/lib/api/users';
import { getLatestBondingInviteForParent } from '@/lib/api/bondingInvites';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('BondingInviteProgress');

export type BondingInviteProgress = {
  linkOpened: boolean;
  linkOpenedAt?: string | null;
  welcomeReached: boolean;
  missionReady: boolean;
  missionReadyAt?: string | null;
};

function mapInviteData(data: Record<string, unknown>): BondingInviteProgress {
  return {
    linkOpened: data.status === 'child_opened' || Boolean(data.childLinkOpenedAt),
    linkOpenedAt:
      typeof data.childLinkOpenedAt === 'string' ? data.childLinkOpenedAt : null,
    welcomeReached: Boolean(data.welcomeReachedAt),
    missionReady: Boolean(data.missionReadyAt),
    missionReadyAt:
      typeof data.missionReadyAt === 'string' ? data.missionReadyAt : null,
  };
}

async function resolveInviteIdForParent(parentId: string): Promise<string | null> {
  try {
    const user = await getUser(parentId, false);
    if (user?.bondingInviteId?.trim()) return user.bondingInviteId.trim();
  } catch {
    // fall through
  }
  const latest = await getLatestBondingInviteForParent(parentId);
  return latest?.id ?? null;
}

/**
 * Subscribe to the parent's Firestore bonding invite.
 * Returns noop unsub when no invite exists.
 */
export function subscribeParentBondingInviteProgress(
  parentId: string,
  onChange: (progress: BondingInviteProgress) => void
): Unsubscribe {
  let innerUnsub: Unsubscribe | undefined;
  let cancelled = false;

  void (async () => {
    const inviteId = await resolveInviteIdForParent(parentId);
    if (!inviteId || cancelled) return;

    const db = await getFirestoreInstance();
    if (cancelled) return;

    innerUnsub = onSnapshot(
      doc(db, 'bonding_invites', inviteId),
      (snap) => {
        if (!snap.exists()) return;
        onChange(mapInviteData(snap.data()));
      },
      (error) => {
        logger.warn('bonding_invites snapshot failed', error);
      }
    );
  })();

  return () => {
    cancelled = true;
    innerUnsub?.();
  };
}
