'use client';

import type { MouseEvent, PointerEvent, ReactNode } from 'react';
import { useCallback, useRef } from 'react';
import {
  CHILD_CONTINUE_GLOW,
  CHILD_CONTINUE_GLOW_HIT_PAD,
} from '@/constants/child-continue-glow';

const GLOW = CHILD_CONTINUE_GLOW;
const HIT_PAD = CHILD_CONTINUE_GLOW_HIT_PAD;

const glowDiscStyle = {
  width: GLOW.size,
  height: GLOW.size,
  borderRadius: GLOW.size,
} as const;

/** Fire once per gesture — pointerdown (touch) or click (keyboard/mouse). */
export function useGlowImmediateTap(onActivate?: () => void) {
  const consumedRef = useRef(false);
  const activateRef = useRef(onActivate);
  activateRef.current = onActivate;

  const activate = useCallback(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;
    activateRef.current?.();
    window.setTimeout(() => {
      consumedRef.current = false;
    }, 400);
  }, []);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      activate();
    },
    [activate]
  );

  const onClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      activate();
    },
    [activate]
  );

  return { onPointerDown, onClick };
}

/** 54×54 mint glow + white ring — Figma 13668:6585. Layers share center; halo bleeds freely. */
export function ChildContinueGlowIcon({ className = '' }: { className?: string }) {
  return (
    <span
      className={`relative block shrink-0 overflow-visible ${className}`}
      style={{ width: GLOW.size, height: GLOW.size }}
      aria-hidden
    >
      <span
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <span
          className="child-continue-glow-flicker block bg-[#00FFB3]"
          style={{
            ...glowDiscStyle,
            filter: `blur(${GLOW.layerBlur}px)`,
          }}
        />
      </span>
      <span
        className="child-continue-glow-flicker pointer-events-none absolute inset-0 bg-[#00FFB3]"
        style={{
          borderRadius: GLOW.size,
          filter: `blur(${GLOW.blur}px)`,
        }}
      />
      <span
        className="pointer-events-none absolute inset-0 z-[2] box-border rounded-full border-solid border-white"
        style={{ borderWidth: GLOW.ringStroke }}
      />
    </span>
  );
}

/** @deprecated Glow is no longer clipped — use ChildContinueGlowIcon directly. */
export function ChildContinueGlowClip({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-visible ${className}`}
      style={{ width: GLOW.size, height: GLOW.size }}
    >
      {children}
    </div>
  );
}

/** Positioned glow tap — no label (castle / inline placements). */
export function ChildContinueGlowTapButton({
  onClick,
  left,
  top,
  ariaLabel = 'לוחצים כאן כדי להמשיך',
}: {
  onClick?: () => void;
  left: number;
  top: number;
  ariaLabel?: string;
}) {
  const { onPointerDown, onClick: onTapClick } = useGlowImmediateTap(onClick);

  return (
    <div
      className="absolute z-[40] overflow-visible"
      style={{
        left: left - HIT_PAD,
        top: top - HIT_PAD,
        width: GLOW.hitExtent,
        height: GLOW.hitExtent,
      }}
    >
      <button
        type="button"
        onPointerDown={onPointerDown}
        onClick={onTapClick}
        className="relative flex size-full cursor-pointer touch-manipulation select-none items-center justify-center overflow-visible border-0 bg-transparent p-0 [-webkit-tap-highlight-color:transparent]"
        aria-label={ariaLabel}
      >
        <ChildContinueGlowIcon />
      </button>
    </div>
  );
}
