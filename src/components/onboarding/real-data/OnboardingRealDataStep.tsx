'use client';

import { StatsComparisonCards } from '@/components/onboarding/real-data/StatsComparisonCards';
import { StatsPhoneMockup } from '@/components/onboarding/real-data/StatsPhoneMockup';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import {
  REVEAL_REAL_DATA_CONTENT_GAP_PX,
  REVEAL_REAL_DATA_CONTENT_OVERLAP_PX,
  REVEAL_REAL_DATA_PHONE_TOP_PX,
} from '@/constants/reveal-real-data-layout';
import { REVEAL_PHONE_CLUSTER_WIDTH_PX } from '@/constants/reveal-phone-layout';

/** Break out of foreground gutter so the 331px card cluster fits the 375px canvas. */
const CARDS_GUTTER_BREAKOUT_STYLE = {
  marginInline: 'calc(-1 * var(--v03-gutter))',
  width: 'calc(100% + 2 * var(--v03-gutter))',
} as const;

/** Figma 12910:9075 — phone + «נתונים של משתמשים אמיתיים» comparison. */
export function OnboardingRealDataStep() {
  const phoneTop = useFunnelProportionalTopPx(REVEAL_REAL_DATA_PHONE_TOP_PX);

  return (
    <section
      className="v03-real-data-step relative flex h-full min-h-0 w-full flex-col overflow-hidden"
      aria-label="נתונים של משתמשים אמיתיים"
    >
      <div
        className="relative z-[1] flex shrink-0 justify-center overflow-hidden px-v03-gutter"
        style={{ paddingTop: phoneTop }}
      >
        <div
          className="overflow-hidden"
          style={{ width: REVEAL_PHONE_CLUSTER_WIDTH_PX }}
        >
          <div className="v03-funnel-enter-reveal-0">
            <StatsPhoneMockup />
          </div>
        </div>
      </div>

      <div
        className="relative z-[3] flex min-h-0 flex-1 flex-col items-center overflow-hidden"
        style={{ marginTop: -REVEAL_REAL_DATA_CONTENT_OVERLAP_PX }}
      >
        <div
          className="flex w-full flex-col items-center overflow-hidden"
          style={{
            gap: REVEAL_REAL_DATA_CONTENT_GAP_PX,
            paddingTop: 4,
          }}
        >
          <p className="v03-funnel-enter-reveal-1 w-full max-w-v03-content px-v03-gutter text-center font-simpler text-base font-normal leading-[1.35] tracking-[-0.24px] text-v03-green-400">
            נתונים של משתמשים אמיתיים:
          </p>
          <div
            className="flex w-full justify-center overflow-hidden"
            style={CARDS_GUTTER_BREAKOUT_STYLE}
          >
            <StatsComparisonCards />
          </div>
        </div>
      </div>
    </section>
  );
}
