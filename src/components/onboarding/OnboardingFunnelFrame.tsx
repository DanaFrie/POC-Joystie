'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { OnboardingGrid } from '@/components/onboarding/OnboardingGrid';
import { OnboardingFunnelBleedBackground } from '@/components/onboarding/OnboardingFunnelBleedBackground';
import { FunnelViewport } from '@/components/ui/FunnelViewport';
import {
  FunnelHeroPortalMount,
  FunnelStepContentLayer,
} from '@/components/ui/FunnelHeroPortalMount';
import { useFunnelDesktop } from '@/components/ui/FunnelViewportContext';

/** Grid on landing is rendered in `OnboardingLanding`; parent flow adds per-step grid. */
const ROUTES_WITHOUT_GRID = ['/onboarding', '/onboarding/child'];
/** Child funnel manages its own bleed layers per step. */
const ROUTES_WITH_OWN_BLEED = ['/onboarding/child'];
const LIGHT_FUNNEL_ROUTES: string[] = [];

function OnboardingFunnelContent({ children }: { children: ReactNode }) {
  const isDesktop = useFunnelDesktop();

  if (isDesktop) {
    return null;
  }

  return <>{children}</>;
}

/**
 * /onboarding/* — mobile: width-fit 375×812; short viewports scroll instead of shrinking.
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
  const surface = LIGHT_FUNNEL_ROUTES.includes(pathname ?? '')
    ? 'light'
    : 'dark';
  const showGrid = !ROUTES_WITHOUT_GRID.includes(pathname ?? '');
  const showBleedBackground =
    surface === 'dark' && !ROUTES_WITH_OWN_BLEED.includes(pathname ?? '');

  return (
    <FunnelViewport
      surface={surface}
      scaleMode="scroll"
      ignoreSafeArea={false}
      className={`font-simpler text-v03-text-on-dark ${className}`}
    >
      <div className="relative h-full w-full">
        {showBleedBackground ? <OnboardingFunnelBleedBackground /> : null}
        <FunnelHeroPortalMount />
        {showGrid && <OnboardingGrid />}
        <FunnelStepContentLayer>
          <OnboardingFunnelContent>{children}</OnboardingFunnelContent>
        </FunnelStepContentLayer>
      </div>
    </FunnelViewport>
  );
}
