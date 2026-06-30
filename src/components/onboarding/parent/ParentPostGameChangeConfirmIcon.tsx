'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ONBOARDING_COMPLETION_CHECK_IMAGE } from '@/constants/onboarding-completion-layout';

/** Purple check — same asset as parent completion (Figma 13057:16567). */
export function ParentPostGameChangeConfirmIcon() {
  return (
    <OnboardingLazyImage
      src={ONBOARDING_COMPLETION_CHECK_IMAGE}
      alt=""
      className="size-[49px] shrink-0 object-contain"
      priority
    />
  );
}
