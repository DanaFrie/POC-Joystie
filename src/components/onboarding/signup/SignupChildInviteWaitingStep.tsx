'use client';

import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import {
  type SignupChildInviteWaitingVariant,
} from '@/constants/signup-child-invite-layout';
import {
  parentInviteWaitingAriaLabel,
  parentInviteWaitingHeadline,
} from '@/lib/onboarding/parentInviteWaitingCopy';

type SignupChildInviteWaitingStepProps = {
  childName: string;
  childGender?: 'boy' | 'girl';
  variant: SignupChildInviteWaitingVariant;
};

/** Waiting screens — headline + center GIF; bottom wordmark marquee is on the page shell. */
export function SignupChildInviteWaitingStep({
  childName,
  childGender = 'boy',
  variant,
}: SignupChildInviteWaitingStepProps) {
  return (
    <OnboardingWaitingCenterContent
      headline={parentInviteWaitingHeadline(childName, variant, childGender)}
      ariaLabel={parentInviteWaitingAriaLabel(variant)}
    />
  );
}
