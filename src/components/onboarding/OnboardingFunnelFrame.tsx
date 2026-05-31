'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { OnboardingGrid } from '@/components/onboarding/OnboardingGrid';
import { FunnelViewport } from '@/components/ui/FunnelViewport';
import { useFunnelDesktop } from '@/components/ui/FunnelViewportContext';

const ROUTES_WITHOUT_GRID = [
  '/onboarding/parent',
  '/onboarding/reveal',
  '/onboarding/signup',
];
const LIGHT_FUNNEL_ROUTES = ['/onboarding/reveal'];

function OnboardingFunnelContent({ children }: { children: ReactNode }) {
  const isDesktop = useFunnelDesktop();

  if (isDesktop) {
    return null;
  }

  return <>{children}</>;
}

/**
 * /onboarding/* — mobile: full 375×812 layers.
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
      scaleMode={surface === 'light' ? 'contain' : 'cover'}
      className={`font-simpler text-v03-text-on-dark ${className}`}
    >
      <div className="relative h-full w-full">
        {showGrid && <OnboardingGrid />}
        <OnboardingFunnelContent>{children}</OnboardingFunnelContent>
      </div>
    </FunnelViewport>
  );
}
