'use client';

import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';

/** Screen 2 — green canvas + Ellipse 385 (bottom-left mint glow). */
export function ChildMintGlowStep() {
  return (
    <div
      className="relative h-full w-full overflow-visible bg-transparent"
      aria-hidden
    >
      <OnboardingMintGlow />
    </div>
  );
}
