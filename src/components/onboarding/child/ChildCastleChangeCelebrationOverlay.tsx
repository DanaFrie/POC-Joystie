'use client';

import { useEffect, useState } from 'react';
import { ChildCastleChangeCardStack } from '@/components/onboarding/child/ChildCastleChangeCardStack';
import { ChildCastleChangeReactionTiles } from '@/components/onboarding/child/ChildCastleChangeReactionTiles';
import { ChildCastleConfetti } from '@/components/onboarding/child/ChildCastleConfetti';
import {
  CHILD_CASTLE_CHANGE_CARD_STACK,
  CHILD_CASTLE_CHANGE_CELEBRATION,
} from '@/constants/child-post-game-layout';
import {
  CHILD_CASTLE_CHANGE_CELEBRATION_BODY,
  CHILD_CASTLE_CHANGE_CELEBRATION_TITLE,
} from '@/lib/onboarding/childPostGameCopy';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

type ChildCastleChangeCelebrationOverlayProps = {
  childGender?: 'boy' | 'girl';
  visible: boolean;
  onContinue?: () => void;
};

/** Figma 13702:9497 — celebration after confirm + confetti GIF. */
export function ChildCastleChangeCelebrationOverlay({
  childGender = 'boy',
  visible,
  onContinue,
}: ChildCastleChangeCelebrationOverlayProps) {
  const layout = CHILD_CASTLE_CHANGE_CELEBRATION;
  const confetti = layout.confetti;
  const bleedStyle = useFunnelFullBleed();
  const [mounted, setMounted] = useState(visible);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      const raf = window.requestAnimationFrame(() => setEntered(true));
      return () => window.cancelAnimationFrame(raf);
    }
    setEntered(false);
    const timer = window.setTimeout(() => setMounted(false), layout.overlayEnterMs);
    return () => window.clearTimeout(timer);
  }, [visible, layout.overlayEnterMs]);

  useEffect(() => {
    if (!visible || !onContinue) return;
    const timer = window.setTimeout(onContinue, layout.autoAdvanceMs);
    return () => window.clearTimeout(timer);
  }, [visible, onContinue, layout.autoAdvanceMs]);

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
        className="pointer-events-none absolute z-[5] flex items-center justify-center"
        style={{
          top: confetti.top,
          left: confetti.left,
          width: confetti.width,
          height: confetti.height,
          opacity: entered ? 1 : 0,
          transition: `opacity ${layout.overlayEnterMs}ms ease-out`,
        }}
      >
        <ChildCastleConfetti
          className="shrink-0"
          style={{ width: confetti.width, height: confetti.height }}
        />
      </div>

      <div className="absolute inset-0 z-10">
        <div
          className="absolute flex flex-col items-center"
          style={{
            top: layout.cardStackTop,
            left: layout.left,
            width: CHILD_CASTLE_CHANGE_CARD_STACK.width,
            gap: layout.sectionGap,
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
