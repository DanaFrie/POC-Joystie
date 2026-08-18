'use client';

import type { ReactNode } from 'react';
import { OnboardingFunnelFrame } from '@/components/onboarding/OnboardingFunnelFrame';
import { OnboardingFunnelRoot } from '@/components/onboarding/OnboardingFunnelRoot';

/** `/game` funnel chrome — client-only to avoid dev chunk issues on route transition. */
export function GameFunnelShell({ children }: { children: ReactNode }) {
  return (
    <OnboardingFunnelRoot>
      <OnboardingFunnelFrame>{children}</OnboardingFunnelFrame>
    </OnboardingFunnelRoot>
  );
}
