'use client';

import { useEffect, useState } from 'react';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { getCurrentUserId as getCurrentUserIdAsync } from '@/utils/auth';

/**
 * Challenge UI gate from Firestore subscription — not sessionStorage.
 * Enabled when trial/active or challengeUnlocked; freemium stays gated.
 */
export function useDashboardSubscribeMode(): { challengeEnabled: boolean; loading: boolean } {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getCurrentUserIdAsync().then((id) => {
      if (active) setUid(id);
    });
    return () => {
      active = false;
    };
  }, []);

  const { status, challengeUnlocked, loading } = useUserSubscription(uid);

  const challengeEnabled =
    challengeUnlocked ||
    status === 'trialing' ||
    status === 'active';

  return { challengeEnabled, loading };
}
