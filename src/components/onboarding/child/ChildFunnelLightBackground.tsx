'use client';

import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

/** Screens 5–5b — light gradient canvas (Figma 13147:5625). */
export function ChildFunnelLightBackground({
  whiteStopPercent = 40,
}: {
  whiteStopPercent?: number;
}) {
  const bleedStyle = useFunnelFullBleed();

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-visible" aria-hidden>
      <div
        style={{
          ...bleedStyle,
          background: `linear-gradient(180deg, #E1E1E1 0%, #FFFFFF ${whiteStopPercent}%)`,
        }}
      />
    </div>
  );
}
