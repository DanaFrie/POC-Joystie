'use client';

import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { FunnelRouteLoading } from '@/components/onboarding/FunnelRouteLoading';
import { OnboardingFunnelRoot } from '@/components/onboarding/OnboardingFunnelRoot';
import { FunnelViewport } from '@/components/ui/FunnelViewport';
import {
  getSessionWaiterMode,
  subscribeSessionWaiter,
} from '@/lib/auth/sessionRouteWaiter';

function subscribe(listener: () => void) {
  return subscribeSessionWaiter(listener);
}

/** One funnel waiter for login/onboarding session restore — does not remount on route swap. */
export function SessionRouteWaiter() {
  const pathname = usePathname();
  const mode = useSyncExternalStore(subscribe, getSessionWaiterMode, () => 'unset' as const);
  const onAuthGate = pathname === '/login' || pathname === '/onboarding';
  const show = mode === 'show' || (mode !== 'hide' && onAuthGate);
  if (!show) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[9999]">
      <OnboardingFunnelRoot>
        <FunnelViewport
          scaleMode="scroll"
          ignoreSafeArea
          className="font-simpler text-v03-text-on-dark"
        >
          <FunnelRouteLoading />
        </FunnelViewport>
      </OnboardingFunnelRoot>
    </div>
  );
}
