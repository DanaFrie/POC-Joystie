'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import type { FirestoreUserSubscription, SubscriptionStatus } from '@/types/firestore';

type UseUserSubscriptionResult = {
  subscription: FirestoreUserSubscription | null;
  challengeUnlocked: boolean;
  status: SubscriptionStatus | null;
  loading: boolean;
};

/** Live subscription doc slice for pay return pages. */
export function useUserSubscription(uid: string | null): UseUserSubscriptionResult {
  const [subscription, setSubscription] = useState<FirestoreUserSubscription | null>(null);
  const [challengeUnlocked, setChallengeUnlocked] = useState(false);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      setSubscription(null);
      setChallengeUnlocked(false);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let active = true;

    void (async () => {
      const db = await getFirestoreInstance();
      if (!active) return;

      unsubscribe = onSnapshot(
        doc(db, 'users', uid),
        (snap) => {
          const data = snap.data();
          setSubscription((data?.subscription as FirestoreUserSubscription | undefined) ?? null);
          setChallengeUnlocked(Boolean(data?.challengeUnlocked));
          setLoading(false);
        },
        () => setLoading(false)
      );
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [uid]);

  return {
    subscription,
    challengeUnlocked,
    status: subscription?.status ?? null,
    loading,
  };
}
