'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_BALL_GAME } from '@/constants/child-onboarding-layout';
import { GAME_WIN_SCORE } from '@/constants/game';

type ChildBallGameCompleteStepProps = {
  parentName?: string;
  childName?: string;
  onContinue?: () => void;
};

/** Post-win — Figma 13147:5642. */
export function ChildBallGameCompleteStep({
  parentName = 'אבא',
  childName = 'ירין',
  onContinue,
}: ChildBallGameCompleteStepProps) {
  const layout = CHILD_BALL_GAME;

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      <OnboardingMintGlow />

      <div
        className="pointer-events-none absolute z-[1] opacity-70"
        style={{
          left: layout.bg.left,
          top: layout.bg.top,
          width: layout.bg.width,
          height: layout.bg.height,
        }}
      >
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.ballGameBg}
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div
        className="absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center text-center"
        style={{ top: layout.status.top, width: layout.status.width, gap: 24 }}
      >
        <p
          className="font-simpler text-[36px] font-black leading-[1.1] tracking-[-0.8px] text-white"
          style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}
        >
          כל הכבוד {childName}!
        </p>
        <p className="font-simpler text-[20px] font-normal leading-[1.3] text-white/90">
          {GAME_WIN_SCORE} נקודות עם {parentName} — המשיכו במסע!
        </p>
      </div>

      <div
        className="pointer-events-none absolute z-[8] -translate-x-1/2"
        style={{
          left: '50%',
          top: 180,
          width: 130,
          height: 155,
          transform: 'translateX(-50%) rotate(120deg)',
        }}
      >
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.fireball}
          alt=""
          className="size-full object-contain"
          priority
        />
      </div>

      {onContinue ? (
        <button
          type="button"
          onClick={onContinue}
          className="absolute left-1/2 z-20 inline-flex h-[55px] w-[327px] -translate-x-1/2 items-center justify-center rounded-[22px] bg-v03-turquoise-300 px-[15px] font-simpler text-[18px] font-bold text-v03-green-900 shadow-v03-button"
          style={{ top: 668 }}
        >
          המשך
        </button>
      ) : null}
    </div>
  );
}
