'use client';

import { useLayoutEffect, useState } from 'react';
import { V03_DESKTOP_MIN_WIDTH } from '@/constants/v03-screen';

/** In-canvas grid above green/mint background — Figma post-game screens. */
export function ChildPostGameGrid() {
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

  return <div className="v03-onboarding-grid-layer absolute inset-0 z-[2]" aria-hidden />;
}
