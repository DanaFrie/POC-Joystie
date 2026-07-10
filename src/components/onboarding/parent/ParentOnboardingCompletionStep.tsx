'use client';

import { useEffect, useRef } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import {
  FunnelStepForeground,
  FunnelStepRoot,
  FunnelStepSection,
} from '@/components/ui/funnel-layout';
import { useFunnelFullBleed, useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import {
  ONBOARDING_COMPLETION,
  ONBOARDING_COMPLETION_CHECK_IMAGE,
  ONBOARDING_COMPLETION_IMAGE,
} from '@/constants/onboarding-completion-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';
import { finalizeParentOnboardingOnCompletionAppear } from '@/lib/onboarding/finalizeParentOnboardingCompletion';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('ParentOnboardingCompletion');

type ParentOnboardingCompletionStepProps = {
  onContinue?: () => void;
};

/** Figma 13057:16567 — parent onboarding completion (Screen 66). */
export function ParentOnboardingCompletionStep({ onContinue }: ParentOnboardingCompletionStepProps) {
  const layout = ONBOARDING_COMPLETION;
  const bleedStyle = useFunnelFullBleed();
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const finalizedRef = useRef(false);

  useEffect(() => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    void finalizeParentOnboardingOnCompletionAppear().catch((error) => {
      logger.warn('finalize on completion appear failed:', error);
      finalizedRef.current = false;
    });
  }, []);

  const gapScale = usableCanvasHeightPx / V03_SCREEN_HEIGHT;
  const contentGap = Math.max(12, Math.round(layout.content.gap * gapScale));
  const headerGap = Math.max(16, Math.round(layout.header.gap * gapScale));
  const checkSize = Math.round(layout.check.size * Math.min(1, gapScale + 0.04));
  const heroW = Math.round(layout.hero.width * Math.min(1, gapScale + 0.04));
  const heroH = Math.round(layout.hero.height * Math.min(1, gapScale + 0.04));
  const glowSize = Math.round(layout.hero.glowSize * Math.min(1, gapScale + 0.04));
  const titleSize = Math.max(20, Math.round(layout.title.fontSize * Math.min(1, gapScale + 0.05)));
  const headlineSize = Math.max(
    24,
    Math.round(layout.headline.fontSize * Math.min(1, gapScale + 0.05))
  );

  return (
    <FunnelStepRoot fitViewport className="overflow-hidden bg-transparent" aria-label="סיום ההרשמה">
      <div
        className="pointer-events-none absolute z-0 v03-funnel-surface-light"
        style={bleedStyle}
        aria-hidden
      />

      <FunnelStepForeground fitViewport distribution="between" padTopPx={0} padBottomPx={34}>
        <FunnelStepSection className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <div
            className="flex w-full max-w-v03-content flex-col items-center"
            style={{ gap: contentGap }}
          >
            <div className="flex w-full flex-col items-center" style={{ gap: headerGap }}>
              <div className="relative shrink-0" style={{ width: checkSize, height: checkSize }}>
                <OnboardingLazyImage
                  src={ONBOARDING_COMPLETION_CHECK_IMAGE}
                  alt=""
                  className="size-full object-contain"
                  priority
                />
              </div>

              <div className="flex w-full flex-col items-center text-center text-v03-turquoise-950">
                <p
                  className="w-full font-simpler font-normal"
                  style={{
                    fontSize: titleSize,
                    lineHeight: `${Math.round(titleSize * 1.25)}px`,
                    letterSpacing: `${layout.title.letterSpacing}px`,
                  }}
                >
                  כל הכבוד!
                </p>
                <h1
                  className="w-full font-simpler font-black"
                  style={{
                    fontSize: headlineSize,
                    lineHeight: layout.headline.lineHeight,
                    letterSpacing: `${layout.headline.letterSpacing}px`,
                  }}
                >
                  רשמית, התחלתם את המסע שלכם עם ג׳ויסטי!
                </h1>
              </div>
            </div>

            <div className="relative shrink-0" style={{ width: heroW, height: heroH }}>
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D9D9D9]/60"
                style={{ width: glowSize, height: glowSize }}
                aria-hidden
              />
              <OnboardingLazyImage
                src={ONBOARDING_COMPLETION_IMAGE}
                alt="משפחה עם דורי הדרקון"
                className="absolute inset-0 size-full object-cover"
                priority
              />
            </div>
          </div>
        </FunnelStepSection>

        {onContinue ? (
          <FunnelStepSection>
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex h-[55px] w-full items-center justify-center rounded-[22px] bg-white px-[15px] py-2 font-simpler text-[18px] font-bold leading-[21.6px] text-v03-turquoise-950 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95"
            >
              המשך
            </button>
          </FunnelStepSection>
        ) : null}
      </FunnelStepForeground>
    </FunnelStepRoot>
  );
}
