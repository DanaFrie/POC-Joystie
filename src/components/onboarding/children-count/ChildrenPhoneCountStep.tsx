'use client';

import { useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { OnboardingCountStepper } from '@/components/onboarding/children-count/OnboardingCountStepper';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { ONBOARDING_CHILDREN_PHONE_IMAGE } from '@/constants/onboarding-figma';
import { PARENT_PHONE_COUNT_STEP } from '@/constants/parent-onboarding-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import {
  ONBOARDING_CHILDREN_PHONE_MAX,
  ONBOARDING_CHILDREN_PHONE_MIN,
} from '@/lib/onboarding/childrenPhoneCount';

type ChildrenPhoneCountStepProps = {
  count: number;
  onCountChange: (count: number) => void;
};

/** Children phone count — flow stack inside `FunnelStepForeground`. */
export function ChildrenPhoneCountStep({
  count,
  onCountChange,
}: ChildrenPhoneCountStepProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const layout = PARENT_PHONE_COUNT_STEP;
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const topPx = (layout.top / V03_SCREEN_HEIGHT) * usableCanvasHeightPx;

  return (
    <section
      className="pointer-events-auto flex w-full flex-col items-center px-v03-gutter"
      style={{ paddingTop: topPx, gap: layout.columnGap }}
      aria-label="מספר ילדים עם טלפון"
    >
      <div className="v03-funnel-enter-0 relative h-[180px] w-[180px] shrink-0">
        {!imageFailed && (
          <OnboardingLazyImage
            src={ONBOARDING_CHILDREN_PHONE_IMAGE}
            alt=""
            className="pointer-events-none absolute left-[-13px] top-[-18.5px] h-[205px] w-[205px] object-contain"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div
        className="flex w-full max-w-v03-content flex-col items-center"
        style={{ gap: layout.contentGap }}
      >
        <header className="v03-funnel-enter-1 flex w-full flex-col items-stretch justify-center gap-1 self-stretch px-[15px]">
          <h1 className="w-full self-stretch text-center font-simpler text-[30px] font-extrabold leading-[1.1] tracking-[-0.9px] text-white">
            כמה מהילדים במשפחה משתמשים בטלפון?
          </h1>
          <p className="w-full self-stretch text-center font-simpler text-[24px] font-normal leading-[1.35] tracking-[-0.72px] text-white/80">
            בין הגילאים 6-14
          </p>
        </header>

        <div className="v03-funnel-enter-2">
          <OnboardingCountStepper
            value={count}
            min={ONBOARDING_CHILDREN_PHONE_MIN}
            max={ONBOARDING_CHILDREN_PHONE_MAX}
            onChange={onCountChange}
          />
        </div>
      </div>
    </section>
  );
}
