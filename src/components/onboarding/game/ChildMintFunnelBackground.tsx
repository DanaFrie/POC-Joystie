'use client';

import { FunnelMintEllipse } from '@/components/onboarding/game/FunnelMintEllipse';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

/** Mission 1 intro + mint Dori screens — green-900 + bottom-left ellipse only. */
export function ChildMintFunnelBackground() {
  const bleedStyle = useFunnelFullBleed();

  return (
    <>
      <div className="pointer-events-none absolute z-0 bg-v03-green-900" style={bleedStyle} aria-hidden />
      <FunnelMintEllipse />
    </>
  );
}
