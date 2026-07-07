'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { BallGameBlurFrame } from '@/components/onboarding/game/BallGameBlurFrame';
import {
  BALL_GAME_SLIDER_CTA_CLASS,
  BallGameSliderCard,
} from '@/components/onboarding/game/BallGameSliderCard';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import { BALL_GAME_RETRY_LABEL } from '@/lib/onboarding/childBondingLabels';

type BallGameFailureOverlayProps = {
  onRetry: () => void;
  busy?: boolean;
};

/** Figma 13598:6534 — failure slider (Dori 291×291, full headline copy). */
export function BallGameFailureOverlay({ onRetry, busy }: BallGameFailureOverlayProps) {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const gapScale = usableCanvasHeightPx / V03_SCREEN_HEIGHT;
  const heroSize = Math.round(291 * Math.min(1, gapScale + 0.02));
  const headlineSize = Math.max(24, Math.round(30 * Math.min(1, gapScale + 0.04)));
  const isCompact = usableCanvasHeightPx < 560;

  return (
    <BallGameBlurFrame zIndex={45} aria-labelledby="ball-game-failure-title">
      <BallGameSliderCard
        compact={isCompact}
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
        <div
          className="aspect-square shrink-0"
          style={{ width: heroSize, height: heroSize }}
        >
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
            <p
              className="w-full shrink-0 text-center font-assistant font-black tracking-[-0.6px] text-white"
              style={{ fontSize: headlineSize, lineHeight: `${headlineSize + 3}px` }}
            >
              לא נורא,
            </p>
            <p
              className="w-full shrink-0 text-center font-assistant font-black tracking-[-0.6px] text-white"
              style={{ fontSize: headlineSize, lineHeight: `${headlineSize + 3}px` }}
            >
              נסו שוב להשלים
            </p>
            <p
              className="w-full shrink-0 text-center font-assistant font-black tracking-[-0.6px] text-white"
              style={{ fontSize: headlineSize, lineHeight: `${headlineSize + 3}px` }}
            >
              10 מסירות רצופות :)
            </p>
          </div>
        </div>
      </BallGameSliderCard>
    </BallGameBlurFrame>
  );
}
