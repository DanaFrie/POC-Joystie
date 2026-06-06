import type { CSSProperties } from 'react';
import { SignupChildInviteWaitingWordmark } from '@/components/onboarding/signup/SignupChildInviteWaitingWordmark';
import {
  SIGNUP_CHILD_INVITE_WAITING_MARQUEE_CYCLE_S,
  SIGNUP_CHILD_INVITE_WAITING_MARQUEE_GAP_PX,
  SIGNUP_CHILD_INVITE_WAITING_MARQUEE_TILES_PER_HALF,
  SIGNUP_CHILD_INVITE_WAITING_MARQUEE_WORDMARK_H_PX,
  SIGNUP_CHILD_INVITE_WAITING_MARQUEE_WORDMARK_W_PX,
} from '@/constants/signup-child-invite-layout';
import { V03_SCREEN_WIDTH } from '@/constants/v03-screen';

/** One duplicated half of the tile strip (for seamless loop). */
function waitingMarqueeHalfTrackPx(tileCount: number) {
  return (
    tileCount * SIGNUP_CHILD_INVITE_WAITING_MARQUEE_WORDMARK_W_PX +
    (tileCount - 1) * SIGNUP_CHILD_INVITE_WAITING_MARQUEE_GAP_PX
  );
}

/**
 * Endless slow linear marquee — 458×134 tiles, 48px gap.
 * Starts with the tile’s right edge on the screen’s right edge; loops seamlessly.
 */
export function SignupChildInviteWaitingMarquee() {
  const tilesPerHalf = SIGNUP_CHILD_INVITE_WAITING_MARQUEE_TILES_PER_HALF;
  const tileCount = tilesPerHalf * 2;
  const halfTrackPx = waitingMarqueeHalfTrackPx(tilesPerHalf);
  /** Tile left edge at viewport right — logo enters from the right */
  const startOffsetPx = V03_SCREEN_WIDTH;

  const trackStyle = {
    gap: SIGNUP_CHILD_INVITE_WAITING_MARQUEE_GAP_PX,
    '--signup-waiting-marquee-start': `${startOffsetPx}px`,
    '--signup-waiting-marquee-shift': `${halfTrackPx}px`,
    '--signup-waiting-marquee-duration': `${SIGNUP_CHILD_INVITE_WAITING_MARQUEE_CYCLE_S}s`,
  } as CSSProperties;

  return (
    <div
      className="w-full overflow-hidden"
      style={{ height: SIGNUP_CHILD_INVITE_WAITING_MARQUEE_WORDMARK_H_PX }}
      aria-hidden
    >
      <div
        dir="ltr"
        className="signup-waiting-marquee-track flex w-max"
        style={trackStyle}
      >
        {Array.from({ length: tileCount }, (_, i) => (
          <SignupChildInviteWaitingWordmark key={i} />
        ))}
      </div>
    </div>
  );
}
