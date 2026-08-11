'use client';

import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
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
  const scaleY = useFunnelProportionalTopPx;
  const parentLabel = parentGender === 'female' ? 'אמא' : 'אבא';

  const fireballTopPx = scaleY(frame.top);
  const contentTopPx = scaleY(layout.content.top);
  const imageWidthPx = scaleY(image.width);
  const imageHeightPx = scaleY(image.height);
  const contentGapPx = scaleY(layout.content.gap);
  const textBlockGapPx = scaleY(19);

  return (
    <FunnelStepRoot fitViewport aria-label="משימה 1" className="overflow-visible bg-transparent">
      <div
        className="pointer-events-none absolute z-[2] inline-flex flex-col items-center"
        style={{
          left: frame.left,
          top: fireballTopPx,
          padding: `0 0 ${scaleY(frame.paddingBottom)}px ${frame.paddingLeft}px`,
          transform: `rotate(${frame.rotationDeg}deg)`,
          transformOrigin: 'center center',
        }}
        aria-hidden
      >
        <div
          style={{
            width: imageWidthPx,
            height: imageHeightPx,
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
          left: `calc(50% - ${layout.content.width / 2}px)`,
          top: contentTopPx,
          width: layout.content.width,
          gap: contentGapPx,
        }}
      >
        <div className="flex w-full flex-col items-center" style={{ gap: textBlockGapPx }}>
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
          className="inline-flex h-[55px] w-full items-center justify-center rounded-[22px] bg-v03-turquoise-300 px-[15px] py-2 font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-right text-v03-green-900 shadow-v03-button transition hover:brightness-95"
        >
          {parentGender === 'female'
            ? `קדימה, אני ו${parentLabel} מוכנות!`
            : `קדימה, אני ו${parentLabel} מוכנים!`}
        </button>
      </div>
    </FunnelStepRoot>
  );
}
