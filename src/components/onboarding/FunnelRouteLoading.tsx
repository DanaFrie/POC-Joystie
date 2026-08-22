'use client';

import { OnboardingWaitingScreenShell } from '@/components/onboarding/OnboardingWaitingScreenShell';
import { OnboardingWaitingCenterContent } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';

type FunnelRouteLoadingProps = {
  headline?: string;
  /** Dark signup hero vs mint kingdom grid. */
  surface?: 'mint' | 'dark';
  /**
   * `auto` — funnel fillViewport when measured, else absolute inset-0.
   * `viewport` — force dashboard-style inset-0 (child/parent dashboard loaders).
   */
  cover?: 'funnel' | 'viewport' | 'auto';
};

/**
 * Lightweight funnel / dashboard placeholder — Suspense / auth-gate / dynamic() loading.
 * Keeps first paint non-blank while heavy step chunks load.
 */
export function FunnelRouteLoading({
  headline = '',
  surface = 'mint',
  cover = 'auto',
}: FunnelRouteLoadingProps) {
  return (
    <OnboardingWaitingScreenShell
      skipMintGlow={surface === 'mint'}
      zIndex={20}
      ariaBusy
      staticLayout
      cover={cover}
      fillClassName={surface === 'dark' ? 'bg-[#092125]' : 'bg-v03-green-900'}
    >
      <OnboardingWaitingCenterContent
        headline={headline}
        ariaLabel={headline || 'טוען'}
      />
    </OnboardingWaitingScreenShell>
  );
}
