'use client';

import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

/** Figma 13615 — green canvas + turquoise ellipse (bottom-right mint glow). */
export function ParentPostGameGreenBackground() {
  const bleedStyle = useFunnelFullBleed();

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-visible" aria-hidden>
      <div className="bg-v03-green-900" style={bleedStyle} />
      <OnboardingMintGlow />
    </div>
  );
}
