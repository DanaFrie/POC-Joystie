'use client';

import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

/** Green-900 fill — extends into letterbox gaps on tall/wide viewports (S20, contain). */
export function OnboardingFunnelBleedBackground() {
  const bleedStyle = useFunnelFullBleed();

  return (
    <div
      className="pointer-events-none absolute z-0 bg-v03-green-900"
      style={bleedStyle}
      aria-hidden
    />
  );
}
