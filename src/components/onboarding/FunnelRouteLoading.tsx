'use client';

import { OnboardingMintGridBackdrop } from '@/components/onboarding/OnboardingMintGridBackdrop';
import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';

type FunnelRouteLoadingProps = {
  headline?: string;
  /** Dark signup hero vs mint kingdom grid. */
  surface?: 'mint' | 'dark';
};

/**
 * Lightweight funnel placeholder — Suspense / auth-gate / dynamic() loading.
 * Keeps first paint non-blank while heavy step chunks load.
 */
export function FunnelRouteLoading({
  headline = '',
  surface = 'mint',
}: FunnelRouteLoadingProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy
      style={surface === 'dark' ? { background: '#092125' } : undefined}
    >
      {surface === 'mint' ? <OnboardingMintGridBackdrop showGrid /> : null}
      <OnboardingWaitingScreenShell
        skipMintGlow={surface === 'mint'}
        zIndex={20}
        ariaBusy
        staticLayout
      >
        <OnboardingWaitingCenterContent
          headline={headline}
          ariaLabel={headline || 'טוען'}
        />
      </OnboardingWaitingScreenShell>
    </div>
  );
}
