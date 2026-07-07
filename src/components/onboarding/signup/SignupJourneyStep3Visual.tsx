'use client';

import { useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { SIGNUP_JOURNEY_STEP3_IMAGE } from '@/constants/onboarding-figma';
import {
  SIGNUP_JOURNEY_STEP3_BACKDROP_SIZE_PX,
  SIGNUP_JOURNEY_STEP3_FRAME_W_PX,
  SIGNUP_JOURNEY_STEP3_IMAGE_H_PX,
  SIGNUP_JOURNEY_STEP3_IMAGE_W_PX,
} from '@/constants/signup-layout';

type SignupJourneyStep3VisualProps = {
  /** Viewport scale — shrinks art on short screens so dots stay clear. */
  scale?: number;
};

/** Figma 12703:42219 — smaller frosted circle behind scroll (art extends past it). */
export function SignupJourneyStep3Visual({
  scale = 1,
}: SignupJourneyStep3VisualProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const scaledPx = (figmaPx: number) => Math.round(figmaPx * scale);
  const frameW = scaledPx(SIGNUP_JOURNEY_STEP3_FRAME_W_PX);
  const imageW = scaledPx(SIGNUP_JOURNEY_STEP3_IMAGE_W_PX);
  const imageH = scaledPx(SIGNUP_JOURNEY_STEP3_IMAGE_H_PX);
  const backdropSize = scaledPx(SIGNUP_JOURNEY_STEP3_BACKDROP_SIZE_PX);

  return (
    <div
      className="relative mx-auto flex h-full max-h-full w-full shrink-0 items-center justify-center overflow-hidden"
      style={{
        width: frameW,
        maxHeight: '100%',
      }}
    >
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20"
        style={{
          width: backdropSize,
          height: backdropSize,
        }}
      />
      {!imageFailed && (
        <OnboardingLazyImage
          src={SIGNUP_JOURNEY_STEP3_IMAGE}
          alt=""
          className="relative max-h-full max-w-full object-contain"
          style={{
            width: imageW,
            height: imageH,
            maxHeight: '100%',
          }}
          onError={() => setImageFailed(true)}
        />
      )}
    </div>
  );
}
