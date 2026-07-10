'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChange } from '@/utils/auth';

type UseRequireAuthResult = {
  uid: string | null;
  ready: boolean;
};

/** Redirect to login when no Firebase session. */
export function useRequireAuth(): UseRequireAuthResult {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let active = true;

    void (async () => {
      unsubscribe = await onAuthStateChange((user) => {
        if (!active) return;
        if (!user) {
          setUid(null);
          setReady(false);
          router.replace('/login');
          return;
        }
        setUid(user.uid);
        setReady(true);
      });
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [router]);

  return { uid, ready };
}
