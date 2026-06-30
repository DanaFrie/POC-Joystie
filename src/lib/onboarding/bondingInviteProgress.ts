/**

 * Parent listens to bonding_invites for child milestones (when invite exists in Firestore).

 * Local dev without recordBondingInvite uses RTDB only — see useParentChildProgress.

 */

import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

import { getFirestoreInstance } from '@/lib/firebase';

import { getOnboardingBondingInviteId } from '@/lib/onboarding/bondingShare';

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



/**

 * Subscribe only when session has a Firestore invite id (successful recordBondingInvite).

 * Returns noop unsub when missing — avoids permission-denied on collection queries.

 */

export function subscribeParentBondingInviteProgress(

  _parentId: string,

  onChange: (progress: BondingInviteProgress) => void

): Unsubscribe {

  let innerUnsub: Unsubscribe | undefined;

  let cancelled = false;



  void (async () => {

    const inviteId = getOnboardingBondingInviteId();

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

