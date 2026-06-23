'use client';

import type { ReactNode } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { SignupChildInviteWaitingMarqueeBleed } from '@/components/onboarding/signup/SignupChildInviteWaitingMarqueeBleed';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

type OnboardingWaitingScreenShellProps = {
  children: ReactNode;
  showBackButton?: ReactNode;
  zIndex?: number;
  ariaBusy?: boolean;
};

/** Shared shell for child-invite waiting + OAuth «מתחברים» screens. */
export function OnboardingWaitingScreenShell({
  children,
  showBackButton,
  zIndex = 10,
  ariaBusy,
}: OnboardingWaitingScreenShellProps) {
  return (
    <div
      className="absolute inset-x-0 top-0 overflow-visible"
      style={{ height: V03_SCREEN_HEIGHT, zIndex }}
      aria-busy={ariaBusy}
      aria-live="polite"
    >
      <OnboardingMintGlow />
      {showBackButton}
      <div className="v03-funnel-screen absolute inset-0 overflow-visible">{children}</div>
      <SignupChildInviteWaitingMarqueeBleed />
    </div>
  );
}
