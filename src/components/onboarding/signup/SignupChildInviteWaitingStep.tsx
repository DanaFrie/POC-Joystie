'use client';

import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import {
  type SignupChildInviteWaitingVariant,
} from '@/constants/signup-child-invite-layout';

type SignupChildInviteWaitingStepProps = {
  childName: string;
  childGender?: 'boy' | 'girl';
  variant: SignupChildInviteWaitingVariant;
};

function waitingHeadline(
  childName: string,
  variant: SignupChildInviteWaitingVariant,
  gender: 'boy' | 'girl'
) {
  const isGirl = gender === 'girl';
  if (variant === 'companionPick') {
    return isGirl
      ? `מחכים ש${childName} תעיר את דורי הדרקון...`
      : `מחכים ש${childName} יעיר את דורי הדרקון...`;
  }
  return isGirl
    ? `מחכים ש${childName} תפתח את הלינק...`
    : `מחכים ש${childName} יפתח את הלינק...`;
}

function waitingAriaLabel(variant: SignupChildInviteWaitingVariant) {
  return variant === 'companionPick'
    ? 'ממתינים לבחירת חבר למסע'
    : 'ממתינים לפתיחת הלינק';
}

/** Waiting screens — headline + center GIF; bottom wordmark marquee is on the page shell. */
export function SignupChildInviteWaitingStep({
  childName,
  childGender = 'boy',
  variant,
}: SignupChildInviteWaitingStepProps) {
  return (
    <OnboardingWaitingCenterContent
      headline={waitingHeadline(childName, variant, childGender)}
      ariaLabel={waitingAriaLabel(variant)}
    />
  );
}
