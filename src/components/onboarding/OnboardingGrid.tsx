'use client';

import { useLayoutEffect, useState } from 'react';
import { FunnelRootPortal } from '@/components/ui/FunnelRootPortal';
import { V03_DESKTOP_MIN_WIDTH } from '@/constants/v03-screen';

/**
 * Viewport-fixed funnel grid (landing `bg-grid` method) — bleeds on all mobile widths.
 * Portaled below funnel content on `[data-v03-funnel]`.
 */
export function OnboardingGrid() {
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

  if (hidden) {
    return null;
  }

  return (
    <FunnelRootPortal>
      <div className="v03-funnel-grid" aria-hidden />
    </FunnelRootPortal>
  );
}
