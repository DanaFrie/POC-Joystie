'use client';

import { useState } from 'react';
import { SIGNUP_JOURNEY_STEP2_IMAGE } from '@/constants/onboarding-figma';
import {
  SIGNUP_JOURNEY_STEP2_FRAME_H_PX,
  SIGNUP_JOURNEY_STEP2_IMAGE_H_PX,
  SIGNUP_JOURNEY_STEP2_IMAGE_LEFT_PX,
  SIGNUP_JOURNEY_STEP2_IMAGE_TOP_PX,
  SIGNUP_JOURNEY_STEP2_IMAGE_W_PX,
  SIGNUP_JOURNEY_STEP2_OUTER_GAP_PX,
  SIGNUP_JOURNEY_STEP2_OUTER_PX,
  SIGNUP_JOURNEY_STEP2_OUTER_PY,
  SIGNUP_JOURNEY_STEP2_OUTER_RADIUS_PX,
  SIGNUP_JOURNEY_STEP2_PHONE_H_PX,
  SIGNUP_JOURNEY_STEP2_PHONE_RADIUS_PX,
  SIGNUP_JOURNEY_STEP2_PHONE_W_PX,
} from '@/constants/signup-layout';

/** Figma 12703:42218 — frosted frame + phone mock (composite asset). */
export function SignupJourneyStep2Visual() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className="mx-auto inline-flex w-full shrink-0 flex-col items-center justify-center bg-white/20"
      style={{
        maxWidth: SIGNUP_JOURNEY_STEP2_PHONE_W_PX + SIGNUP_JOURNEY_STEP2_OUTER_PX * 2,
        minHeight: SIGNUP_JOURNEY_STEP2_FRAME_H_PX,
        paddingLeft: SIGNUP_JOURNEY_STEP2_OUTER_PX,
        paddingRight: SIGNUP_JOURNEY_STEP2_OUTER_PX,
        paddingTop: SIGNUP_JOURNEY_STEP2_OUTER_PY,
        paddingBottom: SIGNUP_JOURNEY_STEP2_OUTER_PY,
        borderRadius: SIGNUP_JOURNEY_STEP2_OUTER_RADIUS_PX,
        gap: SIGNUP_JOURNEY_STEP2_OUTER_GAP_PX,
      }}
    >
      <div
        className="relative overflow-hidden bg-[#09251d]"
        style={{
          width: SIGNUP_JOURNEY_STEP2_PHONE_W_PX,
          height: SIGNUP_JOURNEY_STEP2_PHONE_H_PX,
          borderRadius: SIGNUP_JOURNEY_STEP2_PHONE_RADIUS_PX,
        }}
      >
        {!imageFailed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={SIGNUP_JOURNEY_STEP2_IMAGE}
            alt=""
            className="pointer-events-none absolute max-w-none object-cover"
            style={{
              width: SIGNUP_JOURNEY_STEP2_IMAGE_W_PX,
              height: SIGNUP_JOURNEY_STEP2_IMAGE_H_PX,
              left: SIGNUP_JOURNEY_STEP2_IMAGE_LEFT_PX,
              top: SIGNUP_JOURNEY_STEP2_IMAGE_TOP_PX,
            }}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
