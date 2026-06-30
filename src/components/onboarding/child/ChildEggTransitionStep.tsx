'use client';

import { useEffect } from 'react';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';
import { CHILD_EGG_TRANSITION_AUTO_MS } from '@/constants/child-onboarding-assets';

/** Post-egg grey bridge — Figma between hatch and Dori reveal. No back affordance. */
export function ChildEggTransitionStep({ onComplete }: { onComplete: () => void }) {
  const fillStyle = useFunnelFullBleed();

  useEffect(() => {
    const timer = window.setTimeout(onComplete, CHILD_EGG_TRANSITION_AUTO_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        ...fillStyle,
        background: 'linear-gradient(180deg, #E1E1E1 0%, #FFF 40%)',
      }}
      aria-hidden
    />
  );
}
