'use client';

import type { ReactNode } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { SignupChildInviteWaitingMarqueeBleed } from '@/components/onboarding/signup/SignupChildInviteWaitingMarqueeBleed';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';

type OnboardingWaitingScreenShellProps = {
  children: ReactNode;
  showBackButton?: ReactNode;
  zIndex?: number;
  ariaBusy?: boolean;
  /** When true, skip funnel slide-in — headline-only updates on the same shell. */
  staticLayout?: boolean;
  /** Parent supplies `OnboardingMintGridBackdrop` — skip duplicate mint glow. */
  skipMintGlow?: boolean;
};

/** Shared shell for child-invite waiting + OAuth «מתחברים» screens. */
export function OnboardingWaitingScreenShell({
  children,
  showBackButton,
  zIndex = 10,
  ariaBusy,
  staticLayout = false,
  skipMintGlow = false,
}: OnboardingWaitingScreenShellProps) {
  return (
    <FunnelStepRoot
      fitViewport
      className="absolute inset-x-0 top-0 overflow-visible"
      style={{ zIndex }}
    >
      {skipMintGlow ? null : <OnboardingMintGlow />}
      {showBackButton}
      <div
        className={`relative h-full w-full overflow-visible${staticLayout ? '' : ' v03-funnel-screen'}`}
        aria-busy={ariaBusy}
        aria-live="polite"
      >
        {children}
      </div>
      <SignupChildInviteWaitingMarqueeBleed />
    </FunnelStepRoot>
  );
}
