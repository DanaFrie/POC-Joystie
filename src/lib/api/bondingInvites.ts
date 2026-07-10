import { getFirestoreInstance } from '@/lib/firebase';
import { getActiveChallenge } from '@/lib/api/challenges';
import { getUser } from '@/lib/api/users';
import type { FirestoreBondingInvite } from '@/types/bonding';
import { generateChildUrl } from '@/utils/url-encoding';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('BondingInvites');

/** Latest bonding invite for a parent (Firestore) — onboarding progress only. */
export async function getLatestBondingInviteForParent(
  parentId: string
): Promise<FirestoreBondingInvite | null> {
  if (!parentId.trim()) return null;

  try {
    const { collection, query, where, getDocs, limit, orderBy } = await import(
      'firebase/firestore'
    );
    const db = await getFirestoreInstance();
    const invitesRef = collection(db, 'bonding_invites');

    try {
      const q = query(
        invitesRef,
        where('parentId', '==', parentId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as FirestoreBondingInvite;
      }
      return null;
    } catch (indexError) {
      logger.warn('bonding_invites ordered query failed — falling back', indexError);
      const q = query(invitesRef, where('parentId', '==', parentId), limit(10));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const invites = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as FirestoreBondingInvite
      );
      invites.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return invites[0] ?? null;
    }
  } catch (error) {
    logger.warn('getLatestBondingInviteForParent failed:', error);
    return null;
  }
}

/**
 * Parent share/copy URL for child dashboard — `/dashboard/child?token=…` (30 days).
 * Token is parentId + childId only; active challenge is resolved at load time.
 */
export async function resolveDashboardChildShareUrl(params: {
  parentId: string;
  childId?: string | null;
}): Promise<string> {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  let childId = params.childId?.trim() || null;

  try {
    if (!childId) {
      const active = await getActiveChallenge(params.parentId, false);
      if (active?.childId) childId = active.childId;
    }
    if (!childId) {
      const user = await getUser(params.parentId, false);
      childId = user?.primaryChildId || null;
    }
  } catch (error) {
    logger.warn('resolveDashboardChildShareUrl enrichment failed:', error);
  }

  return generateChildUrl(params.parentId, childId || undefined, base);
}
