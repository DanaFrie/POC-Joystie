'use client';

import { SignupChildInviteWaitingMarquee } from '@/components/onboarding/signup/SignupChildInviteWaitingMarquee';
import { SIGNUP_CHILD_INVITE_WAITING_MARQUEE_BOTTOM_PX } from '@/constants/signup-child-invite-layout';

/**
 * Waiting wordmark — full-bleed on waiting shell (100dvh frame, not scaled canvas).
 */
export function SignupChildInviteWaitingMarqueeBleed() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[9] overflow-hidden"
      style={{ bottom: SIGNUP_CHILD_INVITE_WAITING_MARQUEE_BOTTOM_PX }}
      aria-hidden
    >
      <SignupChildInviteWaitingMarquee />
    </div>
  );
}
