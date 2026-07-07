'use client';

import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { ChildDoriContinueFooter } from '@/components/onboarding/child/ChildDoriContinueFooter';
import { ChildDoriMediaFrame } from '@/components/onboarding/child/ChildDoriMediaFrame';
import { ChildSpeechBubble } from '@/components/onboarding/child/ChildSpeechBubble';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
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
  const scaleY = useFunnelProportionalTopPx;
  const bubbleTopPx = scaleY(bubble.top);

  return (
    <FunnelStepRoot
      fitViewport
      aria-label="הפתעות טובות"
      className="overflow-visible bg-transparent"
    >
      <OnboardingMintGlow />

      <ChildSpeechBubble
        top={bubbleTopPx}
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
    </FunnelStepRoot>
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
  const scaleY = useFunnelProportionalTopPx;
  const bubbleTopPx = scaleY(bubble.top);
  const mediaTopPx = scaleY(media.top);
  const mediaWidthPx = scaleY(media.width);
  const mediaHeightPx = scaleY(media.height);

  return (
    <FunnelStepRoot
      fitViewport
      aria-label="השינוי הראשון"
      className="overflow-visible bg-transparent"
    >
      <OnboardingMintGlow />

      <ChildSpeechBubble
        top={bubbleTopPx}
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
          left: `calc(50% - ${mediaWidthPx / 2}px)`,
          top: mediaTopPx,
          width: mediaWidthPx,
          height: mediaHeightPx,
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
    </FunnelStepRoot>
  );
}
