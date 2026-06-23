'use client';

import { SignupChildInviteWaitingMarquee } from '@/components/onboarding/signup/SignupChildInviteWaitingMarquee';
import { useFunnelHeroBleedInsets } from '@/components/ui/FunnelViewportContext';
import { SIGNUP_CHILD_INVITE_WAITING_MARQUEE_BOTTOM_PX } from '@/constants/signup-child-invite-layout';

/**
 * Waiting wordmark — in-canvas with horizontal bleed so marquee enters from the
 * true screen edge while scaling with the rest of the funnel.
 */
export function SignupChildInviteWaitingMarqueeBleed() {
  const { bleedX, width } = useFunnelHeroBleedInsets();

  return (
    <div
      className="pointer-events-none absolute z-[9] overflow-hidden"
      style={{
        left: -bleedX,
        width,
        bottom: SIGNUP_CHILD_INVITE_WAITING_MARQUEE_BOTTOM_PX,
      }}
      aria-hidden
    >
      <SignupChildInviteWaitingMarquee />
    </div>
  );
}
