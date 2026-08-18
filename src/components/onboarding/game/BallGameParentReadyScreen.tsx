'use client';

import { useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { BallGameBlurFrame } from '@/components/onboarding/game/BallGameBlurFrame';
import {
  BALL_GAME_SLIDER_CTA_CLASS,
  BallGameSliderCard,
} from '@/components/onboarding/game/BallGameSliderCard';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';

type BallGameParentReadyScreenProps = {
  childName: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
};

/** Figma 13245:19151 / 13530:5655 — dim court + slider card on `/game`. */
export function BallGameParentReadyScreen({
  childName,
  confirmLabel = 'יאללה, אני מוכן!',
  onConfirm,
  busy,
}: BallGameParentReadyScreenProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = () => {
    if (confirming || busy) return;
    setConfirming(true);
    void Promise.resolve(onConfirm()).finally(() => setConfirming(false));
  };

  return (
    <BallGameBlurFrame zIndex={45} aria-labelledby="ball-game-ready-title">
      <BallGameSliderCard
        footer={
          <button
            type="button"
            disabled={confirming || busy}
            onClick={handleConfirm}
            className={BALL_GAME_SLIDER_CTA_CLASS}
          >
            {confirmLabel}
          </button>
        }
      >
        {/* Frame 1597882556 — fireball hero */}
        <div className="flex h-[165px] w-[165px] shrink-0 items-center justify-center px-0 pb-[4.74px] pt-[4.583px]">
          <OnboardingLazyImage
            src={CHILD_ONBOARDING_ASSETS.fireball}
            alt=""
            className="size-full object-contain"
            priority
          />
        </div>

        {/* Frame 1597882502 — copy */}
        <div className="flex w-full flex-col items-center gap-[15px] self-stretch">
          <div className="flex w-full flex-col items-center justify-center gap-1 self-stretch px-[15px]">
            <h2
              id="ball-game-ready-title"
              className="w-full text-center font-assistant text-[30px] font-black leading-[110%] tracking-[-0.6px] text-white"
            >
              מוכן למשחק פונג עם {childName}?
            </h2>
          </div>
        </div>
      </BallGameSliderCard>
    </BallGameBlurFrame>
  );
}
