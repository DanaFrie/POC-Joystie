'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChildContinueGlowIcon, useGlowImmediateTap } from '@/components/onboarding/child/ChildContinueGlowButton';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import {
  CHILD_CONTINUE_GLOW,
  CHILD_CONTINUE_GLOW_HIT_PAD,
} from '@/constants/child-continue-glow';
import { CHILD_DORI_CONTINUE_FOOTER, CHILD_DORI_CONTINUE_TOP_PX } from '@/constants/child-onboarding-layout';

const CONTINUE_LABEL = 'לוחצים כאן כדי להמשיך';
const LABEL_GAP = CHILD_CONTINUE_GLOW.labelGap;
const HIT_PAD = CHILD_CONTINUE_GLOW_HIT_PAD;

/** Delay before glow flickers + tap is enabled — time to read the speech bubble. */
export const CHILD_DORI_CONTINUE_ENABLE_MS = 2500;

/** Frame 1597882461 — continue column; top fixed @ 678 on every screen (screens 6 & 8+). */
export function ChildDoriContinueFooter({
  onClick,
  frame = CHILD_DORI_CONTINUE_FOOTER,
  enableAfterMs = CHILD_DORI_CONTINUE_ENABLE_MS,
}: {
  onClick?: () => void;
  frame?: Pick<typeof CHILD_DORI_CONTINUE_FOOTER, 'width' | 'gap'>;
  /** Hold disabled (no flicker) so the bubble can be read first. */
  enableAfterMs?: number;
}) {
  const scaleY = useFunnelProportionalTopPx;
  const topPx = scaleY(CHILD_DORI_CONTINUE_TOP_PX);
  const [enabled, setEnabled] = useState(enableAfterMs <= 0);

  useEffect(() => {
    if (enableAfterMs <= 0) {
      setEnabled(true);
      return;
    }
    setEnabled(false);
    const id = window.setTimeout(() => setEnabled(true), enableAfterMs);
    return () => window.clearTimeout(id);
  }, [enableAfterMs]);

  const guardedOnClick = useCallback(() => {
    if (!enabled) return;
    onClick?.();
  }, [enabled, onClick]);

  const { onPointerDown, onClick: onTapClick } = useGlowImmediateTap(
    enabled ? guardedOnClick : undefined
  );

  return (
    <button
      type="button"
      disabled={!enabled}
      onPointerDown={enabled ? onPointerDown : undefined}
      onClick={enabled ? onTapClick : undefined}
      className={`absolute z-[40] flex touch-manipulation select-none flex-col items-center border-0 bg-transparent p-0 v03-funnel-enter-2 [-webkit-tap-highlight-color:transparent] ${
        enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-55'
      }`}
      style={{
        left: `calc(50% - ${(frame.width + HIT_PAD * 2) / 2}px)`,
        top: topPx - HIT_PAD,
        width: frame.width + HIT_PAD * 2,
        paddingTop: HIT_PAD,
        paddingLeft: HIT_PAD,
        paddingRight: HIT_PAD,
        gap: frame.gap ?? LABEL_GAP,
      }}
      aria-label={CONTINUE_LABEL}
      aria-disabled={!enabled}
    >
      <ChildContinueGlowIcon
        className={enabled ? '' : '[&_.child-continue-glow-flicker]:!animate-none'}
      />
      <span className="relative z-[1] w-full text-center font-simpler text-[24px] font-normal leading-[1.25] tracking-[-0.36px] text-[#CADCD6]">
        {CONTINUE_LABEL}
      </span>
    </button>
  );
}
