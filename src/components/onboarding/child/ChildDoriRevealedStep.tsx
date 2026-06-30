'use client';

import { useEffect, useRef } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { ChildDoriContinueFooter } from '@/components/onboarding/child/ChildDoriContinueFooter';
import { ChildDoriMediaFrame } from '@/components/onboarding/child/ChildDoriMediaFrame';
import { ChildSpeechBubble } from '@/components/onboarding/child/ChildSpeechBubble';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_DORI_REVEALED } from '@/constants/child-onboarding-layout';

/** Screen 6 — Figma 13656:6594. Dori revealed after egg hatch. */
export function ChildDoriRevealedStep({
  childName,
  onContinue,
}: {
  childName: string;
  onContinue?: () => void;
}) {
  const layout = CHILD_DORI_REVEALED;
  const bubble = layout.bubble;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {});
  }, []);

  return (
    <div className="relative h-full w-full overflow-visible bg-transparent">
      <OnboardingMintGlow />

      <ChildSpeechBubble
        top={bubble.top}
        width={bubble.width}
        left={bubble.left}
        tailLeft={bubble.tailLeft}
        tailBorderOverlap={bubble.tailBorderOverlap}
        tailPosition="bottom"
        paddingTop={bubble.paddingTop}
        paddingBottom={bubble.paddingBottom}
        appearance={{ gap: 0 }}
      >
        <p className="w-full text-center font-simpler text-[24px] font-normal leading-[1.25] tracking-[-0.36px] text-white">
          {`אין עליך ${childName}!`}
          <br />
          <span className="font-black">תודה שהערת אותי!</span>
        </p>
      </ChildSpeechBubble>

      <ChildDoriMediaFrame>
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

      <ChildDoriContinueFooter onClick={onContinue} />
    </div>
  );
}
