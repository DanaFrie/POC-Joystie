'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_BALL_GAME } from '@/constants/child-onboarding-layout';

export type ChildBallGamePhase = 'waiting' | 'ready';

type ChildBallGameStepProps = {
  phase: ChildBallGamePhase;
  parentName?: string;
  childName?: string;
};

/** Screens 10–11 — Figma 13147:5635 / 5632. Ball-game lobby. */
export function ChildBallGameStep({
  phase,
  parentName = 'אבא',
  childName = 'ירין',
}: ChildBallGameStepProps) {
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
        className="pointer-events-none absolute z-[2] h-0 -translate-x-1/2 border-t border-dashed border-white/20"
        style={{
          left: '50%',
          top: layout.centerLine.top,
          width: layout.centerLine.width,
        }}
        aria-hidden
      />

      <div
        className="absolute z-10 flex flex-col items-center gap-2"
        style={{
          left: layout.parentLabel.left,
          top: layout.parentLabel.top,
          width: layout.parentLabel.width,
        }}
      >
        <p className="w-full text-center font-simpler text-[24px] font-semibold leading-[41px] tracking-[-0.48px] text-[#00E7A2] opacity-60">
          {parentName}
        </p>
        <div className="h-[11px] w-full rounded-[22px] bg-white opacity-60" />
      </div>

      <p
        className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap font-simpler text-[28px] font-black leading-[41px] tracking-[-0.6px] text-[#00E7A2]"
        style={{
          top: layout.childLabel.top,
          textShadow: '0 0 25px rgba(0, 255, 179, 0.5)',
        }}
      >
        {childName}
      </p>

      <div
        className="absolute z-10 rounded-[22px] bg-white"
        style={{
          left: layout.childPaddle.left,
          top: layout.childPaddle.top,
          width: layout.childPaddle.width,
          height: layout.childPaddle.height,
        }}
      />

      <div
        className="absolute left-1/2 z-10 -translate-x-1/2 text-center"
        style={{ top: layout.status.top, width: layout.status.width }}
      >
        {phase === 'waiting' ? (
          <>
            <p
              className="font-simpler text-[22px] font-black leading-[1.25] tracking-[-0.36px] text-white"
              style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}
            >
              מחכים שאבא יאשר שהוא מוכן
            </p>
            <div className="mt-6 flex items-center justify-center gap-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-[10px] animate-pulse rounded-full bg-[#00E7A2]"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="font-simpler text-[36px] font-normal leading-none tracking-[0.42em] text-white">
            מוכנים?
          </p>
        )}
      </div>
    </div>
  );
}
