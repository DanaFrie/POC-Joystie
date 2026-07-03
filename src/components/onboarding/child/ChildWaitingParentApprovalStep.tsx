'use client';

import { useEffect } from 'react';
import { ChildPostGameGrid } from '@/components/onboarding/child/ChildPostGameGrid';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import { CHILD_WAIT_PARENT_APPROVAL_MS } from '@/constants/child-post-game-layout';
import { childWaitingParentChangeApproval } from '@/lib/onboarding/childPostGameCopy';

type ChildWaitingParentApprovalStepProps = {
  parentGender?: 'female' | 'male' | null;
  onComplete: () => void;
};

/** Waiting for parent to approve the child's chosen change — in-canvas grid + wordmark marquee. */
export function ChildWaitingParentApprovalStep({
  parentGender,
  onComplete,
}: ChildWaitingParentApprovalStepProps) {
  const headline = childWaitingParentChangeApproval(parentGender);

  useEffect(() => {
    const timer = window.setTimeout(onComplete, CHILD_WAIT_PARENT_APPROVAL_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <OnboardingWaitingScreenShell zIndex={10}>
      <ChildPostGameGrid />
      <OnboardingWaitingCenterContent headline={headline} ariaLabel={headline} />
    </OnboardingWaitingScreenShell>
  );
}
