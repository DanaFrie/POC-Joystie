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

import { decodeParentToken } from '@/utils/url-encoding';

import { createContextLogger } from '@/utils/logger';



const logger = createContextLogger('ChildBondingBootstrap');



/** Parse `?token=` and persist child/parent names from bonding invite. */

export function useChildBondingBootstrap() {

  const searchParams = useSearchParams();

  const token = searchParams.get('token');



  useEffect(() => {

    if (!token) return;



    const decoded = decodeParentToken(token);

    if (!decoded || decoded.isExpired) {

      logger.warn('invalid or expired child token');

      return;

    }



    const urlMeta = parseBondingInviteQueryParams(searchParams);

    let childName = urlMeta.childName ?? '';

    let childGender = urlMeta.childGender;

    let parentName = urlMeta.parentName ?? 'אבא';

    let parentGender = urlMeta.parentGender;



    setChildBondingContext({

      parentId: decoded.parentId,

      childId: decoded.childId,

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



      let inviteId: string | undefined;



      const meta = await readOnboardingBondingMeta(decoded.parentId);

      if (meta) {

        if (meta.childName) childName = meta.childName;

        if (meta.parentName) parentName = meta.parentName;

        if (meta.parentGender) parentGender = meta.parentGender;

      }



      try {

        const resolved = await resolveBondingGameRoom({ parentId: decoded.parentId });

        if (resolved.childName) childName = resolved.childName;

        if (resolved.parentName) parentName = resolved.parentName;

        if (resolved.inviteId) inviteId = resolved.inviteId;

      } catch (e) {

        logger.warn('resolveBondingGameRoom on bootstrap failed', e);

      }



      const pub = await readOnboardingBondingPublic(decoded.parentId);

      if (pub) {

        if (pub.childName) childName = pub.childName;

        if (pub.parentName) parentName = pub.parentName;

        if (pub.parentGender) parentGender = pub.parentGender;

      }



      setChildBondingContext({

        parentId: decoded.parentId,

        childId: decoded.childId,

        inviteId,

        childName,

        childGender,

        parentName,

        parentGender,

      });



      try {

        await signalChildOnboardingMilestone(decoded.parentId, 'link_opened');

      } catch (e) {

        logger.warn('signal link_opened failed', e);

      }

    })();

  }, [token, searchParams]);

}

