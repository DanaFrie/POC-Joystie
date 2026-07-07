'use client';



import { useCallback, useEffect, useRef, useState } from 'react';

import { ChildCastleConfetti } from '@/components/onboarding/child/ChildCastleConfetti';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';

import { ChildPostGameFunnelShell } from '@/components/onboarding/child/ChildPostGameFunnelShell';

import {

  FunnelStepForeground,

  FunnelStepSection,

} from '@/components/ui/funnel-layout';

import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';

import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';

import { SIGNUP_JOURNEY_STEP3_IMAGE } from '@/constants/onboarding-figma';

import {

  CHILD_CONTRACT_CELEBRATION,

  CHILD_DEMO_PARENT_SUGGESTED_CHANGE,

  CHILD_PARENT_SUGGESTED_CHANGE,

} from '@/constants/child-post-game-layout';

import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

import {

  CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_SUBTITLE,

  CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_TITLE,

  childParentSuggestedAcceptLabel,

  childParentSuggestedChangeCardLabel,

  childParentSuggestedChangeHeadline,

  childParentSuggestedDeclineLabelForChild,

} from '@/lib/onboarding/childPostGameCopy';



type ChildParentSuggestedChangeStepProps = {

  childGender: 'boy' | 'girl';

  parentGender?: 'female' | 'male' | null;

  changeText?: string;

  onAccept: () => void;

  onDecline: () => void;

};



/** Figma 13674:16154 / 13674:16155 — parent additional change suggestion. */

