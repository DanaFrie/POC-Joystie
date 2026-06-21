'use client';

import { SignupChildInviteWaitingWordmark } from '@/components/onboarding/signup/SignupChildInviteWaitingWordmark';
import {
  SIGNUP_CHILD_INVITE_WAITING_MARQUEE_CYCLE_S,
  SIGNUP_CHILD_INVITE_WAITING_MARQUEE_FRAME_COUNT,
  SIGNUP_CHILD_INVITE_WAITING_MARQUEE_RUN_END_OFFSET_PX,
  SIGNUP_CHILD_INVITE_WAITING_MARQUEE_WORDMARK_H_PX,
} from '@/constants/signup-child-invite-layout';

/**
 * Carousel run — four wordmarks enter from the right; cycle ends when the 4th’s
 * right edge clears the viewport left, then a new run starts.
 */
export function SignupChildInviteWaitingMarquee() {
  return (
    <div
      className="signup-waiting-marquee-viewport w-full overflow-hidden"
      style={{ height: SIGNUP_CHILD_INVITE_WAITING_MARQUEE_WORDMARK_H_PX }}
      aria-hidden
    >
      <div
        className="signup-waiting-marquee-runner"
        style={{
          ['--signup-waiting-marquee-duration' as string]: `${SIGNUP_CHILD_INVITE_WAITING_MARQUEE_CYCLE_S}s`,
          ['--signup-waiting-marquee-run-end-offset' as string]: `${SIGNUP_CHILD_INVITE_WAITING_MARQUEE_RUN_END_OFFSET_PX}px`,
        }}
      >
        <div
          dir="ltr"
          className="signup-waiting-marquee-track inline-flex w-max flex-nowrap items-center"
        >
          {Array.from({ length: SIGNUP_CHILD_INVITE_WAITING_MARQUEE_FRAME_COUNT }, (_, i) => (
            <SignupChildInviteWaitingWordmark key={`wordmark-frame-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
