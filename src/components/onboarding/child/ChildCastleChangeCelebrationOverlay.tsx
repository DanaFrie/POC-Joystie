'use client';

import { useEffect, useRef, useState } from 'react';
import { ChildCastleChangeCardStack } from '@/components/onboarding/child/ChildCastleChangeCardStack';
import { ChildCastleChangeReactionTiles } from '@/components/onboarding/child/ChildCastleChangeReactionTiles';
import { ChildCastleConfetti } from '@/components/onboarding/child/ChildCastleConfetti';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import {
  CHILD_CASTLE_CHANGE_CARD_STACK,
  CHILD_CASTLE_CHANGE_CELEBRATION,
} from '@/constants/child-post-game-layout';
import {
  CHILD_CASTLE_CHANGE_CELEBRATION_BODY,
  CHILD_CASTLE_CHANGE_CELEBRATION_TITLE,
} from '@/lib/onboarding/childPostGameCopy';
import {
  funnelProportionalTopPx,
  useFunnelFullBleed,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';

type ChildCastleChangeCelebrationOverlayProps = {
  childGender?: 'boy' | 'girl';
  visible: boolean;
  onComplete?: () => void;
};

/** Figma 13702:9497 — one-shot celebration after confirm, then advance. */
export function ChildCastleChangeCelebrationOverlay({
  childGender = 'boy',
  visible,
  onComplete,
}: ChildCastleChangeCelebrationOverlayProps) {
  const layout = CHILD_CASTLE_CHANGE_CELEBRATION;
  const confetti = layout.confetti;
  const bleedStyle = useFunnelFullBleed();
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const scaleY = (figmaY: number) => funnelProportionalTopPx(figmaY, usableCanvasHeightPx);
  const cardStackTopPx = scaleY(layout.cardStackTop);
  const sectionGapPx = scaleY(layout.sectionGap);
  const confettiTopPx = scaleY(confetti.top);
  const confettiSizePx = scaleY(confetti.size);
  const [mounted, setMounted] = useState(visible);
  const [entered, setEntered] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (visible) {
      completedRef.current = false;
      setConfettiVisible(true);
      setMounted(true);
      const raf = window.requestAnimationFrame(() => setEntered(true));
      return () => window.cancelAnimationFrame(raf);
    }
    setEntered(false);
    setConfettiVisible(false);
    const timer = window.setTimeout(() => setMounted(false), layout.overlayEnterMs);
    return () => window.clearTimeout(timer);
  }, [visible, layout.overlayEnterMs]);

  useEffect(() => {
    if (!visible) return;
    const hideTimer = window.setTimeout(() => setConfettiVisible(false), layout.confettiMs);
    return () => window.clearTimeout(hideTimer);
  }, [visible, layout.confettiMs]);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current?.();
    }, layout.autoAdvanceMs);
    return () => window.clearTimeout(timer);
  }, [visible, layout.autoAdvanceMs]);

  if (!mounted) return null;

  const transition = `opacity ${layout.overlayEnterMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  return (
    <div
      dir="rtl"
      className="absolute z-[50] overflow-hidden"
      style={{
        ...bleedStyle,
        opacity: entered ? 1 : 0,
        transition,
      }}
      role="dialog"
      aria-modal="true"
      aria-label={CHILD_CASTLE_CHANGE_CELEBRATION_TITLE}
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'rgba(0, 0, 0, 0.20)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute z-[40] flex items-center justify-center"
        style={{
          top: confettiTopPx,
          left: confetti.left,
          width: confettiSizePx,
          height: confettiSizePx,
          opacity: confettiVisible && entered ? 1 : 0,
          transition: `opacity ${layout.overlayEnterMs}ms ease-out`,
        }}
      >
        {confettiVisible ? (
          <ChildCastleConfetti
            src={CHILD_ONBOARDING_ASSETS.confettiRed}
            className="shrink-0"
            style={{ width: confettiSizePx, height: confettiSizePx }}
          />
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          className="absolute flex flex-col items-center"
          style={{
            top: cardStackTopPx,
            left: layout.left,
            width: CHILD_CASTLE_CHANGE_CARD_STACK.width,
            gap: sectionGapPx,
          }}
        >
          <ChildCastleChangeCardStack>
            <div
              className="flex w-full flex-col items-center"
              style={{ gap: 8, width: 297 }}
            >
              <p
                className="w-full text-center font-simpler font-black text-white"
                style={{
                  fontSize: layout.celebrationTitle.fontSize,
                  lineHeight: `${layout.celebrationTitle.lineHeight}px`,
                }}
              >
                {CHILD_CASTLE_CHANGE_CELEBRATION_TITLE}
              </p>
              <p
                className="text-center font-simpler font-normal text-white"
                style={{
                  width: layout.celebrationBody.width,
                  fontSize: layout.celebrationBody.fontSize,
                  lineHeight: `${layout.celebrationBody.lineHeight}px`,
                }}
              >
                {CHILD_CASTLE_CHANGE_CELEBRATION_BODY}
              </p>
            </div>
          </ChildCastleChangeCardStack>

          <ChildCastleChangeReactionTiles childGender={childGender} dimmed />
        </div>
      </div>
    </div>
  );
}
