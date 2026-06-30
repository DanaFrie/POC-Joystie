'use client';

import { useEffect, useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { SIGNUP_JOURNEY_STEP3_IMAGE } from '@/constants/onboarding-figma';
import {
  ONBOARDING_STACKED_FOOTER_CONTENT_W_PX,
  ONBOARDING_STACKED_FOOTER_GUTTER_PX,
} from '@/constants/onboarding-footer';
import { CHILD_CONTRACT_CELEBRATION } from '@/constants/child-post-game-layout';
import {
  CHILD_CONTRACT_CONTINUE_LABEL,
  CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_SUBTITLE,
  CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_TITLE,
} from '@/lib/onboarding/childPostGameCopy';

type ChildContractCelebrationStepProps = {
  onContinue?: () => void;
};

/** Light contract win — agreements hero + one-shot confetti, then CTA. */
export function ChildContractCelebrationStep({ onContinue }: ChildContractCelebrationStepProps) {
  const layout = CHILD_CONTRACT_CELEBRATION;
  const [confettiVisible, setConfettiVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setConfettiVisible(false), layout.confettiMs);
    return () => window.clearTimeout(timer);
  }, [layout.confettiMs]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 z-[20] flex items-center justify-center"
        style={{
          opacity: confettiVisible ? 1 : 0,
          transition: 'opacity 400ms ease-out',
        }}
        aria-hidden={!confettiVisible}
      >
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.confettiRed}
          alt=""
          className="size-full object-cover object-center"
          style={{
            width: layout.confettiWidth,
            height: layout.confettiHeight,
          }}
          priority
        />
      </div>

      <section
        className="absolute inset-x-0 z-10 flex flex-col items-center px-v03-gutter"
        style={{ top: layout.contentTop, gap: layout.outerGap }}
        aria-label="חגיגת חוזה"
      >
        <div
          className="flex w-full max-w-v03-content flex-col items-center"
          style={{ gap: layout.heroGap }}
        >
          <OnboardingLazyImage
            src={SIGNUP_JOURNEY_STEP3_IMAGE}
            alt=""
            className="shrink-0 object-cover"
            style={{ width: layout.heroSize, height: layout.heroSize }}
            priority
          />

          <div
            className="flex w-full flex-col items-center self-stretch"
            style={{ gap: layout.textBlockGap }}
          >
            <div
              className="flex w-full flex-col items-center self-stretch"
              style={{ gap: layout.headlineGap }}
            >
              <h1
                className="w-full text-center font-simpler font-black"
                style={{
                  fontSize: layout.title.fontSize,
                  lineHeight: `${layout.title.lineHeight}px`,
                  color: layout.title.color,
                }}
              >
                {CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_TITLE}
                <br />
                {CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_SUBTITLE}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div
        className="absolute inset-x-0 bottom-0 z-[30] flex flex-col items-center justify-end backdrop-blur-[5px]"
        style={{
          paddingTop: layout.footer.paddingTop,
          gap: layout.footer.gap,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {onContinue ? (
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-[55px] items-center justify-center rounded-[22px] bg-v03-turquoise-300 px-[15px] py-2 font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-v03-button transition hover:brightness-95"
            style={{
              width: ONBOARDING_STACKED_FOOTER_CONTENT_W_PX,
              marginLeft: ONBOARDING_STACKED_FOOTER_GUTTER_PX,
              marginRight: ONBOARDING_STACKED_FOOTER_GUTTER_PX,
            }}
          >
            {CHILD_CONTRACT_CONTINUE_LABEL}
          </button>
        ) : null}
      </div>
    </div>
  );
}
