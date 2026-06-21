'use client';

import type { ReactNode } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { SignupChildInviteWaitingMarquee } from '@/components/onboarding/signup/SignupChildInviteWaitingMarquee';
import { SIGNUP_CHILD_INVITE_WAITING_MARQUEE_BOTTOM_PX } from '@/constants/signup-child-invite-layout';
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
    <>
      <OnboardingMintGlow />
      {showBackButton}
      <div
        className="v03-funnel-screen absolute inset-x-0 top-0 overflow-hidden"
        style={{ height: V03_SCREEN_HEIGHT, zIndex }}
        aria-busy={ariaBusy}
        aria-live="polite"
      >
        {children}
        <div
          className="pointer-events-none absolute inset-x-0 z-[1] overflow-hidden"
          style={{ bottom: SIGNUP_CHILD_INVITE_WAITING_MARQUEE_BOTTOM_PX }}
        >
          <SignupChildInviteWaitingMarquee />
        </div>
      </div>
    </>
  );
}
