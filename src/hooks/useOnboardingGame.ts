'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolveBondingGameRoom } from '@/lib/api/bonding';
import {
  publishOnboardingBondingPublic,
  readOnboardingBondingMeta,
  readOnboardingBondingPublic,
  subscribeOnboardingBondingPublic,
} from '@/lib/game/bondingPublic';
import { isGameWon } from '@/lib/game/onboarding';
import { useGameSession } from '@/hooks/useGameSession';
import { getOnboardingBondingInviteId } from '@/lib/onboarding/bondingShare';
import { getBondingChildName, getBondingChildGender, getSelectedFirstChildName } from '@/lib/onboarding/bondingInvite';
import {
  getChildBondingContext,
  setChildBondingContext,
} from '@/lib/onboarding/childBondingContext';
import { endOnboardingGameRoom } from '@/lib/api/game';
import { getOnboardingParentRole, parentRoleToGender } from '@/lib/onboarding/parentRole';
import { FLOW_STEP_STORAGE_KEY } from '@/lib/onboarding/parentFlowSession';
import { parentCourtLabel } from '@/lib/onboarding/childBondingLabels';
import { signalChildOnboardingMilestone, signalOnboardingGameWon } from '@/lib/onboarding/childMilestones';
import { getOnboardingChildIds } from '@/lib/onboarding/persistOnboardingAccount';
import { getOnboardingFirstChildIndex } from '@/lib/onboarding/pickFirstChild';
import {
  ONBOARDING_CHILD_GAME_WON_KEY,
  ONBOARDING_PARENT_GAME_WON_KEY,
} from '@/constants/onboarding-game';
import { GAME_ONBOARDING_NEXT_STEP } from '@/constants/game';
import { getCurrentUserId } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';
import type { GameOnboardingContext } from '@/constants/game';

const logger = createContextLogger('OnboardingGame');

export type OnboardingGameRole = 'parent' | 'child';

export type UseOnboardingGameOptions = {
  role: OnboardingGameRole;
  parentId?: string | null;
  inviteId?: string | null;
  childName?: string;
  parentName?: string;
  showMissionIntro?: boolean;
  /** Parent `/game` — optional override; default exits to `/onboarding` post-game funnel. */
  onParentGameWon?: () => void;
  /** Child `/game/child` — court fade-out before onboarding handoff. */
  onChildGameWon?: () => void;
};

