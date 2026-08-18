'use client';

import { useLayoutEffect, useState } from 'react';
import { OnboardingGridLayer } from '@/components/onboarding/OnboardingGridLayer';
import { V03_DESKTOP_MIN_WIDTH } from '@/constants/v03-screen';

/**
 * Funnel grid — in-canvas layer between green bleed (z-0) and heroes (z-[2]+).
 * Bleeds into letterbox gaps on tall viewports (S20).
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

  return <OnboardingGridLayer />;
}
