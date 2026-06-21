'use client';

import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

/** Light reveal background — extends into contain letterbox gaps on mobile. */
export function OnboardingRevealBleedBackground() {
  const bleedStyle = useFunnelFullBleed();

  return (
    <div
      className="v03-funnel-surface-light pointer-events-none z-0"
      style={bleedStyle}
      aria-hidden
    />
  );
}
