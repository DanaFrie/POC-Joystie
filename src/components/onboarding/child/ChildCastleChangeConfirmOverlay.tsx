'use client';

import { useEffect, useState } from 'react';
import { ChildCastleChangeCardStack } from '@/components/onboarding/child/ChildCastleChangeCardStack';
import { ChildCastleChangeReactionTiles } from '@/components/onboarding/child/ChildCastleChangeReactionTiles';
import {
  CHILD_CASTLE_CHANGE_CARD_STACK,
  CHILD_CASTLE_CHANGE_CONFIRM,
} from '@/constants/child-post-game-layout';
import { CHILD_CASTLE_CHANGE_CARD_LABEL } from '@/lib/onboarding/childPostGameCopy';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

type ChildCastleChangeConfirmOverlayProps = {
  changeTitle: string;
  childGender?: 'boy' | 'girl';
  visible: boolean;
  onConfirm: () => void;
  onDecline: () => void;
};

/** Figma 13702:10060 — confirm after castle card tap. */
export function ChildCastleChangeConfirmOverlay({
  changeTitle,
  childGender = 'boy',
  visible,
  onConfirm,
  onDecline,
}: ChildCastleChangeConfirmOverlayProps) {
  const layout = CHILD_CASTLE_CHANGE_CONFIRM;
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

  if (!mounted) return null;

  const transition = `opacity ${layout.overlayEnterMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  return (
    <div
      dir="rtl"
      className="absolute z-[40] overflow-hidden"
      style={{
        ...bleedStyle,
        opacity: entered ? 1 : 0,
        transition,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="אישור בחירת שינוי"
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
            <p
              className="w-full text-center font-simpler font-normal text-white"
              style={{ fontSize: 16, lineHeight: '21.6px' }}
            >
              {CHILD_CASTLE_CHANGE_CARD_LABEL}
            </p>
            <div className="flex w-full flex-col items-end justify-center px-[15px]">
              <p
                className="w-full text-center font-simpler font-black text-white"
                style={{ fontSize: 24, lineHeight: '27.6px' }}
              >
                {changeTitle}
              </p>
            </div>
          </ChildCastleChangeCardStack>

          <ChildCastleChangeReactionTiles
            childGender={childGender}
            onReady={onConfirm}
            onDecline={onDecline}
          />
        </div>
      </div>
    </div>
  );
}
