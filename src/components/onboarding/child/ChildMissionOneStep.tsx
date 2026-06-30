'use client';

import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_MISSION_ONE } from '@/constants/child-onboarding-layout';

/** Screen 9 — Figma 13147:5631. Mission 1 — fireball handoff. */
export function ChildMissionOneStep({
  onContinue,
  parentGender = 'male',
}: {
  onContinue?: () => void;
  parentGender?: 'female' | 'male';
}) {
  const layout = CHILD_MISSION_ONE;
  const frame = layout.fireballFrame;
  const image = frame.image;
  const parentLabel = parentGender === 'female' ? 'אמא' : 'אבא';

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      <OnboardingMintGlow />

      <div
        className="pointer-events-none absolute z-[2] inline-flex flex-col items-center"
        style={{
          left: frame.left,
          top: frame.top,
          padding: `0 0 ${frame.paddingBottom}px ${frame.paddingLeft}px`,
          transform: `rotate(${frame.rotationDeg}deg)`,
          transformOrigin: 'center center',
        }}
        aria-hidden
      >
        <div
          style={{
            width: image.width,
            height: image.height,
            aspectRatio: `${59} / ${71}`,
            backgroundImage: `url(${CHILD_ONBOARDING_ASSETS.fireball})`,
            backgroundPosition: `${image.backgroundPositionX}px ${image.backgroundPositionY}px`,
            backgroundSize: `${image.backgroundSizeWidthPct}% ${image.backgroundSizeHeightPct}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
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
            משפרים את שיתוף הפעולה שלך ושל {parentLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex h-[55px] w-full items-center justify-center rounded-[22px] bg-v03-turquoise-300 px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] text-v03-green-900 shadow-v03-button transition hover:brightness-95"
        >
          {parentGender === 'female'
            ? `קדימה, אני ו${parentLabel} מוכנות!`
            : `קדימה, אני ו${parentLabel} מוכנים!`}
        </button>
      </div>
    </div>
  );
}
