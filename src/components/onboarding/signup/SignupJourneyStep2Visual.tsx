'use client';

import { useState } from 'react';
import { SIGNUP_JOURNEY_STEP2_IMAGE } from '@/constants/onboarding-figma';
import {
  SIGNUP_JOURNEY_STEP2_FRAME_H_PX,
  SIGNUP_JOURNEY_STEP2_IMAGE_W_PX,
} from '@/constants/signup-layout';

type SignupJourneyStep2VisualProps = {
  /** Viewport scale — shrinks art on short screens so dots stay clear. */
  scale?: number;
};

/** שלב 2 — Figma 12703:42218; main art is `signup/journey/ball-game.webp`. */
export function SignupJourneyStep2Visual({
  scale = 1,
}: SignupJourneyStep2VisualProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const scaledPx = (figmaPx: number) => Math.round(figmaPx * scale);
  const frameW = scaledPx(SIGNUP_JOURNEY_STEP2_IMAGE_W_PX);
  const frameH = scaledPx(SIGNUP_JOURNEY_STEP2_FRAME_H_PX);

  return (
    <div
      className="flex shrink-0 items-center justify-center"
      style={{
        width: frameW,
        height: frameH,
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    >
      {!imageFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={SIGNUP_JOURNEY_STEP2_IMAGE}
          alt=""
          className="size-full object-contain"
          style={{ width: frameW, height: frameH }}
          draggable={false}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className="rounded-[26px] bg-[#09251d]"
          style={{
            width: frameW,
            height: frameH,
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
