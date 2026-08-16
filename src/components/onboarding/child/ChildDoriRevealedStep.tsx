'use client';

import { useEffect, useRef } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { ChildDoriContinueFooter } from '@/components/onboarding/child/ChildDoriContinueFooter';
import { ChildDoriMediaFrame } from '@/components/onboarding/child/ChildDoriMediaFrame';
import { ChildSpeechBubble } from '@/components/onboarding/child/ChildSpeechBubble';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_DORI_REVEALED } from '@/constants/child-onboarding-layout';

/**
 * Post–egg hatch — Dori animation + combined thank-you / 3-missions bubble, then game.
 * Merges former screens 6 + 8 (Figma 13656).
 */
export function ChildDoriRevealedStep({
  childName,
  onContinue,
}: {
  childName: string;
  onContinue?: () => void;
}) {
  const layout = CHILD_DORI_REVEALED;
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
    <FunnelStepRoot
      fitViewport
      aria-label="דורי מתעורר — שלוש משימות"
      className="overflow-hidden bg-transparent"
    >
      <OnboardingMintGlow />

      <ChildSpeechBubble
        top={bubbleTopPx}
        width={bubble.width}
        tailLeft={bubble.tailLeft}
        tailBorderOverlap={bubble.tailBorderOverlap}
        tailPosition="bottom"
        paddingTop={bubble.paddingTop}
        paddingBottom={bubble.paddingBottom}
        appearance={{ gap: bubble.contentGap }}
      >
        <p
          className="w-full text-center font-simpler font-normal text-white"
          style={{
            fontSize: 24,
            lineHeight: '135%',
            letterSpacing: '-0.72px',
          }}
        >
          {`תודה שהערת אותי, ${childName}!`}
        </p>
        <p
          className="w-full text-center font-simpler font-black text-white"
          style={{
            fontSize: 24,
            fontWeight: 800,
            lineHeight: '110%',
            letterSpacing: '-0.72px',
          }}
        >
          כדי לצאת לדרך, עלינו לעבור יחד 3 משימות!
        </p>
      </ChildSpeechBubble>

      <ChildDoriMediaFrame top={layout.mediaTop}>
        <video
          ref={videoRef}
          src={CHILD_ONBOARDING_ASSETS.doriRevealTransitionVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="pointer-events-none h-full w-full object-contain object-center"
          aria-hidden
        />
      </ChildDoriMediaFrame>

      <ChildDoriContinueFooter onClick={onContinue} enableAfterMs={0} />
    </FunnelStepRoot>
  );
}
