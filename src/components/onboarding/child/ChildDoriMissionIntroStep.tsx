'use client';

import { useEffect, useRef } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { ChildDoriContinueFooter } from '@/components/onboarding/child/ChildDoriContinueFooter';
import { ChildDoriMediaFrame } from '@/components/onboarding/child/ChildDoriMediaFrame';
import { ChildSpeechBubble } from '@/components/onboarding/child/ChildSpeechBubble';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_DORI_MISSION_INTRO } from '@/constants/child-onboarding-layout';

/** Screen 8 — Figma 13656:6740. Three missions intro (same shell as Dori reveal). */
export function ChildDoriMissionIntroStep({ onContinue }: { onContinue?: () => void }) {
  const layout = CHILD_DORI_MISSION_INTRO;
  const bubble = layout.bubble;
  const scaleY = useFunnelProportionalTopPx;
  const bubbleTopPx = scaleY(bubble.top);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {});
  }, []);

  return (
    <FunnelStepRoot fitViewport aria-label="שלוש משימות" className="overflow-hidden bg-transparent">
      <OnboardingMintGlow />

      <ChildSpeechBubble
        top={bubbleTopPx}
        width={bubble.width}
        tailLeft={bubble.tailLeft}
        tailBorderOverlap={bubble.tailBorderOverlap}
        tailPosition="bottom"
        paddingTop={bubble.paddingTop}
        paddingBottom={bubble.paddingBottom}
      >
        <p className="w-full text-center font-simpler text-[24px] font-normal leading-[1.25] tracking-[-0.36px] text-white">
          כדי להתחיל לחסוך זמן מסך וכסף, עלינו לעבור בהצלחה 3 משימות.
        </p>
        <p className="w-full text-center font-simpler text-[24px] font-black leading-[1.15] tracking-[-0.36px] text-white">
          בואו נצא לדרך!
        </p>
      </ChildSpeechBubble>

      <ChildDoriMediaFrame top={layout.mediaTop}>
        <video
          ref={videoRef}
          src={CHILD_ONBOARDING_ASSETS.doriPhone}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="pointer-events-none h-full w-full object-contain object-center"
          aria-hidden
        />
      </ChildDoriMediaFrame>

      <ChildDoriContinueFooter onClick={onContinue} />
    </FunnelStepRoot>
  );
}