export function useOnboardingGame({
  role,
  parentId,
  inviteId,
  childName: childNameProp,
  parentName: parentNameProp,
  showMissionIntro = false,
  onParentGameWon,
  onChildGameWon,
}: UseOnboardingGameOptions) {
  const router = useRouter();
  const [roomIdParam, setRoomIdParam] = useState('');
  const [joinCodeParam, setJoinCodeParam] = useState('');
  const [childName, setChildName] = useState(
    childNameProp ?? getBondingChildName() ?? getSelectedFirstChildName()
  );
  const [parentGender, setParentGender] = useState<'female' | 'male'>(() => {
    if (role === 'child') {
      const ctx = getChildBondingContext();
      if (ctx?.parentGender) return ctx.parentGender;
    }
    const onboardingRole = getOnboardingParentRole();
    return onboardingRole ? parentRoleToGender(onboardingRole) : 'male';
  });
  const [missionPhase, setMissionPhase] = useState(showMissionIntro);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolveBusy, setResolveBusy] = useState(false);
  const wonNavigated = useRef(false);
  const gameStartTracked = useRef(false);
  const parentWinHandled = useRef(false);
  const childWinHandled = useRef(false);
  const parentPublished = useRef(false);
  const gameWonSignaled = useRef(false);
  const appliedPublicRoomIdRef = useRef('');
  const childNameRef = useRef(childName);
  childNameRef.current = childName;

  const createRoomContext = useMemo((): GameOnboardingContext => {
    const childIds = getOnboardingChildIds();
    const childIndex = getOnboardingFirstChildIndex() ?? 0;
    const ctx: GameOnboardingContext = {
      parentStepId: GAME_ONBOARDING_NEXT_STEP.parent,
      childStepId: GAME_ONBOARDING_NEXT_STEP.child,
    };
    const childId = childIds[childIndex];
    if (childId) ctx.childId = childId;
    const bondingInviteId = inviteId ?? getOnboardingBondingInviteId();
    if (bondingInviteId) ctx.bondingInviteId = bondingInviteId;
    return ctx;
  }, [inviteId]);

  const session = useGameSession({
    mode: role === 'child' ? 'child' : null,
    roomIdParam,
    joinCodeParam,
    childBasePath: '/game/child',
    autoCreateParent: role === 'parent',
    createRoomContext,
  });

  useEffect(() => {
    if (childNameProp) setChildName(childNameProp);
    if (parentNameProp === 'male' || parentNameProp === 'female') {
      setParentGender(parentNameProp);
    }
  }, [childNameProp, parentNameProp]);

  useEffect(() => {
    if (role !== 'parent' || !session.roomId || parentPublished.current) return;
    parentPublished.current = true;

    void (async () => {
      const uid = await getCurrentUserId();
      if (!uid) return;

      const onboardingRole = getOnboardingParentRole();
      const gender = onboardingRole ? parentRoleToGender(onboardingRole) : 'male';
      const courtParentName = parentCourtLabel(gender);
      const resolvedChildName = childNameProp ?? getSelectedFirstChildName();
      setChildName(resolvedChildName);
      setParentGender(gender);

      try {
        await publishOnboardingBondingPublic(uid, {
          childName: resolvedChildName,
          childGender: getBondingChildGender() ?? undefined,
          parentName: courtParentName,
          parentGender: gender,
          roomId: session.roomId,
          joinCode: session.joinCode,
        });
        logger.log('published bonding public', { roomId: session.roomId });
      } catch (e) {
        logger.warn('publishOnboardingBondingPublic failed', e);
      }
    })();
  }, [role, session.roomId, session.joinCode, childNameProp]);

  useEffect(() => {
    if (role !== 'child' || missionPhase) return;
    if (!parentId) {
      // Invite resolve supplies parentId on `/game/child?invite=` — wait, don't fail.
      if (inviteId) return;
      setResolveError('קישור לא תקין — חסר מזהה הורה');
      return;
    }

    let cancelled = false;

    const applyRoom = (
      nextRoomId: string,
      joinCode: string,
      cn: string,
      pg?: 'female' | 'male'
    ) => {
      if (cancelled) return;
      if (appliedPublicRoomIdRef.current === nextRoomId) return;
      appliedPublicRoomIdRef.current = nextRoomId;
      const courtParentName = parentCourtLabel(pg);
      setChildName(cn);
      if (pg) setParentGender(pg);
      const existing = getChildBondingContext();
      if (existing && cn) {
        setChildBondingContext({
          ...existing,
          childName: cn,
          parentName: courtParentName,
          parentGender: pg,
        });
      }
      setRoomIdParam(nextRoomId);
      setJoinCodeParam(joinCode);
      setResolveError(null);
      setResolveBusy(false);
    };

    const tryResolve = async () => {
      setResolveBusy(true);
      let nextRoomId: string | null = null;
      let joinCode: string | null = null;
      let cn = childNameProp ?? childNameRef.current;
      let pg: 'female' | 'male' | undefined;

      const meta = await readOnboardingBondingMeta(parentId);
      if (meta) {
        if (meta.childName) cn = meta.childName;
        pg = meta.parentGender;
      }

      try {
        const resolved = await resolveBondingGameRoom({
          parentId,
          inviteId: inviteId ?? undefined,
        });
        if (resolved.childName) cn = resolved.childName;
        nextRoomId = resolved.roomId;
        joinCode = resolved.joinCode;
      } catch (e) {
        logger.warn('resolveBondingGameRoom failed', e);
      }

      if (!nextRoomId || !joinCode) {
        const pub = await readOnboardingBondingPublic(parentId);
        if (pub) {
          nextRoomId = pub.roomId;
          joinCode = pub.joinCode;
          cn = pub.childName || cn;
          pg = pub.parentGender ?? pg;
        }
      }

      if (cancelled) return;

      if (nextRoomId && joinCode) {
        applyRoom(nextRoomId, joinCode, cn, pg);
        return;
      }

      setResolveError('מחכים שההורה יפתח את המשחק');
      setResolveBusy(false);
    };

    void tryResolve();
    const unsub = subscribeOnboardingBondingPublic(parentId, (pub) => {
      if (!pub?.roomId || !pub.joinCode) return;
      applyRoom(
        pub.roomId,
        pub.joinCode,
        pub.childName || childNameProp || childNameRef.current,
        pub.parentGender
      );
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [role, parentId, inviteId, missionPhase, childNameProp]);

  const navigateAfterWin = useCallback(() => {
    if (wonNavigated.current) return;
    wonNavigated.current = true;
    if (role === 'parent') {
      sessionStorage.setItem(ONBOARDING_PARENT_GAME_WON_KEY, '1');
      sessionStorage.setItem(FLOW_STEP_STORAGE_KEY, 'parentPostGame');
      router.push('/onboarding', { scroll: false });
    } else {
      sessionStorage.setItem(ONBOARDING_CHILD_GAME_WON_KEY, '1');
      router.push('/onboarding/child', { scroll: false });
    }
  }, [role, router]);

  /** First transition to `playing` — parent device only (funnel → trial). */
  useEffect(() => {
    if (role !== 'parent') return;
    if (!session.roomId || session.room?.phase !== 'playing') return;
    if (gameStartTracked.current) return;
    gameStartTracked.current = true;
    void import('@/utils/analytics').then(({ logEventOnce, AnalyticsEvents }) => {
      void logEventOnce(`game_start:parent:${session.roomId}`, AnalyticsEvents.GAME_START, {
        role: 'parent',
      });
    });
  }, [session.room?.phase, session.roomId, role]);

  useEffect(() => {
    if (!session.room || !isGameWon(session.room)) return;

    if (!gameWonSignaled.current) {
      gameWonSignaled.current = true;
      void (async () => {
        const uid =
          role === 'parent' ? await getCurrentUserId() : parentId?.trim() || null;
        if (uid) await signalOnboardingGameWon(uid);
      })();
    }

    if (role === 'parent') {
      if (parentWinHandled.current) return;
      parentWinHandled.current = true;
      if (!onParentGameWon && session.roomId) {
        void endOnboardingGameRoom({ roomId: session.roomId }).catch(() => {});
      }
      if (onParentGameWon) {
        onParentGameWon();
        return;
      }
      navigateAfterWin();
      return;
    }

    if (onChildGameWon) {
      if (childWinHandled.current) return;
      childWinHandled.current = true;
      onChildGameWon();
      return;
    }

    if (wonNavigated.current) return;
    wonNavigated.current = true;
    const t = window.setTimeout(navigateAfterWin, 1200);
    return () => {
      window.clearTimeout(t);
      wonNavigated.current = false;
    };
  }, [session.room, role, onParentGameWon, onChildGameWon, navigateAfterWin, parentId]);

  const startPlaying = () => setMissionPhase(false);

  const confirmMissionAndPlay = useCallback(() => {
    if (role === 'child' && parentId) {
      void signalChildOnboardingMilestone(parentId, 'mission_ready').catch(() => {
        // parent may still advance via RTDB poll
      });
    }
    setMissionPhase(false);
  }, [role, parentId]);

  const parentName = parentCourtLabel(parentGender);

  return {
    ...session,
    childName,
    parentName,
    parentGender,
    missionPhase,
    startPlaying,
    confirmMissionAndPlay,
    markPlayReady: session.markPlayReady,
    setupError: resolveError ?? session.error,
    setupBusy: resolveBusy || session.busy,
  };
}
