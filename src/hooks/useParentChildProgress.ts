'use client';

import { useEffect, useRef, useState } from 'react';
import type { SignupChildInviteWaitingVariant } from '@/constants/signup-child-invite-layout';
import { subscribeParentBondingInviteProgress } from '@/lib/onboarding/bondingInviteProgress';
import {
  readOnboardingChildProgress,
  subscribeOnboardingChildProgress,
  type OnboardingChildProgress,
} from '@/lib/onboarding/childProgress';
import { inviteWaitingVariantFromProgress } from '@/lib/onboarding/parentInviteWaitingCopy';
import { getCurrentUserId } from '@/utils/auth';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ParentChildProgress');

const POLL_MS = 2000;

export type ParentWaitingStep = 'childInviteWaiting';

type UseParentChildProgressOptions = {
  enabled: boolean;
  parentStep: ParentWaitingStep | null;
  /** ISO time when parent shared the invite — ignores stale Firestore milestones. */
  waitingSessionStartedAt?: string | null;
  onWelcomeReached?: () => void;
  onMissionReady?: () => void;
};

function mergeProgress(
  firestore: OnboardingChildProgress | null,
  rtdb: OnboardingChildProgress | null
): OnboardingChildProgress | null {
  if (!firestore && !rtdb) return null;
  return {
    ...firestore,
    ...rtdb,
    linkOpened: Boolean(firestore?.linkOpened || rtdb?.linkOpened),
    linkOpenedAt: rtdb?.linkOpenedAt ?? firestore?.linkOpenedAt,
    welcomeReached: Boolean(firestore?.welcomeReached || rtdb?.welcomeReached),
    missionReady: Boolean(firestore?.missionReady || rtdb?.missionReady),
    missionReadyAt: rtdb?.missionReadyAt ?? firestore?.missionReadyAt,
  };
}

function milestoneIsFresh(
  at: string | undefined | null,
  sessionStartedAt: string | null | undefined
): boolean {
  if (!sessionStartedAt) return true;
  if (!at) return false;
  return at > sessionStartedAt;
}

function milestoneAt(
  progress: OnboardingChildProgress,
  flag: keyof OnboardingChildProgress,
  atKey: keyof OnboardingChildProgress
): string | undefined {
  if (!progress[flag]) return undefined;
  const at = progress[atKey];
  if (typeof at === 'string' && at) return at;
  return typeof progress.updatedAt === 'string' ? progress.updatedAt : undefined;
}

function isLinkOpenedForSession(
  progress: OnboardingChildProgress,
  sessionStartedAt: string | null | undefined
): boolean {
  if (!progress.linkOpened) return false;
  return milestoneIsFresh(
    milestoneAt(progress, 'linkOpened', 'linkOpenedAt'),
    sessionStartedAt
  );
}

function isMissionReadyForSession(
  progress: OnboardingChildProgress,
  sessionStartedAt: string | null | undefined
): boolean {
  if (!progress.missionReady) return false;
  return milestoneIsFresh(progress.missionReadyAt, sessionStartedAt);
}

function applyProgress(
  progress: OnboardingChildProgress | null,
  fired: { link: boolean; welcome: boolean; mission: boolean },
  parentStep: ParentWaitingStep | null,
  sessionStartedAt: string | null | undefined,
  callbacks: {
    onWelcomeReached?: () => void;
    onMissionReady?: () => void;
  }
) {
  if (!progress || !parentStep) return;

  if (
    isLinkOpenedForSession(progress, sessionStartedAt) &&
    !fired.link &&
    parentStep === 'childInviteWaiting'
  ) {
    fired.link = true;
  }

  if (progress.welcomeReached && !fired.welcome) {
    fired.welcome = true;
    callbacks.onWelcomeReached?.();
  }

  if (
    isMissionReadyForSession(progress, sessionStartedAt) &&
    !fired.mission &&
    parentStep === 'childInviteWaiting'
  ) {
    if (!isLinkOpenedForSession(progress, sessionStartedAt) && !fired.link) return;
    fired.mission = true;
    callbacks.onMissionReady?.();
  }
}

/** Parent waits for child milestones — Firestore invite snapshot + RTDB fallback. */
export function useParentChildProgress({
  enabled,
  parentStep,
  waitingSessionStartedAt,
  onWelcomeReached,
  onMissionReady,
}: UseParentChildProgressOptions) {
  const callbacksRef = useRef({ onWelcomeReached, onMissionReady });
  callbacksRef.current = { onWelcomeReached, onMissionReady };
  const parentStepRef = useRef(parentStep);
  parentStepRef.current = parentStep;
  const sessionStartedAtRef = useRef(waitingSessionStartedAt);
  sessionStartedAtRef.current = waitingSessionStartedAt;
  const [inviteWaitingVariant, setInviteWaitingVariant] =
    useState<SignupChildInviteWaitingVariant>('linkOpen');

  useEffect(() => {
    if (!enabled || !parentStep) {
      setInviteWaitingVariant('linkOpen');
      return;
    }

    let disposed = false;
    let rtdbUnsub: (() => void) | undefined;
    let firestoreUnsub: (() => void) | undefined;
    let pollId: number | undefined;
    const fired = { link: false, welcome: false, mission: false };
    let firestoreProgress: OnboardingChildProgress | null = null;
    let rtdbProgress: OnboardingChildProgress | null = null;

    const handleSources = () => {
      if (disposed) return;
      const merged = mergeProgress(firestoreProgress, rtdbProgress);
      setInviteWaitingVariant(
        inviteWaitingVariantFromProgress(
          Boolean(merged && isLinkOpenedForSession(merged, sessionStartedAtRef.current))
        )
      );
      applyProgress(
        merged,
        fired,
        parentStepRef.current,
        sessionStartedAtRef.current,
        callbacksRef.current
      );
    };

    void (async () => {
      const parentId = await getCurrentUserId();
      if (!parentId || disposed) return;

      firestoreUnsub = subscribeParentBondingInviteProgress(parentId, (invite) => {
        firestoreProgress = {
          linkOpened: invite.linkOpened,
          linkOpenedAt: invite.linkOpenedAt ?? undefined,
          welcomeReached: invite.welcomeReached,
          missionReady: invite.missionReady,
          missionReadyAt: invite.missionReadyAt ?? undefined,
        };
        handleSources();
      });

      rtdbUnsub = subscribeOnboardingChildProgress(parentId, (progress) => {
        rtdbProgress = progress;
        handleSources();
      });

      const pollRtdb = async () => {
        if (disposed) return;
        try {
          rtdbProgress = await readOnboardingChildProgress(parentId);
          handleSources();
        } catch (error) {
          logger.warn('readOnboardingChildProgress failed', error);
        }
      };

      await pollRtdb();
      pollId = window.setInterval(() => void pollRtdb(), POLL_MS);
    })();

    return () => {
      disposed = true;
      firestoreUnsub?.();
      rtdbUnsub?.();
      if (pollId) window.clearInterval(pollId);
    };
  }, [enabled, parentStep]);

  return { inviteWaitingVariant };
}
