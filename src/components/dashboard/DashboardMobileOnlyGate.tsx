'use client';

import { useEffect, useState } from 'react';
import { FunnelDesktopOverlay } from '@/components/ui/FunnelDesktopOverlay';
import { V03_DESKTOP_MIN_WIDTH } from '@/constants/v03-screen';

/**
 * Dashboard (and other non-funnel) routes — same branded desktop gate as
 * FunnelViewport: grid + logo + «אנחנו זמינים במובייל» + waiting gif.
 */
export function DashboardMobileOnlyGate({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= V03_DESKTOP_MIN_WIDTH);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isDesktop) {
    return <FunnelDesktopOverlay position="fixed" />;
  }

  return <>{children}</>;
}
