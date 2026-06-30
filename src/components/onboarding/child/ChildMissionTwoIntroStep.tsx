'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildContinueGlowTapButton } from '@/components/onboarding/child/ChildContinueGlowButton';
import { ChildPostGameGreenBackground } from '@/components/onboarding/child/ChildPostGameGreenBackground';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_MISSION_TWO_INTRO } from '@/constants/child-post-game-layout';

/** Mission 2 intro — notebook hero + copy; glow tap advances to change intro. */
export function ChildMissionTwoIntroStep({
  parentName,
  parentGender = 'male',
  onContinue,
}: {
  parentName: string;
  parentGender?: 'female' | 'male';
  onContinue?: () => void;
}) {
  const layout = CHILD_MISSION_TWO_INTRO;
  const parentLabel = parentGender === 'female' ? 'אמא' : parentName || 'אבא';

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      <ChildPostGameGreenBackground />

      <div
        className="absolute z-10 flex flex-col items-center"
        style={{
          left: layout.frame.left,
          top: layout.frame.top,
          right: layout.frame.left,
          gap: layout.frame.gap,
        }}
      >
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.doriNotebookClose}
          alt=""
          className="shrink-0 object-cover"
          style={{ width: layout.image.width, height: layout.image.height }}
          priority
        />

        <div
          className="flex w-full flex-col items-center"
          style={{ gap: layout.textBlockGap }}
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
            style={{ gap: layout.titleBlockGap }}
          >
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: layout.titleGap }}
            >
              <div
                className="flex w-full flex-col items-center"
                style={{ gap: layout.headlineGap }}
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
        <ChildContinueGlowTapButton
          left={layout.glowButton.left}
          top={layout.glowButton.top}
          onClick={onContinue}
        />
      ) : null}
    </div>
  );
}
