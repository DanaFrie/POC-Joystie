'use client';

import { useState } from 'react';
import { SIGNUP_JOURNEY_STEP2_IMAGE } from '@/constants/onboarding-figma';
import {
  SIGNUP_JOURNEY_STEP2_FRAME_H_PX,
  SIGNUP_JOURNEY_STEP2_IMAGE_W_PX,
} from '@/constants/signup-layout';

/** שלב 2 — Figma 12703:42218; main art is `signup-journey-ball-game.png`. */
export function SignupJourneyStep2Visual() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className="mx-auto flex w-full shrink-0 items-center justify-center"
      style={{
        width: SIGNUP_JOURNEY_STEP2_IMAGE_W_PX,
        minHeight: SIGNUP_JOURNEY_STEP2_FRAME_H_PX,
      }}
    >
      {!imageFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={SIGNUP_JOURNEY_STEP2_IMAGE}
          alt=""
          width={SIGNUP_JOURNEY_STEP2_IMAGE_W_PX}
          className="h-auto w-full max-w-full object-contain"
          style={{ maxHeight: SIGNUP_JOURNEY_STEP2_FRAME_H_PX }}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className="rounded-[26px] bg-[#09251d]"
          style={{
            width: SIGNUP_JOURNEY_STEP2_IMAGE_W_PX,
            height: SIGNUP_JOURNEY_STEP2_FRAME_H_PX,
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
