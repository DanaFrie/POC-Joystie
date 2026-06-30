'use client';

import { BallGameCourtLayer } from '@/components/onboarding/game/BallGameCourtLayer';
import { BallGameParentReadyScreen } from '@/components/onboarding/game/BallGameParentReadyScreen';
import { getOnboardingParentRole, parentRoleToGender } from '@/lib/onboarding/parentRole';

type ParentChildGameReadyStepProps = {
  childName: string;
  onReady: () => void;
};

/** Figma 13245:19151 — court + play-ready popup before `/game`. */
export function ParentChildGameReadyStep({
  childName,
  onReady,
}: ParentChildGameReadyStepProps) {
  const role = getOnboardingParentRole();
  const parentGender = role ? parentRoleToGender(role) : 'male';

  return (
    <div dir="rtl" className="relative h-full w-full overflow-hidden bg-transparent">
      <BallGameCourtLayer
        role="parent"
        parentGender={parentGender}
        childName={childName}
        score={0}
      />
      <BallGameParentReadyScreen childName={childName} onConfirm={onReady} />
    </div>
  );
}
