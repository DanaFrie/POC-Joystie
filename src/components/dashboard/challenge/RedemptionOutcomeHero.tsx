'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildCastleConfetti } from '@/components/onboarding/child/ChildCastleConfetti';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { V03_CHALLENGE_SETUP_ASSETS, V03_CHALLENGE_SETUP_LAYOUT } from '@/constants/v03-challenge-layout';

type RedemptionOutcomeHeroProps = {
  remainingAmount: number;
  childName: string;
};

/** Confetti when money left > 0; disappointed Dori when zero (never negative). */
export function RedemptionOutcomeHero({ remainingAmount, childName }: RedemptionOutcomeHeroProps) {
  const hasRemaining = remainingAmount > 0;

  if (hasRemaining) {
    return (
      <div className="relative mx-auto flex h-[120px] w-full items-center justify-center">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: V03_CHALLENGE_SETUP_LAYOUT.confettiSize,
            height: V03_CHALLENGE_SETUP_LAYOUT.confettiSize,
          }}
        >
          <ChildCastleConfetti src={V03_CHALLENGE_SETUP_ASSETS.confetti} className="size-full" />
        </div>
        <p className="relative z-[1] text-center font-simpler text-[15px] font-bold leading-[20px] text-[#00FFB3]">
          יש לך כסף בארנק!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <OnboardingLazyImage
        src={CHILD_ONBOARDING_ASSETS.doriDisappointed}
        alt=""
        className="size-[100px] object-contain"
        priority
      />
      <p className="text-center font-simpler text-[14px] leading-[20px] text-white/75">
        {childName}, השבוע כל דמי הכיס הלכו על זמן מסך — בשבוע הבא אפשר לשמור יותר.
      </p>
    </div>
  );
}
