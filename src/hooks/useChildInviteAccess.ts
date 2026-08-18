'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { resolveBondingInvite } from '@/lib/api/bonding';
import { inviteAccessFailureStatus } from '@/lib/onboarding/inviteAccessErrors';

export type ChildInviteAccess =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'expired' }
  | { status: 'consumed' }
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
  const inviteId = searchParams?.get('invite')?.trim() || '';

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
        setAccess({ status: inviteAccessFailureStatus(error) });
      });

    return () => {
      cancelled = true;
    };
  }, [inviteId]);

  return access;
}
