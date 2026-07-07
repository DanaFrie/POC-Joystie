'use client';

import { ChildPostGameGrid } from '@/components/onboarding/child/ChildPostGameGrid';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import { childWaitingParentChangeApproval } from '@/lib/onboarding/childPostGameCopy';

type ChildWaitingParentApprovalStepProps = {
  parentGender?: 'female' | 'male' | null;
};

/** Waiting for parent to approve the child's chosen change — synced via RTDB. */
export function ChildWaitingParentApprovalStep({
  parentGender,
}: ChildWaitingParentApprovalStepProps) {
  const headline = childWaitingParentChangeApproval(parentGender);

  return (
    <OnboardingWaitingScreenShell zIndex={10}>
      <ChildPostGameGrid />
      <OnboardingWaitingCenterContent headline={headline} ariaLabel={headline} />
    </OnboardingWaitingScreenShell>
  );
}
