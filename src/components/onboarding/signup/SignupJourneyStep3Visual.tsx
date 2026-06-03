'use client';

import { useState } from 'react';
import { SIGNUP_JOURNEY_STEP3_IMAGE } from '@/constants/onboarding-figma';
import {
  SIGNUP_JOURNEY_STEP3_BACKDROP_SIZE_PX,
  SIGNUP_JOURNEY_STEP3_FRAME_H_PX,
  SIGNUP_JOURNEY_STEP3_FRAME_W_PX,
  SIGNUP_JOURNEY_STEP3_IMAGE_H_PX,
  SIGNUP_JOURNEY_STEP3_IMAGE_W_PX,
} from '@/constants/signup-layout';

/** Figma 12703:42219 — smaller frosted circle behind scroll (art extends past it). */
export function SignupJourneyStep3Visual() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className="relative mx-auto flex shrink-0 items-center justify-center overflow-visible"
      style={{
        width: SIGNUP_JOURNEY_STEP3_FRAME_W_PX,
        minHeight: SIGNUP_JOURNEY_STEP3_FRAME_H_PX,
      }}
    >
      <div
        aria-hidden
        className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20"
        style={{
          width: SIGNUP_JOURNEY_STEP3_BACKDROP_SIZE_PX,
          height: SIGNUP_JOURNEY_STEP3_BACKDROP_SIZE_PX,
        }}
      />
      {!imageFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={SIGNUP_JOURNEY_STEP3_IMAGE}
          alt=""
          className="relative z-[1] max-w-none object-contain"
          style={{
            width: SIGNUP_JOURNEY_STEP3_IMAGE_W_PX,
            height: SIGNUP_JOURNEY_STEP3_IMAGE_H_PX,
          }}
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  );
}
