'use client';

import { useLayoutEffect, useState } from 'react';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';
import { V03_DESKTOP_MIN_WIDTH } from '@/constants/v03-screen';

/** In-canvas grid above green/mint background — Figma post-game screens. */
export function ChildPostGameGrid({ enabled = true }: { enabled?: boolean }) {
  const bleedStyle = useFunnelFullBleed();
  const [hidden, setHidden] = useState(true);

  useLayoutEffect(() => {
    const sync = () => {
      setHidden(window.innerWidth >= V03_DESKTOP_MIN_WIDTH);
    };
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
    };
  }, []);

  if (!enabled || hidden) {
    return null;
  }

  return (
    <div
      className="v03-onboarding-grid-layer pointer-events-none absolute z-[2]"
      style={bleedStyle}
      aria-hidden
    />
  );
}
