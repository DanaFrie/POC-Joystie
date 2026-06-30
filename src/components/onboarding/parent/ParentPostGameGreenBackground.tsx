'use client';

import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

/** Figma 13615 — green canvas + turquoise ellipse (bottom-right mint glow). */
export function ParentPostGameGreenBackground() {
  const bleedStyle = useFunnelFullBleed();

  return (
    <>
      <div
        className="pointer-events-none z-0 bg-v03-green-900"
        style={bleedStyle}
        aria-hidden
      />
      <OnboardingMintGlow />
    </>
  );
}
