'use client';

import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

/** In-canvas grid layer — sits above green bleed, below kingdom / ellipses. */
export function OnboardingGridLayer({ className = '' }: { className?: string }) {
  const bleedStyle = useFunnelFullBleed();

  return (
    <div
      className={`v03-onboarding-grid-layer pointer-events-none absolute z-[1] ${className}`}
      style={bleedStyle}
      aria-hidden
    />
  );
}
