'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_MISSION_ONE } from '@/constants/child-onboarding-layout';

/** Screen 9 — Figma 13147:5631. Mission 1 — fireball handoff. */
export function ChildMissionOneStep({ onContinue }: { onContinue?: () => void }) {
  const layout = CHILD_MISSION_ONE;
  const fireball = layout.fireball;

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      <OnboardingMintGlow />

      <div
        className="pointer-events-none absolute z-[2] flex items-center justify-center overflow-hidden"
        style={{
          left: layout.hero.left,
          top: layout.hero.top,
          width: layout.hero.width,
          height: layout.hero.height,
        }}
      >
        <div className="-rotate-60">
          <OnboardingLazyImage
            src={CHILD_ONBOARDING_ASSETS.fireball}
            alt=""
            className="object-contain"
            style={{ width: fireball.width, height: fireball.height }}
            priority
          />
        </div>
      </div>

      <div
        className="absolute z-10 flex flex-col items-center"
        style={{
          left: layout.content.left,
          top: layout.content.top,
          width: layout.content.width,
          gap: layout.content.gap,
        }}
      >
        <div className="flex w-full flex-col items-center gap-[19px]">
          <div className="rounded-[16px] bg-v03-green-700 px-[19px] py-[10px]">
            <p className="text-center font-simpler text-[18px] font-bold leading-[1.2] text-white">
              משימה מס׳ 1
            </p>
          </div>

          <h1 className="w-full text-center font-simpler text-[36px] font-black leading-[1.1] tracking-[-0.8px] text-white">
            מתמסרים עם
            <br />
            כדור האש של דורי!
          </h1>

          <p className="w-full text-center font-simpler text-[20px] font-normal leading-[1.2] tracking-[-0.3px] text-white">
            משפרים את שיתוף הפעולה שלך ושל אבא
          </p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex h-[55px] w-full items-center justify-center rounded-[22px] bg-v03-turquoise-300 px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] text-v03-green-900 shadow-v03-button transition hover:brightness-95"
        >
          קדימה, אני ואבא מוכנים!
        </button>
      </div>
    </div>
  );
}
