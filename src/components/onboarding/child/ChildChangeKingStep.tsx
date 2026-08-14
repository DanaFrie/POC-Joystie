'use client';

import { useEffect, useRef } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildPostGameFunnelShell } from '@/components/onboarding/child/ChildPostGameFunnelShell';
import {
  FunnelStepForeground,
  FunnelStepSection,
} from '@/components/ui/funnel-layout';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import {
  CHILD_CHANGE_KING,
  CHILD_KING_CONFETTI_MS,
} from '@/constants/child-post-game-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import {
  childChangeKingBody,
  childChangeKingHeadline,
} from '@/lib/onboarding/childPostGameCopy';

type ChildChangeKingStepProps = {
  childName: string;
  childGender: 'boy' | 'girl';
  onConfettiEnd: () => void;
};

/** Figma 13466:18573 — king celebration over notebook hero. */
export function ChildChangeKingStep({
  childName,
  childGender,
  onConfettiEnd,
}: ChildChangeKingStepProps) {
  const layout = CHILD_CHANGE_KING;
  const confetti = layout.confetti;
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const gapScale = usableCanvasHeightPx / V03_SCREEN_HEIGHT;
  const contentGap = Math.max(12, Math.round(layout.contentGap * gapScale));
  const textGap = Math.max(12, Math.round(layout.textGap * gapScale));
  const heroSize = Math.round(layout.heroSize * Math.min(1, gapScale + 0.04));
  const titleSize = Math.max(32, Math.round(layout.title.fontSize * Math.min(1, gapScale + 0.05)));

  const onConfettiEndRef = useRef(onConfettiEnd);
  onConfettiEndRef.current = onConfettiEnd;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onConfettiEndRef.current();
    }, CHILD_KING_CONFETTI_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ChildPostGameFunnelShell ellipse="upper">
      <div
        className="pointer-events-none absolute z-[30]"
        style={{
          top: confetti.top,
          left: confetti.left,
          width: confetti.width,
          height: confetti.height,
        }}
        aria-hidden
      >
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.confettiPurple}
          alt=""
          className="size-full object-cover object-center"
          priority
        />
      </div>

      <FunnelStepForeground
        fitViewport
        distribution="center"
        padTopPx={layout.contentTop}
        padBottomPx={34}
        aria-label="חגיגת בחירת שינוי"
      >
        <FunnelStepSection className="flex flex-col items-center">
          <div
            className="flex w-full max-w-v03-content flex-col items-center"
            style={{ gap: contentGap }}
          >
            <div
              className="relative shrink-0 overflow-visible"
              style={{ width: heroSize, height: heroSize }}
            >
              <OnboardingLazyImage
                src={CHILD_ONBOARDING_ASSETS.doriNotebookOpen}
                alt=""
                className="size-full object-cover object-center"
                priority
              />
            </div>

            <div
              className="flex w-full flex-col items-center self-stretch"
              style={{ gap: textGap }}
            >
              <div
                className="flex w-full flex-col items-end justify-center self-stretch px-[15px]"
                style={{ gap: layout.titleGap }}
              >
                <h1
                  className="w-full text-center font-simpler font-black text-white"
                  style={{
                    fontSize: titleSize,
                    lineHeight: `${Math.round(titleSize * 1.1)}px`,
                  }}
                >
                  {childChangeKingHeadline(childName, childGender)}
                </h1>
              </div>
              <p
                className="text-center font-simpler font-normal text-white"
                style={{
                  width: layout.body.width,
                  fontSize: layout.body.fontSize,
                  lineHeight: `${layout.body.lineHeight}px`,
                }}
              >
                {childChangeKingBody(childGender)}
              </p>
            </div>
          </div>
        </FunnelStepSection>
      </FunnelStepForeground>
    </ChildPostGameFunnelShell>
  );
}
