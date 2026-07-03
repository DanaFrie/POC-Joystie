'use client';

import { useCallback, useState } from 'react';
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

type DoriPhase = 'notebook' | 'changeIntro';

type ChildMissionTwoDoriSequenceStepProps = {
  childName: string;
  onComplete?: () => void;
};

/** Notebook → change intro — shared shell, crossfade copy + hero to avoid step remount jump. */
export function ChildMissionTwoDoriSequenceStep({
  childName,
  onComplete,
}: ChildMissionTwoDoriSequenceStepProps) {
  const [phase, setPhase] = useState<DoriPhase>('notebook');
  const layout = CHILD_MISSION_TWO_NOTEBOOK;
  const changeLayout = CHILD_MISSION_TWO_CHANGE;
  const bubble = layout.bubble;
  const changeMedia = changeLayout.media;
  const isNotebook = phase === 'notebook';

  const handleContinue = useCallback(() => {
    if (isNotebook) {
      setPhase('changeIntro');
      return;
    }
    onComplete?.();
  }, [isNotebook, onComplete]);

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
        <div className="relative w-full">
          <p
            className={`w-full text-center font-simpler text-[24px] font-normal leading-[1.25] tracking-[-0.36px] text-white transition-opacity duration-300 ${
              isNotebook ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'
            }`}
            aria-hidden={!isNotebook}
          >
            {`${childName}, ההצטרפות שלך לאפליקציית גו׳יסטי הולכת להוביל להרבה הפתעות טובות!`}
          </p>
          <p
            className={`w-full text-center font-simpler text-[24px] font-normal leading-[1.25] tracking-[-0.36px] text-white transition-opacity duration-300 ${
              isNotebook ? 'pointer-events-none absolute inset-0 opacity-0' : 'relative opacity-100'
            }`}
            aria-hidden={isNotebook}
          >
            כדי להצטרף וליהנות מההפתעות, עלינו להחליט יחד על{' '}
            <span className="font-black leading-[1.15]">השינוי הראשון</span> שנוכל להתחיל ליישם
            יחד!
          </p>
        </div>
      </ChildSpeechBubble>

      <ChildDoriMediaFrame>
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.doriNotebookClose}
          alt=""
          className="size-full object-contain object-center transition-opacity duration-300"
          style={{ opacity: isNotebook ? 1 : 0 }}
          priority
        />
      </ChildDoriMediaFrame>

      <div
        className="pointer-events-none absolute z-[3] overflow-hidden transition-opacity duration-300"
        style={{
          left: changeMedia.left,
          top: changeMedia.top,
          width: changeMedia.width,
          height: changeMedia.height,
          aspectRatio: '1 / 1',
          opacity: isNotebook ? 0 : 1,
        }}
      >
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.doriMoneySit}
          alt=""
          className="size-full object-cover object-center"
          priority
        />
      </div>

      <ChildDoriContinueFooter frame={CHILD_DORI_CONTINUE_FOOTER} onClick={handleContinue} />
    </div>
  );
}
