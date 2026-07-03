'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChildCastleConfetti } from '@/components/onboarding/child/ChildCastleConfetti';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildPostGameFunnelShell } from '@/components/onboarding/child/ChildPostGameFunnelShell';
import { SIGNUP_JOURNEY_STEP3_IMAGE } from '@/constants/onboarding-figma';
import {
  CHILD_CONTRACT_CELEBRATION,
  CHILD_DEMO_PARENT_SUGGESTED_CHANGE,
  CHILD_PARENT_SUGGESTED_CHANGE,
} from '@/constants/child-post-game-layout';
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
    <ChildPostGameFunnelShell ellipse="lowerLeft">
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
          <ChildCastleConfetti className="absolute left-0 top-0" />
        </div>
      </div>

      <div
        className="absolute inset-x-0 z-10 flex flex-col items-center px-v03-gutter"
        style={{ top: layout.contentTop }}
        aria-labelledby={titleId}
      >
        <div
          className="flex w-full max-w-v03-content flex-col items-center"
          style={{ gap: layout.contentGap }}
        >
          <div style={dimmedStyle}>
            <OnboardingLazyImage
              src={SIGNUP_JOURNEY_STEP3_IMAGE}
              alt=""
              className="shrink-0 object-cover"
              style={{ width: layout.heroSize, height: layout.heroSize }}
              priority
            />
          </div>

          <div
            className="flex w-full flex-col items-start self-stretch"
            style={{ gap: layout.textBlockGap }}
          >
            <div
              className="flex w-full flex-col items-end justify-center self-stretch px-[15px]"
              style={{ gap: layout.titleGap }}
            >
              <h1
                id={titleId}
                className="w-full text-center font-simpler font-black text-white"
                style={{
                  fontSize: layout.title.fontSize,
                  lineHeight: `${layout.title.lineHeight}px`,
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

            <div style={dimmedStyle}>
              <div
                className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-v03-green-900 shadow-[2px_2px_15px_rgba(0,0,0,0.08)]"
                style={{
                  height: card.height,
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
                  <div className="flex w-full flex-col items-end justify-center px-[15px]">
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

        <div
          className="flex w-full max-w-v03-content flex-col items-center self-center"
          style={{
            marginTop: actions.top,
            paddingTop: actions.framePaddingTop,
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
              className={actions.secondaryClass}
              aria-disabled="true"
            >
              {childParentSuggestedDeclineLabelForChild(childGender, parentGender)}
            </button>
          </div>
        </div>
      </div>
    </ChildPostGameFunnelShell>
  );
}
