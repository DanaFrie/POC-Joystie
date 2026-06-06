'use client';

import { useState } from 'react';
import { SignupCompanionCarousel } from '@/components/onboarding/signup/SignupCompanionCarousel';
import { SignupJourneyCopy } from '@/components/onboarding/signup/SignupJourneyCopy';
import { SignupJourneyStep2Visual } from '@/components/onboarding/signup/SignupJourneyStep2Visual';
import { SignupJourneyStep3Visual } from '@/components/onboarding/signup/SignupJourneyStep3Visual';
import { SignupStageDots } from '@/components/onboarding/signup/SignupStageDots';
import {
  SIGNUP_INTRO_COPY_TOP_PX,
  SIGNUP_INTRO_COPY_WIDTH_PX,
  SIGNUP_INTRO_DOTS_TOP_PX,
  SIGNUP_JOURNEY_COPY_VISUAL_GAP_PX,
} from '@/constants/signup-layout';
import {
  SIGNUP_JOURNEY_STEPS,
  type SignupJourneyStageIndex,
} from '@/constants/signup-journey';
import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';

type SignupIntroStepProps = {
  stage: SignupJourneyStageIndex;
  onStageChange: (stage: SignupJourneyStageIndex) => void;
};

/** Signup «איך זה עובד» — שלב 1–3 (Figma 42217 / 42218 / 42219). */
export function SignupIntroStep({ stage, onStageChange }: SignupIntroStepProps) {
  const [activeCompanion, setActiveCompanion] = useState(0);
  const copy = SIGNUP_JOURNEY_STEPS[stage];

  return (
    <div
      className="relative mx-auto w-full"
      style={{
        maxWidth: V03_SCREEN_WIDTH,
        height: V03_SCREEN_HEIGHT,
      }}
    >
      <div
        className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
        style={{
          top: SIGNUP_INTRO_COPY_TOP_PX,
          width: SIGNUP_INTRO_COPY_WIDTH_PX,
          gap: SIGNUP_JOURNEY_COPY_VISUAL_GAP_PX,
        }}
      >
        <div
          key={stage}
          className="flex w-full flex-col items-center"
          style={{ gap: SIGNUP_JOURNEY_COPY_VISUAL_GAP_PX }}
        >
          <SignupJourneyCopy
            eyebrow={copy.eyebrow}
            title={copy.title}
            subtitle={copy.subtitle}
          />

          <div className="v03-funnel-enter-2 w-full">
            {stage === 0 && (
              <SignupCompanionCarousel
                activeIndex={activeCompanion}
                onSelect={setActiveCompanion}
              />
            )}
            {stage === 1 && <SignupJourneyStep2Visual />}
            {stage === 2 && <SignupJourneyStep3Visual />}
          </div>
        </div>
      </div>

      <div
        className="absolute inset-x-0 flex justify-center"
        style={{ top: SIGNUP_INTRO_DOTS_TOP_PX }}
      >
        <div className="v03-funnel-enter-3">
          <SignupStageDots
            activeStage={stage}
            onSelect={(index) =>
              onStageChange(index as SignupJourneyStageIndex)
            }
          />
        </div>
      </div>
    </div>
  );
}
