'use client';

import { StatsComparisonCards } from '@/components/onboarding/real-data/StatsComparisonCards';
import { StatsPhoneMockup } from '@/components/onboarding/real-data/StatsPhoneMockup';
import { ONBOARDING_BLUR_FOOTER_RESERVE_CLASS } from '@/components/onboarding/OnboardingBlurFooter';

const BACK_TOP_PX = 82;
const BACK_HEIGHT_PX = 24;
const GAP_BELOW_BACK_PX = 17;
const UPPER_BLOCK_TOP_PX = BACK_TOP_PX + BACK_HEIGHT_PX + GAP_BELOW_BACK_PX;
const UPPER_BLOCK_HEIGHT_PX = 237.51;
const HORIZONTAL_INSET_PX = 24;
const LOWER_BLOCK_GAP_PX = 15;

/** Figma — installed phone + real-user stats comparison. */
export function OnboardingRealDataStep() {
  const lowerBlockTop =
    UPPER_BLOCK_TOP_PX + UPPER_BLOCK_HEIGHT_PX + LOWER_BLOCK_GAP_PX;

  return (
    <section
      className={`absolute inset-x-0 top-0 z-[10] overflow-y-auto v03-scroll-hidden ${ONBOARDING_BLUR_FOOTER_RESERVE_CLASS}`}
      aria-label="נתונים של משתמשים אמיתיים"
    >
      <div
        className="absolute inset-x-0 z-[1] flex justify-center"
        style={{
          top: UPPER_BLOCK_TOP_PX,
          height: UPPER_BLOCK_HEIGHT_PX,
          paddingLeft: HORIZONTAL_INSET_PX,
          paddingRight: HORIZONTAL_INSET_PX,
        }}
      >
        <div className="v03-fade-in-seq-0">
          <StatsPhoneMockup />
        </div>
      </div>

      <div
        className="absolute inset-x-0 z-[1] flex flex-col items-center gap-[14px]"
        style={{
          top: lowerBlockTop,
          paddingLeft: HORIZONTAL_INSET_PX,
          paddingRight: HORIZONTAL_INSET_PX,
        }}
      >
        <p className="v03-fade-in-seq-1 w-full self-stretch text-center font-simpler text-[16px] font-normal leading-[25px] text-v03-green-400">
          נתונים של משתמשים אמיתיים:
        </p>
        <div className="v03-fade-in-seq-2 w-full">
          <StatsComparisonCards />
        </div>
      </div>
    </section>
  );
}
