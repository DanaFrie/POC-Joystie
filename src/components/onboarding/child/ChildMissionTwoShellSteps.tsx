'use client';

import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { ChildDoriContinueFooter } from '@/components/onboarding/child/ChildDoriContinueFooter';
import { ChildDoriMediaFrame } from '@/components/onboarding/child/ChildDoriMediaFrame';
import { ChildSpeechBubble } from '@/components/onboarding/child/ChildSpeechBubble';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_DORI_CONTINUE_FOOTER } from '@/constants/child-onboarding-layout';
import {
  CHILD_MISSION_TWO_CHANGE,
  CHILD_MISSION_TWO_NOTEBOOK,
} from '@/constants/child-post-game-layout';

type ChildDoriNotebookShellStepProps = {
  childName: string;
  onContinue?: () => void;
};

/** Dark Dori shell — notebook surprise tooltip. */
export function ChildMissionTwoNotebookStep({
  childName,
  onContinue,
}: ChildDoriNotebookShellStepProps) {
  const layout = CHILD_MISSION_TWO_NOTEBOOK;
  const bubble = layout.bubble;

  return (
    <div className="relative h-full w-full overflow-visible bg-transparent">
      <OnboardingMintGlow />

      <ChildSpeechBubble
        top={bubble.top}
        width={bubble.width}
        left={bubble.left}
        tailLeft={bubble.tailLeft}
        tailBorderOverlap={bubble.tailBorderOverlap}
        paddingTop={bubble.paddingTop}
        paddingBottom={bubble.paddingBottom}
      >
        <p className="w-full text-center font-simpler text-[24px] font-normal leading-[1.25] tracking-[-0.36px] text-white">
          {`${childName}, ההצטרפות שלך לאפליקציית גו׳יסטי הולכת להוביל להרבה הפתעות טובות!`}
        </p>
      </ChildSpeechBubble>

      <ChildDoriMediaFrame>
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.doriNotebookClose}
          alt=""
          className="size-full object-contain object-center"
          priority
        />
      </ChildDoriMediaFrame>

      <ChildDoriContinueFooter frame={CHILD_DORI_CONTINUE_FOOTER} onClick={onContinue} />
    </div>
  );
}

type ChildMissionTwoChangeIntroStepProps = {
  onContinue?: () => void;
};

/** Dark Dori shell — first change intro. */
export function ChildMissionTwoChangeIntroStep({ onContinue }: ChildMissionTwoChangeIntroStepProps) {
  const layout = CHILD_MISSION_TWO_CHANGE;
  const bubble = layout.bubble;
  const media = layout.media;

  return (
    <div className="relative h-full w-full overflow-visible bg-transparent">
      <OnboardingMintGlow />

      <ChildSpeechBubble
        top={bubble.top}
        width={bubble.width}
        left={bubble.left}
        tailLeft={bubble.tailLeft}
        tailBorderOverlap={bubble.tailBorderOverlap}
        paddingTop={bubble.paddingTop}
        paddingBottom={bubble.paddingBottom}
      >
        <p className="w-full text-center font-simpler text-[24px] font-normal leading-[1.25] tracking-[-0.36px] text-white">
          כדי להצטרף וליהנות מההפתעות, עלינו להחליט יחד על{' '}
          <span className="font-black leading-[1.15]">השינוי הראשון</span> שנוכל להתחיל ליישם
          יחד!
        </p>
      </ChildSpeechBubble>

      <div
        className="pointer-events-none absolute z-[2] overflow-hidden"
        style={{
          left: media.left,
          top: media.top,
          width: media.width,
          height: media.height,
        }}
      >
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.doriMoneySit}
          alt=""
          className="size-full object-cover object-center"
          priority
        />
      </div>

      <ChildDoriContinueFooter frame={CHILD_DORI_CONTINUE_FOOTER} onClick={onContinue} />
    </div>
  );
}
