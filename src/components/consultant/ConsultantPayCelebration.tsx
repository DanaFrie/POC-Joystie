'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildCastleConfetti } from '@/components/onboarding/child/ChildCastleConfetti';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import {
  CONSULTANT_PAY_TITLE_CLASS,
  ConsultantPayFrame,
} from '@/components/consultant/ConsultantPayFrame';

/** Shown only after the order status is paid. */
export function ConsultantPayCelebration() {
  return (
    <ConsultantPayFrame>
      <div className="flex w-full flex-col items-center gap-6 text-center">
        <div className="flex w-full flex-col items-center gap-2">
          <h1 className={`${CONSULTANT_PAY_TITLE_CLASS} text-center`}>התשלום התקבל!</h1>
          <p className="w-full font-simpler text-[16px] font-normal leading-[1.28] tracking-[-0.32px] text-white">
            מיד תקבלו מייל שהמפגש אושר
          </p>
        </div>
        <div className="relative aspect-square w-[min(300px,78vw)] md:w-[340px]">
          <ChildCastleConfetti className="absolute inset-0 size-full" />
          <OnboardingLazyImage
            src={CHILD_ONBOARDING_ASSETS.doriHappy}
            alt="דורי שמח"
            priority
            className="relative z-[1] size-full object-contain"
          />
        </div>
      </div>
    </ConsultantPayFrame>
  );
}
