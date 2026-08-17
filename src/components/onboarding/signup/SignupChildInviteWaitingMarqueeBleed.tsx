'use client';

import { SignupChildInviteWaitingMarquee } from '@/components/onboarding/signup/SignupChildInviteWaitingMarquee';
import {
  useFunnelHeroBleedInsets,
  useFunnelProportionalTopPx,
} from '@/components/ui/FunnelViewportContext';
import { SIGNUP_CHILD_INVITE_WAITING_MARQUEE_BOTTOM_PX } from '@/constants/signup-child-invite-layout';

/**
 * Waiting wordmark — in-canvas with horizontal bleed so marquee enters from the
 * true screen edge while scaling with the rest of the funnel.
 */
export function SignupChildInviteWaitingMarqueeBleed() {
  const { bleedX } = useFunnelHeroBleedInsets();
  const marqueeBottomPx = useFunnelProportionalTopPx(
    SIGNUP_CHILD_INVITE_WAITING_MARQUEE_BOTTOM_PX
  );

  return (
    <div
      className="pointer-events-none absolute z-[9] overflow-hidden"
      style={{
        left: -bleedX,
        right: -bleedX,
        bottom: marqueeBottomPx,
      }}
      aria-hidden
    >
      <SignupChildInviteWaitingMarquee />
    </div>
  );
}
