'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { OnboardingGrid } from '@/components/onboarding/OnboardingGrid';
import { FunnelViewport } from '@/components/ui/FunnelViewport';
import { useFunnelDesktop } from '@/components/ui/FunnelViewportContext';

/** Grid on landing is rendered in `OnboardingLanding`; parent flow adds per-step grid. */
const ROUTES_WITHOUT_GRID = ['/onboarding', '/onboarding/child'];
const LIGHT_FUNNEL_ROUTES: string[] = [];

function OnboardingFunnelContent({ children }: { children: ReactNode }) {
  const isDesktop = useFunnelDesktop();

  if (isDesktop) {
    return null;
  }

  return <>{children}</>;
}

/**
 * /onboarding/* — mobile: 375×812 width-fill scaling (no side letterbox).
 * Desktop (≥768px): green canvas + grid + «זמין במובייל בלבד» only.
 */
export function OnboardingFunnelFrame({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const showGrid = !ROUTES_WITHOUT_GRID.includes(pathname ?? '');
  const surface = LIGHT_FUNNEL_ROUTES.includes(pathname ?? '')
    ? 'light'
    : 'dark';

  return (
    <FunnelViewport
      surface={surface}
      scaleMode="width"
      ignoreSafeArea={false}
      className={`font-simpler text-v03-text-on-dark ${className}`}
    >
      <div className="relative h-full w-full">
        {showGrid && <OnboardingGrid />}
        <OnboardingFunnelContent>{children}</OnboardingFunnelContent>
      </div>
    </FunnelViewport>
  );
}
