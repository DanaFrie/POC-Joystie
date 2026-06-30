'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { BallGameBlurFrame } from '@/components/onboarding/game/BallGameBlurFrame';
import {
  BALL_GAME_SLIDER_CTA_CLASS,
  BallGameSliderCard,
} from '@/components/onboarding/game/BallGameSliderCard';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { BALL_GAME_RETRY_LABEL } from '@/lib/onboarding/childBondingLabels';

type BallGameFailureOverlayProps = {
  onRetry: () => void;
  busy?: boolean;
};

/** Figma 13598:6534 — failure slider (Dori 291×291, full headline copy). */
export function BallGameFailureOverlay({ onRetry, busy }: BallGameFailureOverlayProps) {
  return (
    <BallGameBlurFrame blurStrength="slider" zIndex={45} aria-labelledby="ball-game-failure-title">
      <BallGameSliderCard
        footer={
          <button
            type="button"
            disabled={busy}
            onClick={onRetry}
            className={BALL_GAME_SLIDER_CTA_CLASS}
          >
            {BALL_GAME_RETRY_LABEL}
          </button>
        }
      >
        <div className="aspect-square h-[291px] w-[291px] shrink-0">
          <OnboardingLazyImage
            src={CHILD_ONBOARDING_ASSETS.doriDisappointed}
            alt=""
            className="size-full object-contain"
            priority
          />
        </div>

        <div className="flex w-full shrink-0 flex-col items-center gap-[15px] self-stretch">
          <p className="w-full shrink-0 text-center font-assistant text-[16px] font-normal leading-[135%] tracking-[-0.24px] text-white">
            לא הצלחתם הפעם
          </p>
          <div
            id="ball-game-failure-title"
            className="flex w-full shrink-0 flex-col items-center gap-0 self-stretch px-[15px]"
          >
            <p className="w-full shrink-0 text-center font-assistant text-[30px] font-black leading-[33px] tracking-[-0.6px] text-white">
              לא נורא,
            </p>
            <p className="w-full shrink-0 text-center font-assistant text-[30px] font-black leading-[33px] tracking-[-0.6px] text-white">
              נסו שוב להשלים
            </p>
            <p className="w-full shrink-0 text-center font-assistant text-[30px] font-black leading-[33px] tracking-[-0.6px] text-white">
              10 מסירות רצופות :)
            </p>
          </div>
        </div>
      </BallGameSliderCard>
    </BallGameBlurFrame>
  );
}
