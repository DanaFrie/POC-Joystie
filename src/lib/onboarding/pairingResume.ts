/**
 * Shared pairing timeline for parent + child onboarding.
 * SessionStorage is a cache; RTDB milestones + live room decide where each device resumes.
 */
import { readOnboardingBondingPublic } from '@/lib/game/bondingPublic';
import {
  readOnboardingChildProgress,
  type OnboardingChildProgress,
} from '@/lib/onboarding/childProgress';
import {
  readOnboardingParentProgress,
  type OnboardingParentProgress,
} from '@/lib/onboarding/parentProgress';
import {
  deriveChildPostGameStep,
  mergePostGameProgress,
} from '@/lib/onboarding/postGameSync';

export type PairingStage = 'invite' | 'child_funnel' | 'game' | 'post_game' | 'complete';

export type PairingSnapshot = {
  stage: PairingStage;
  child: OnboardingChildProgress | null;
  parent: OnboardingParentProgress | null;
  hasLiveRoom: boolean;
};

export type ParentResumeAction =
  | { type: 'stay' }
  | { type: 'step'; step: 'childInviteWaiting' | 'parentPostGame' }
  | { type: 'route'; path: '/game' };

export type ChildResumeAction =
  | { type: 'stay' }
  | { type: 'route'; path: '/game/child' | '/onboarding/child' }
  | { type: 'funnelStep'; step: string };

const PARENT_PRE_ACCOUNT_STEPS = new Set([
  'role',
  'phoneCount',
  'details',
  'screenTime',
  'calculating',
  'revealIntro',
  'badNews',
  'goodNews',
  'realData',
  'signupForm',
]);

export function derivePairingStage(input: {
  child: OnboardingChildProgress | null;
  parent: OnboardingParentProgress | null;
  hasLiveRoom: boolean;
}): PairingStage {
  const { child, parent, hasLiveRoom } = input;

  if (child?.selfieMissionDone) return 'complete';

  if (
    child?.changeSelected ||
    child?.gameWon ||
    parent?.childChangeApproved ||
    (typeof parent?.additionalChangeText === 'string' && parent.additionalChangeText.trim())
  ) {
    return 'post_game';
  }

  if (child?.missionReady) {
    if (hasLiveRoom || !child.gameWon) return 'game';
    return 'post_game';
  }

  if (
    child?.linkOpened ||
    child?.welcomeReached ||
    child?.eggComplete ||
    child?.doriRevealed
  ) {
    return 'child_funnel';
  }

  return 'invite';
}

export async function readPairingSnapshot(parentId: string): Promise<PairingSnapshot> {
  const [child, parent, pub] = await Promise.all([
    readOnboardingChildProgress(parentId),
    readOnboardingParentProgress(parentId),
    readOnboardingBondingPublic(parentId),
  ]);
  const hasLiveRoom = Boolean(pub?.roomId?.trim());
  return {
    child,
    parent,
    hasLiveRoom,
    stage: derivePairingStage({ child, parent, hasLiveRoom }),
  };
}

export function parentResumeAction(
  stage: PairingStage,
  currentPath: '/onboarding' | '/game',
  currentStep?: string | null
): ParentResumeAction {
  if (stage === 'complete' || stage === 'post_game') {
    if (
      currentPath === '/onboarding' &&
      (currentStep === 'parentPostGame' ||
        currentStep === 'onboardingComplete' ||
        currentStep === 'subscription')
    ) {
      return { type: 'stay' };
    }
    if (currentStep && PARENT_PRE_ACCOUNT_STEPS.has(currentStep)) return { type: 'stay' };
    return { type: 'step', step: 'parentPostGame' };
  }

  if (stage === 'game') {
    if (currentPath === '/game') return { type: 'stay' };
    if (currentStep && PARENT_PRE_ACCOUNT_STEPS.has(currentStep)) return { type: 'stay' };
    return { type: 'route', path: '/game' };
  }

  if (stage === 'child_funnel') {
    if (currentPath === '/onboarding' && currentStep === 'childInviteWaiting') {
      return { type: 'stay' };
    }
    if (currentStep && PARENT_PRE_ACCOUNT_STEPS.has(currentStep)) return { type: 'stay' };
    if (currentPath === '/game') return { type: 'step', step: 'childInviteWaiting' };
    if (
      currentStep === 'signupIntro' ||
      currentStep === 'signupWelcome' ||
      currentStep === 'pickChild' ||
      currentStep === 'childInviteIntro' ||
      currentStep === 'childInviteShare' ||
      currentStep === 'parentPostGame'
    ) {
      return { type: 'step', step: 'childInviteWaiting' };
    }
    return { type: 'stay' };
  }

  if (currentPath === '/game') return { type: 'step', step: 'childInviteWaiting' };
  return { type: 'stay' };
}

export function childResumeAction(
  snapshot: PairingSnapshot,
  currentPath: '/onboarding/child' | '/game/child'
): ChildResumeAction {
  const { stage } = snapshot;

  if (stage === 'game') {
    if (currentPath === '/game/child') return { type: 'stay' };
    return { type: 'route', path: '/game/child' };
  }

  if (stage === 'post_game' || stage === 'complete') {
    if (currentPath === '/game/child') return { type: 'route', path: '/onboarding/child' };
    const derived = deriveChildPostGameStep(
      mergePostGameProgress(snapshot.child, snapshot.parent)
    );
    if (derived) return { type: 'funnelStep', step: derived };
    // Selfie done — stay on share / waiting (flow sends waiting → dashboard).
    if (snapshot.child?.selfieMissionDone) return { type: 'stay' };
    if (snapshot.child?.gameWon) return { type: 'funnelStep', step: 'missionOneWin' };
    return { type: 'stay' };
  }

  if (currentPath === '/game/child') return { type: 'route', path: '/onboarding/child' };
  return { type: 'stay' };
}

export function childPathWithInvite(
  path: '/game/child' | '/onboarding/child',
  inviteId?: string | null
): string {
  const id = inviteId?.trim();
  if (!id) return path;
  return `${path}?invite=${encodeURIComponent(id)}`;
}
