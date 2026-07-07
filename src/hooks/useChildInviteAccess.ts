'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import { resolveBondingInvite } from '@/lib/api/bonding';

export type ChildInviteAccess =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'expired' }
  | {
      status: 'ready';
      parentId: string;
      childId: string | null;
      challengeId: string | null;
      inviteId?: string;
    };

/** Validate `?invite=` on `/onboarding/child`. */
export function useChildInviteAccess(): ChildInviteAccess {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get('invite')?.trim() || '';

  const [access, setAccess] = useState<ChildInviteAccess>(
    inviteId ? { status: 'loading' } : { status: 'missing' }
  );

  useEffect(() => {
    if (!inviteId) {
      setAccess({ status: 'missing' });
      return;
    }

    let cancelled = false;
    setAccess({ status: 'loading' });

    void resolveBondingInvite(inviteId)
      .then((resolved) => {
        if (cancelled) return;
        setAccess({
          status: 'ready',
          parentId: resolved.parentId,
          childId: resolved.childId,
          challengeId: resolved.challengeId,
          inviteId: resolved.inviteId,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const code = error instanceof FirebaseError ? error.code : '';
        if (code.includes('failed-precondition')) {
          setAccess({ status: 'expired' });
          return;
        }
        if (code.includes('not-found') || code.includes('invalid-argument')) {
          setAccess({ status: 'invalid' });
          return;
        }
        setAccess({ status: 'invalid' });
      });

    return () => {
      cancelled = true;
    };
  }, [inviteId]);

  return access;
}
