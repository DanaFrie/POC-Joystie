'use client';

import { useEffect, useRef } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { ChildContinueGlowButton } from '@/components/onboarding/child/ChildContinueGlowButton';
import { ChildSpeechBubble } from '@/components/onboarding/child/ChildSpeechBubble';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_DORI_MISSION_INTRO } from '@/constants/child-onboarding-layout';

/** Screen 8 — Figma 13147:5624. Three missions intro. */
export function ChildDoriMissionIntroStep({ onContinue }: { onContinue?: () => void }) {
  const layout = CHILD_DORI_MISSION_INTRO;
  const hero = layout.hero;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {});
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      <OnboardingMintGlow />

      <div
        className="pointer-events-none absolute z-[2] overflow-hidden"
        style={{ left: hero.left, top: hero.top, width: hero.size, height: hero.size }}
      >
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
      </div>

      <ChildSpeechBubble top={layout.bubble.top} width={layout.bubble.width} left={layout.bubble.left}>
        <div className="flex-1 whitespace-pre-wrap text-center font-simpler text-[24px] leading-[30px] tracking-[-0.36px] text-white">
          <p className="mb-0">כדי להתחיל לחסוך זמן מסך וכסף, עלינו לעבור בהצלחה 3 משימות.</p>
          <p className="font-bold">בוא נצא לדרך!</p>
        </div>
      </ChildSpeechBubble>

      <div
        className="absolute left-1/2 z-10 -translate-x-1/2"
        style={{ top: layout.continue.top, width: layout.continue.width }}
      >
        <ChildContinueGlowButton onClick={onContinue} />
      </div>
    </div>
  );
}
