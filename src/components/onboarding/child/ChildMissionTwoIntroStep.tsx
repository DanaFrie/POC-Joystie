'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildPostGameGreenBackground } from '@/components/onboarding/child/ChildPostGameGreenBackground';
import { ChildTurquoiseFooter } from '@/components/onboarding/child/ChildTurquoiseFooter';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_MISSION_TWO_INTRO } from '@/constants/child-post-game-layout';
import { parentCourtLabel } from '@/lib/onboarding/childBondingLabels';

/** Mission 2 intro — notebook hero + copy; turquoise CTA קדימה! */
export function ChildMissionTwoIntroStep({
  parentGender = 'male',
  onContinue,
}: {
  parentGender?: 'female' | 'male';
  onContinue?: () => void;
}) {
  const layout = CHILD_MISSION_TWO_INTRO;
  const parentLabel = parentCourtLabel(parentGender);
  const scaleY = useFunnelProportionalTopPx;

  const frameTopPx = scaleY(layout.frame.top);
  const frameGapPx = scaleY(layout.frame.gap);
  const imageWidthPx = scaleY(layout.image.width);
  const imageHeightPx = scaleY(layout.image.height);
  const textBlockGapPx = scaleY(layout.textBlockGap);
  const titleBlockGapPx = scaleY(layout.titleBlockGap);
  const titleGapPx = scaleY(layout.titleGap);
  const headlineGapPx = scaleY(layout.headlineGap);

  return (
    <FunnelStepRoot
      fitViewport
      aria-label="משימה 2"
      className="overflow-hidden bg-transparent"
    >
      <ChildPostGameGreenBackground />

      <div
        className="absolute z-10 flex flex-col items-center"
        style={{
          left: layout.frame.left,
          top: frameTopPx,
          right: layout.frame.left,
          gap: frameGapPx,
        }}
      >
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.doriNotebookClose}
          alt=""
          className="shrink-0 object-cover"
          style={{ width: imageWidthPx, height: imageHeightPx }}
          priority
        />

        <div
          className="flex w-full flex-col items-center"
          style={{ gap: textBlockGapPx }}
        >
          <div
            className="rounded-[16px] bg-v03-green-700"
            style={{
              paddingLeft: layout.badge.paddingX,
              paddingRight: layout.badge.paddingX,
              paddingTop: layout.badge.paddingY,
              paddingBottom: layout.badge.paddingY,
            }}
          >
            <p className="text-center font-simpler text-[18px] font-bold leading-[1.2] text-white">
              משימה מס׳ 2
            </p>
          </div>

          <div
            className="flex w-full flex-col items-center"
            style={{ gap: titleBlockGapPx }}
          >
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: titleGapPx }}
            >
              <div
                className="flex w-full flex-col items-center"
                style={{ gap: headlineGapPx }}
              >
                <h1 className="w-full text-center font-simpler text-[40px] font-black leading-[44px] text-white">
                  מחליטים יחד על שינוי ראשון בחיים!
                </h1>
              </div>
            </div>
          </div>

          <p className="w-full text-center font-simpler text-[20px] font-normal leading-[24px] text-white">
            {`מגיעים להחלטה משותפת על השינוי וחותמים עם ${parentLabel} חוזה`}
          </p>
        </div>
      </div>

      {onContinue ? (
        <ChildTurquoiseFooter onClick={onContinue}>קדימה!</ChildTurquoiseFooter>
      ) : null}
    </FunnelStepRoot>
  );
}
