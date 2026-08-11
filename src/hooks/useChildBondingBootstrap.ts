'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { resolveBondingGameRoom } from '@/lib/api/bonding';
import {
  readOnboardingBondingMeta,
  readOnboardingBondingPublic,
} from '@/lib/game/bondingPublic';
import { ensureAnonymousChildAuth } from '@/lib/game/anonymousChildAuth';
import { setChildBondingContext } from '@/lib/onboarding/childBondingContext';
import { signalChildOnboardingMilestone } from '@/lib/onboarding/childMilestones';
import { parseBondingInviteQueryParams } from '@/utils/url-encoding';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ChildBondingBootstrap');

type ReadyInviteAccess = {
  status: 'ready';
  parentId: string;
  childId: string | null;
  challengeId: string | null;
  inviteId?: string;
};

/** Parse invite access and persist child/parent names from bonding invite. */
export function useChildBondingBootstrap(access: ReadyInviteAccess | null) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!access || access.status !== 'ready') return;

    const urlMeta = parseBondingInviteQueryParams(searchParams ?? new URLSearchParams());
    // Invite query params are authoritative for this open — do not let stale RTDB
    // meta/public (e.g. previous invite as father) flip gender/names after first paint.
    const urlChildName = urlMeta.childName?.trim() || '';
    const urlChildGender = urlMeta.childGender;
    const urlParentName = urlMeta.parentName?.trim() || '';
    const urlParentGender = urlMeta.parentGender;

    let childName = urlChildName;
    let childGender = urlChildGender;
    let parentName = urlParentName || 'אבא';
    let parentGender = urlParentGender;

    setChildBondingContext({
      parentId: access.parentId,
      childId: access.childId,
      inviteId: access.inviteId,
      childName,
      childGender,
      parentName,
      parentGender,
    });

    void (async () => {
      try {
        await ensureAnonymousChildAuth();
      } catch (e) {
        logger.warn('anonymous auth failed on bootstrap', e);
      }

      let inviteId = access.inviteId;

      const meta = await readOnboardingBondingMeta(access.parentId);
      if (meta) {
        if (!urlChildName && meta.childName) childName = meta.childName;
        if (
          !urlChildGender &&
          (meta.childGender === 'boy' || meta.childGender === 'girl')
        ) {
          childGender = meta.childGender;
        }
        if (!urlParentName && meta.parentName) parentName = meta.parentName;
        if (!urlParentGender && meta.parentGender) parentGender = meta.parentGender;
      }

      try {
        const resolved = await resolveBondingGameRoom({
          parentId: access.parentId,
          inviteId,
        });
        if (!urlChildName && resolved.childName) childName = resolved.childName;
        if (!urlParentName && resolved.parentName) parentName = resolved.parentName;
        if (resolved.inviteId) inviteId = resolved.inviteId;
      } catch (e) {
        logger.warn('resolveBondingGameRoom on bootstrap failed', e);
      }

      const pub = await readOnboardingBondingPublic(access.parentId);
      if (pub) {
        if (!urlChildName && pub.childName) childName = pub.childName;
        if (
          !urlChildGender &&
          (pub.childGender === 'boy' || pub.childGender === 'girl')
        ) {
          childGender = pub.childGender;
        }
        if (!urlParentName && pub.parentName) parentName = pub.parentName;
        if (!urlParentGender && pub.parentGender) parentGender = pub.parentGender;
      }

      setChildBondingContext({
        parentId: access.parentId,
        childId: access.childId,
        inviteId,
        childName,
        childGender,
        parentName,
        parentGender,
      });

      try {
        await signalChildOnboardingMilestone(access.parentId, 'link_opened');
      } catch (e) {
        logger.warn('signal link_opened failed', e);
      }
    })();
  }, [access, searchParams]);
}
