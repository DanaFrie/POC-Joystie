'use client';

import { useCallback, useEffect, useRef } from 'react';
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

const MOUNT_GUARD_MS = 600;

/** Frame 1597882461 — continue column; top fixed @ 678 on every screen (screens 6 & 8+). */
export function ChildDoriContinueFooter({
  onClick,
  frame = CHILD_DORI_CONTINUE_FOOTER,
}: {
  onClick?: () => void;
  frame?: Pick<typeof CHILD_DORI_CONTINUE_FOOTER, 'width' | 'gap'>;
}) {
  const scaleY = useFunnelProportionalTopPx;
  const topPx = scaleY(CHILD_DORI_CONTINUE_TOP_PX);
  const mountedAtRef = useRef(Date.now());

  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  const guardedOnClick = useCallback(() => {
    if (Date.now() - mountedAtRef.current < MOUNT_GUARD_MS) return;
    onClick?.();
  }, [onClick]);

  const { onPointerDown, onClick: onTapClick } = useGlowImmediateTap(guardedOnClick);

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onClick={onTapClick}
      className="absolute z-[40] flex cursor-pointer touch-manipulation select-none flex-col items-center border-0 bg-transparent p-0 v03-funnel-enter-2 [-webkit-tap-highlight-color:transparent]"
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
    >
      <ChildContinueGlowIcon />
      <span className="relative z-[1] w-full text-center font-simpler text-[24px] font-normal leading-[1.25] tracking-[-0.36px] text-[#CADCD6]">
        {CONTINUE_LABEL}
      </span>
    </button>
  );
}
