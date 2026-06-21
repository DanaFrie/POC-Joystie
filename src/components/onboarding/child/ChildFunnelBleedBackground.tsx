'use client';

import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

/** Dark funnel fill — extends into contain letterbox gaps (same pattern as parent onboarding). */
export function ChildFunnelBleedBackground() {
  const bleedStyle = useFunnelFullBleed();

  return (
    <div
      className="pointer-events-none z-0 bg-v03-green-900"
      style={bleedStyle}
      aria-hidden
    />
  );
}
