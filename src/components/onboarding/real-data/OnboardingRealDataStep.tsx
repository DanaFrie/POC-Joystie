'use client';

import { StatsComparisonCards } from '@/components/onboarding/real-data/StatsComparisonCards';
import { StatsPhoneMockup } from '@/components/onboarding/real-data/StatsPhoneMockup';
import { ONBOARDING_BLUR_FOOTER_RESERVE_CLASS } from '@/components/onboarding/OnboardingBlurFooter';
import {
  REVEAL_REAL_DATA_CARDS_MIN_H_PX,
  REVEAL_REAL_DATA_CONTENT_GAP_PX,
  REVEAL_REAL_DATA_CONTENT_TOP_PX,
  REVEAL_REAL_DATA_PHONE_H_PX,
  REVEAL_REAL_DATA_PHONE_TOP_PX,
  REVEAL_REAL_DATA_PHONE_W_PX,
} from '@/constants/reveal-real-data-layout';

/** Figma 12910:9075 — phone + «נתונים של משתמשים אמיתיים» comparison. */
export function OnboardingRealDataStep() {
  return (
    <section
      className={`v03-real-data-step absolute inset-0 z-[10] overflow-y-auto v03-scroll-hidden ${ONBOARDING_BLUR_FOOTER_RESERVE_CLASS}`}
      aria-label="נתונים של משתמשים אמיתיים"
    >
      <div
        className="absolute left-1/2 z-[1] flex -translate-x-1/2 justify-center"
        style={{
          top: REVEAL_REAL_DATA_PHONE_TOP_PX,
          width: REVEAL_REAL_DATA_PHONE_W_PX,
          height: REVEAL_REAL_DATA_PHONE_H_PX,
        }}
      >
        <div className="v03-funnel-enter-reveal-0">
          <StatsPhoneMockup />
        </div>
      </div>

      <div
        className="absolute inset-x-0 z-[1] flex flex-col items-center"
        style={{
          top: REVEAL_REAL_DATA_CONTENT_TOP_PX,
          gap: REVEAL_REAL_DATA_CONTENT_GAP_PX,
        }}
      >
        <p className="v03-funnel-enter-reveal-1 w-full text-center font-simpler text-base font-normal leading-[1.35] tracking-[-0.24px] text-v03-green-400">
          נתונים של משתמשים אמיתיים:
        </p>
        <div
          className="w-full"
          style={{ minHeight: REVEAL_REAL_DATA_CARDS_MIN_H_PX }}
        >
          <StatsComparisonCards />
        </div>
      </div>
    </section>
  );
}
