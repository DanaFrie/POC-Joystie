'use client';

import type { ReactNode } from 'react';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';

type FunnelRouteEnterProps = {
  children: ReactNode;
  /** Remount key when the route identity changes. */
  stepKey?: string;
  clipOverflow?: boolean;
};

/**
 * Route-level screen enter — same keyed `v03-funnel-screen` as funnel steps.
 * Use on auth / legal / one-shot funnel pages that are not inside a step machine.
 */
export function FunnelRouteEnter({
  children,
  stepKey = 'route',
  clipOverflow = false,
}: FunnelRouteEnterProps) {
  return (
    <OnboardingFunnelStepSlot stepKey={stepKey} clipOverflow={clipOverflow}>
      {children}
    </OnboardingFunnelStepSlot>
  );
}