export function ChildParentSuggestedChangeStep({

  childGender,

  parentGender,

  changeText = CHILD_DEMO_PARENT_SUGGESTED_CHANGE,

  onAccept,

  onDecline,

}: ChildParentSuggestedChangeStepProps) {

  const layout = CHILD_PARENT_SUGGESTED_CHANGE;

  const actions = layout.actions;

  const card = layout.card;

  const celebration = layout.acceptCelebration;

  const confettiDurationMs = CHILD_CONTRACT_CELEBRATION.confettiMs;

  const titleId = 'child-parent-suggested-change-title';

  const [celebrated, setCelebrated] = useState(false);

  const [confettiVisible, setConfettiVisible] = useState(false);

  const onAcceptRef = useRef(onAccept);

  onAcceptRef.current = onAccept;

  const { usableCanvasHeightPx } = useFunnelViewportMetrics();

  const gapScale = usableCanvasHeightPx / V03_SCREEN_HEIGHT;

  const contentGap = Math.max(12, Math.round(layout.contentGap * gapScale));

  const textBlockGap = Math.max(12, Math.round(layout.textBlockGap * gapScale));

  const heroSize = Math.round(layout.heroSize * Math.min(1, gapScale + 0.04));

  const titleSize = Math.max(32, Math.round(layout.title.fontSize * Math.min(1, gapScale + 0.05)));

  const cardHeight = Math.round(card.height * Math.min(1, gapScale + 0.03));



  const dimTransition = `opacity ${celebration.fadeMs}ms ease-out`;

  const dimmedStyle = celebrated

    ? { opacity: actions.dimmedOpacity, transition: dimTransition }

    : { transition: dimTransition };



  const handleAccept = useCallback(() => {

    if (celebrated) return;

    setCelebrated(true);

    window.requestAnimationFrame(() => setConfettiVisible(true));

  }, [celebrated]);



  useEffect(() => {

    if (!celebrated) return;

    const timer = window.setTimeout(() => {

      onAcceptRef.current();

    }, confettiDurationMs);

    return () => window.clearTimeout(timer);

  }, [celebrated, confettiDurationMs]);



  return (

    <ChildPostGameFunnelShell ellipse="none">

      <div

        className="pointer-events-none absolute inset-0 z-[20] flex items-center justify-center"

        style={{

          opacity: confettiVisible ? 1 : 0,

          transition: `opacity ${celebration.fadeMs}ms ease-out`,

        }}

        aria-hidden

      >

        <div

          className="relative"

          style={{

            width: celebration.confettiSize,

            height: celebration.confettiSize,

          }}

        >

          <ChildCastleConfetti

            src={CHILD_ONBOARDING_ASSETS.confettiPurple}

            className="absolute left-0 top-0"

          />

        </div>

      </div>



      <FunnelStepForeground

        fitViewport

        distribution="between"

        padTopPx={layout.contentTop}

        padBottomPx={34}

        aria-labelledby={titleId}

      >

        <FunnelStepSection className="flex min-h-0 flex-1 flex-col items-center">

          <div

            className="flex w-full max-w-v03-content flex-col items-center"

            style={{ gap: contentGap }}

          >

            <div style={dimmedStyle}>

              <OnboardingLazyImage

                src={SIGNUP_JOURNEY_STEP3_IMAGE}

                alt=""

                className="shrink-0 object-cover"

                style={{ width: heroSize, height: heroSize }}

                priority

              />

            </div>



            <div
              className="flex w-full flex-col items-center self-stretch"
              style={{ gap: textBlockGap }}
            >

              <div

                className="flex w-full flex-col items-end justify-center self-stretch px-[15px]"

                style={{ gap: layout.titleGap }}

              >

                <h1

                  id={titleId}

                  className="w-full text-center font-simpler font-black text-white"

                  style={{

                    fontSize: titleSize,

                    lineHeight: `${Math.round(titleSize * 1.1)}px`,

                  }}

                >

                  {celebrated ? (

                    <>

                      {CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_TITLE}

                      <br />

                      {CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_SUBTITLE}

                    </>

                  ) : (

                    childParentSuggestedChangeHeadline(parentGender)

                  )}

                </h1>

              </div>



              <div style={dimmedStyle} className="flex w-full justify-center">
                <div
                  className="relative flex shrink-0 flex-col items-center justify-center overflow-hidden bg-v03-green-900 shadow-[2px_2px_15px_rgba(0,0,0,0.08)]"
                  style={{
                    width: card.width,
                    minHeight: cardHeight,
                    padding: `${card.paddingY}px ${card.paddingX}px`,
                    borderRadius: card.borderRadius,
                    outline: '1px solid rgba(255, 255, 255, 0.25)',
                    outlineOffset: -1,
                    gap: card.gap,
                  }}
                >

                  <div

                    className="pointer-events-none absolute rounded-full"

                    aria-hidden

                    style={{

                      width: card.glow.width,

                      height: card.glow.height,

                      left: card.glow.left,

                      top: card.glow.top,

                      background: card.glow.color,

                      filter: `blur(${card.glow.blur}px)`,

                    }}

                  />

                  <div

                    className="relative z-[1] flex w-full flex-col items-center"

                    style={{ gap: card.gap }}

                  >

                    <p

                      className="text-center font-simpler font-normal text-white"

                      style={{

                        fontSize: card.label.fontSize,

                        lineHeight: `${card.label.lineHeight}px`,

                      }}

                    >

                      {childParentSuggestedChangeCardLabel(parentGender)}

                    </p>

                    <div className="flex w-full flex-col items-center justify-center">
                      <p
                        className="w-full text-center font-simpler font-black text-white"
                        style={{
                          minHeight: card.text.height,
                          fontSize: card.text.fontSize,
                          lineHeight: `${card.text.lineHeight}px`,
                        }}
                      >
                        {changeText}
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </FunnelStepSection>



        <FunnelStepSection>

          <div

            className="flex w-full max-w-v03-content flex-col items-center"

            style={{

              gap: actions.frameGap,

              ...dimmedStyle,

              pointerEvents: celebrated ? 'none' : undefined,

            }}

          >

            <div

              className="flex w-full flex-col items-start"

              style={{ gap: actions.buttonGap }}

            >

              <button

                type="button"

                onClick={handleAccept}

                disabled={celebrated}

                className={actions.primaryClass}

              >

                {childParentSuggestedAcceptLabel(childGender)}

              </button>

              <button

                type="button"

                disabled={celebrated}

                onClick={onDecline}

                className={actions.secondaryClass}

              >

                {childParentSuggestedDeclineLabelForChild(childGender, parentGender)}

              </button>

            </div>

          </div>

        </FunnelStepSection>

      </FunnelStepForeground>

    </ChildPostGameFunnelShell>

  );

}

