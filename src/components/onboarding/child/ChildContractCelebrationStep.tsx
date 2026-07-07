'use client';

import { useEffect, useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import {
  FunnelStepForeground,
  FunnelStepRoot,
  FunnelStepSection,
} from '@/components/ui/funnel-layout';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { SIGNUP_JOURNEY_STEP3_IMAGE } from '@/constants/onboarding-figma';
import { CHILD_CONTRACT_CELEBRATION } from '@/constants/child-post-game-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import {
  CHILD_CONTRACT_CONTINUE_LABEL,
  CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_SUBTITLE,
  CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_TITLE,
} from '@/lib/onboarding/childPostGameCopy';

type ChildContractCelebrationStepProps = {
  onContinue?: () => void;
};

/** Light contract win — agreements hero + one-shot confetti, then CTA. */
export function ChildContractCelebrationStep({ onContinue }: ChildContractCelebrationStepProps) {
  const layout = CHILD_CONTRACT_CELEBRATION;
  const [confettiVisible, setConfettiVisible] = useState(true);
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const gapScale = usableCanvasHeightPx / V03_SCREEN_HEIGHT;
  const heroSize = Math.round(layout.heroSize * Math.min(1, gapScale + 0.04));
  const outerGap = Math.max(12, Math.round(layout.outerGap * gapScale));
  const heroGap = Math.max(12, Math.round(layout.heroGap * gapScale));
  const titleSize = Math.max(32, Math.round(layout.title.fontSize * Math.min(1, gapScale + 0.05)));

  useEffect(() => {
    const timer = window.setTimeout(() => setConfettiVisible(false), layout.confettiMs);
    return () => window.clearTimeout(timer);
  }, [layout.confettiMs]);

  return (
    <FunnelStepRoot fitViewport className="overflow-hidden bg-transparent" aria-label="חגיגת חוזה">
      <div
        className="pointer-events-none absolute inset-0 z-[20] flex items-center justify-center overflow-hidden"
        style={{
          opacity: confettiVisible ? 1 : 0,
          transition: 'opacity 400ms ease-out',
        }}
        aria-hidden={!confettiVisible}
      >
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.confettiPurple}
          alt=""
          className="object-cover object-center"
          style={{
            width: layout.confettiWidth,
            height: layout.confettiHeight,
            maxHeight: '100%',
          }}
          priority
        />
      </div>

      <FunnelStepForeground fitViewport distribution="between" padTopPx={0} padBottomPx={34}>
        <FunnelStepSection className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <div
            className="flex w-full max-w-v03-content flex-col items-center"
            style={{ gap: outerGap }}
          >
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: heroGap }}
            >
              <OnboardingLazyImage
                src={SIGNUP_JOURNEY_STEP3_IMAGE}
                alt=""
                className="shrink-0 object-cover"
                style={{ width: heroSize, height: heroSize }}
                priority
              />

              <h1
                className="w-full text-center font-simpler font-black"
                style={{
                  fontSize: titleSize,
                  lineHeight: `${layout.title.lineHeight}px`,
                  color: layout.title.color,
                }}
              >
                {CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_TITLE}
                <br />
                {CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_SUBTITLE}
              </h1>
            </div>
          </div>
        </FunnelStepSection>

        {onContinue ? (
          <FunnelStepSection>
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex h-[55px] w-full items-center justify-center rounded-[22px] bg-v03-turquoise-300 px-[15px] py-2 font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95"
            >
              {CHILD_CONTRACT_CONTINUE_LABEL}
            </button>
          </FunnelStepSection>
        ) : null}
      </FunnelStepForeground>
    </FunnelStepRoot>
  );
}
