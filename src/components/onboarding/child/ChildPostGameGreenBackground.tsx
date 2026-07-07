'use client';

import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

/** Green-900 canvas + bottom-left mint ellipse — mission 2+ post-game. */
export function ChildPostGameGreenBackground() {
  const bleedStyle = useFunnelFullBleed();

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-visible" aria-hidden>
      <div className="bg-v03-green-900" style={bleedStyle} />
      <OnboardingMintGlow />
    </div>
  );
}
