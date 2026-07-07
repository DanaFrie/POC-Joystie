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
function isChildOnboardingRoute(pathname: string | null) {
  return pathname === '/onboarding/child' || (pathname?.startsWith('/onboarding/child/') ?? false);
}

const ROUTES_WITHOUT_GRID = ['/onboarding'];
/** Child funnel manages its own bleed layers per step. */
/** Ball game — own grid texture + mint ellipse (`BallGameFunnelBackground`). */
const GAME_FUNNEL_ROUTES = ['/game', '/game/child'];
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
  const isGameRoute = GAME_FUNNEL_ROUTES.includes(pathname ?? '');
  const surface = LIGHT_FUNNEL_ROUTES.includes(pathname ?? '')
    ? 'light'
    : 'dark';
  const isChildRoute = isChildOnboardingRoute(pathname);
  const showGrid =
    !ROUTES_WITHOUT_GRID.includes(pathname ?? '') && !isChildRoute && !isGameRoute;
  const showBleedBackground =
    surface === 'dark' && !isChildRoute && !isGameRoute;

  return (
    <FunnelViewport
      surface={surface}
      scaleMode="scroll"
      ignoreSafeArea={isGameRoute}
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
