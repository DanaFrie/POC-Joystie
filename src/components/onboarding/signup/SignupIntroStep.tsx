'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { SignupHowItWorksPill } from '@/components/onboarding/signup/SignupHowItWorksPill';
import { SignupJourneyCopy } from '@/components/onboarding/signup/SignupJourneyCopy';
import { SignupJourneyStep2Visual } from '@/components/onboarding/signup/SignupJourneyStep2Visual';
import { SignupJourneyStep3Visual } from '@/components/onboarding/signup/SignupJourneyStep3Visual';
import { SignupStageDots } from '@/components/onboarding/signup/SignupStageDots';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { SIGNUP_COMPANION_IMAGES } from '@/constants/onboarding-figma';
import {
  SIGNUP_COMPANION_ACTIVE_SIZE_PX,
  SIGNUP_HOW_IT_WORKS_PILL_TOP_PX,
  SIGNUP_INTRO_COPY_WIDTH_PX,
  SIGNUP_INTRO_PILL_TO_CONTENT_GAP_PX,
  SIGNUP_INTRO_VISUAL_TO_DOTS_GAP_PX,
  SIGNUP_JOURNEY_COPY_VISUAL_GAP_PX,
  SIGNUP_JOURNEY_STEP3_BACKDROP_SIZE_PX,
  getSignupIntroFlowVisualScale,
} from '@/constants/signup-layout';
import {
  SIGNUP_JOURNEY_STEPS,
  type SignupJourneyStageIndex,
} from '@/constants/signup-journey';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

type SignupIntroStepProps = {
  stage: SignupJourneyStageIndex;
  onStageChange?: (stage: SignupJourneyStageIndex) => void;
  /** 100vh funnel — dots centered in gap between visual bottom and footer top. */
  flow?: boolean;
};

function SignupIntroStageVisual({
  stage,
  vhScale,
  scaledPx,
}: {
  stage: SignupJourneyStageIndex;
  vhScale: number;
  scaledPx: (figmaPx: number) => number;
}) {
  if (stage === 0) {
    const companionSizePx = scaledPx(SIGNUP_COMPANION_ACTIVE_SIZE_PX);
    const backdropSizePx = scaledPx(SIGNUP_JOURNEY_STEP3_BACKDROP_SIZE_PX);

    return (
      <div
        className="relative flex max-h-full max-w-full items-center justify-center"
        style={{
          width: companionSizePx,
          height: companionSizePx,
        }}
      >
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20"
          style={{
            width: backdropSizePx,
            height: backdropSizePx,
          }}
        />
        <OnboardingLazyImage
          src={SIGNUP_COMPANION_IMAGES[0]}
          alt=""
          className="relative max-h-full max-w-full object-contain"
          style={{
            width: companionSizePx,
            height: companionSizePx,
          }}
          draggable={false}
          priority
        />
      </div>
    );
  }

  if (stage === 1) {
    return <SignupJourneyStep2Visual scale={vhScale} />;
  }

  return <SignupJourneyStep3Visual scale={vhScale} />;
}

/** Signup «איך זה עובד» — שלב 1–3 (Figma 42217 / 42218 / 42219). */
export function SignupIntroStep({
  stage,
  onStageChange,
  flow = false,
}: SignupIntroStepProps) {
  const copy = SIGNUP_JOURNEY_STEPS[stage];
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const vhScale = usableCanvasHeightPx / V03_SCREEN_HEIGHT;
  const visualScale = flow ? getSignupIntroFlowVisualScale(usableCanvasHeightPx, stage) : vhScale;
  const copyScale = flow ? Math.min(vhScale, visualScale + 0.06) : 1;
  const scaledPx = (figmaPx: number) => Math.round(figmaPx * vhScale);
  const topPx = scaledPx(SIGNUP_HOW_IT_WORKS_PILL_TOP_PX);
  const pillToContentGapPx = scaledPx(SIGNUP_INTRO_PILL_TO_CONTENT_GAP_PX);
  const copyVisualGapPx = Math.round(SIGNUP_JOURNEY_COPY_VISUAL_GAP_PX * copyScale);
  const visualToDotsGapPx = scaledPx(SIGNUP_INTRO_VISUAL_TO_DOTS_GAP_PX);

  if (flow) {
    return (
      <div
        className="flex h-full min-h-0 w-full flex-col items-center"
        style={{ width: SIGNUP_INTRO_COPY_WIDTH_PX }}
        aria-label="איך זה עובד"
      >
        <div className="w-full shrink-0" style={{ paddingTop: topPx }}>
          <SignupHowItWorksPill />
        </div>

        <div
          key={stage}
          className="w-full shrink-0"
          style={{ marginTop: pillToContentGapPx }}
        >
          <SignupJourneyCopy
            eyebrow={copy.eyebrow}
            title={copy.title}
            subtitle={copy.subtitle}
            compactScale={copyScale}
          />
        </div>

        <div
          className={`v03-funnel-enter-2 flex min-h-0 w-full flex-1 justify-center ${
            stage === 1 ? 'overflow-visible' : 'overflow-hidden'
          }`}
          style={{ marginTop: copyVisualGapPx }}
        >
          <SignupIntroStageVisual
            stage={stage}
            vhScale={visualScale}
            scaledPx={(figmaPx) => Math.round(figmaPx * visualScale)}
          />
        </div>

        <div
          className="v03-funnel-enter-3 flex w-full shrink-0 justify-center pb-1"
          style={{ marginTop: visualToDotsGapPx }}
        >
          <SignupStageDots
            activeStage={stage}
            onSelect={
              onStageChange
                ? (index) => onStageChange(index as SignupJourneyStageIndex)
                : undefined
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 w-full max-w-v03-content flex-col items-center"
      style={{ width: SIGNUP_INTRO_COPY_WIDTH_PX }}
      aria-label="איך זה עובד"
    >
      <div className="w-full shrink-0" style={{ paddingTop: topPx }}>
        <SignupHowItWorksPill />
      </div>

      <div
        key={stage}
        className="flex min-h-0 w-full flex-1 flex-col items-center"
        style={{ marginTop: pillToContentGapPx }}
      >
        <SignupJourneyCopy
          eyebrow={copy.eyebrow}
          title={copy.title}
          subtitle={copy.subtitle}
        />

        <div
          className={`v03-funnel-enter-2 flex min-h-0 w-full flex-1 items-center justify-center ${
            stage === 1 ? 'overflow-visible' : 'overflow-hidden'
          }`}
          style={{
            marginTop: copyVisualGapPx,
            paddingBottom: visualToDotsGapPx,
          }}
        >
          <SignupIntroStageVisual
            stage={stage}
            vhScale={vhScale}
            scaledPx={scaledPx}
          />
        </div>
      </div>
    </div>
  );
}
