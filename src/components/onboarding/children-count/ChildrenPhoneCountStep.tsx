'use client';

import { useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { OnboardingCountStepper } from '@/components/onboarding/children-count/OnboardingCountStepper';
import { ONBOARDING_CHILDREN_PHONE_IMAGE } from '@/constants/onboarding-figma';
import {
  ONBOARDING_CHILDREN_PHONE_MAX,
  ONBOARDING_CHILDREN_PHONE_MIN,
} from '@/lib/onboarding/childrenPhoneCount';

type ChildrenPhoneCountStepProps = {
  count: number;
  onCountChange: (count: number) => void;
};

/** Children phone count — second step on /onboarding/parent. */
export function ChildrenPhoneCountStep({
  count,
  onCountChange,
}: ChildrenPhoneCountStepProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section
      className="absolute left-0 right-0 top-[130px] z-[10] flex flex-col items-center gap-[19px] px-v03-gutter"
      aria-label="מספר ילדים עם טלפון"
    >
      <div className="relative h-[180px] w-[180px] shrink-0">
        {!imageFailed && (
          <OnboardingLazyImage
            src={ONBOARDING_CHILDREN_PHONE_IMAGE}
            alt=""
            className="pointer-events-none absolute left-[-13px] top-[-18.5px] h-[205px] w-[205px] object-contain"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="flex w-full max-w-v03-content flex-col items-center gap-[35px]">
        <header className="flex w-full flex-col items-center justify-center gap-1 px-[15px]">
          <h1 className="w-full text-center font-simpler text-[30px] font-black leading-[34.5px] text-white">
            כמה מהילדים במשפחה משתמשים בטלפון?
          </h1>
          <p className="w-full text-center font-simpler text-[24px] font-normal leading-[30px] text-white/80">
            בין הגילאים 6-12
          </p>
        </header>

        <OnboardingCountStepper
          value={count}
          min={ONBOARDING_CHILDREN_PHONE_MIN}
          max={ONBOARDING_CHILDREN_PHONE_MAX}
          onChange={onCountChange}
        />
      </div>
    </section>
  );
}
