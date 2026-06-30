'use client';

import type { CSSProperties } from 'react';
import type { ChildCastleTiltCardLayout } from '@/constants/child-post-game-layout';
import { CHILD_CASTLE_SLIDER_CARD_STYLE } from '@/constants/child-post-game-layout';

type ChildCastleTiltCardProps = {
  layout: ChildCastleTiltCardLayout;
  title: string;
  variant?: 'default' | 'slider';
  onSelect?: () => void;
};

/** Castle interior tilt card — Figma 1597882555 (stack or horizontal slider). */
export function ChildCastleTiltCard({
  layout,
  title,
  variant = 'default',
  onSelect,
}: ChildCastleTiltCardProps) {
  const isSlider = variant === 'slider';
  const sliderStyle = CHILD_CASTLE_SLIDER_CARD_STYLE;

  const cardStyle: CSSProperties = {
    width: layout.width,
    height: layout.height,
    paddingTop: isSlider ? sliderStyle.paddingTop : layout.paddingTop,
    paddingBottom: isSlider ? sliderStyle.paddingBottom : layout.paddingBottom,
    paddingLeft: isSlider ? sliderStyle.paddingX : layout.paddingX,
    paddingRight: isSlider ? sliderStyle.paddingX : layout.paddingX,
    left: layout.left,
    top: layout.top,
    transform: `rotate(${layout.rotateDeg}deg)`,
    transformOrigin: 'top left',
    borderRadius: isSlider ? sliderStyle.borderRadius : layout.borderRadius,
    boxShadow: isSlider ? sliderStyle.boxShadow : layout.boxShadow,
    backdropFilter: `blur(${isSlider ? sliderStyle.backdropBlur : layout.backdropBlur}px)`,
    WebkitBackdropFilter: `blur(${isSlider ? sliderStyle.backdropBlur : layout.backdropBlur}px)`,
    ...(isSlider
      ? { border: sliderStyle.border, background: sliderStyle.background }
      : {
          outline: `${layout.outlineWidth}px solid #FFF`,
          outlineOffset: -layout.outlineWidth,
        }),
  };

  const glow = isSlider ? sliderStyle.glow : layout.glow;
  const glowStyle: CSSProperties = {
    width: glow.width,
    height: glow.height,
    left: glow.left,
    background: glow.color,
    filter: `blur(${glow.blur}px)`,
    ...(isSlider && 'bottom' in glow
      ? { bottom: glow.bottom }
      : { top: 'top' in glow ? glow.top : undefined }),
  };

  const inner = (
    <>
      <div
        className="pointer-events-none absolute rounded-full"
        aria-hidden
        style={glowStyle}
      />
      <div
        className="relative z-[1] flex w-full flex-col items-center"
        style={{ gap: isSlider ? sliderStyle.contentGap : layout.contentGap }}
      >
        <div
          className="flex w-full flex-col items-end justify-center"
          style={{
            paddingLeft: isSlider ? sliderStyle.textPaddingX : layout.textPaddingX,
            paddingRight: isSlider ? sliderStyle.textPaddingX : layout.textPaddingX,
            gap: isSlider ? sliderStyle.textGap : layout.textGap,
          }}
        >
          <p
            className="w-full text-center font-simpler font-black text-white"
            style={{
              minHeight: layout.titleStyle.minHeight,
              fontSize: layout.titleStyle.fontSize,
              lineHeight: `${layout.titleStyle.lineHeight}px`,
            }}
          >
            {title}
          </p>
        </div>
      </div>
    </>
  );

  const cardButton = onSelect ? (
    <button
      type="button"
      onClick={onSelect}
      className={`absolute overflow-hidden transition hover:brightness-105 ${
        isSlider ? '' : 'bg-white/[0.05]'
      }`}
      style={cardStyle}
    >
      {inner}
    </button>
  ) : (
    <div
      className={`absolute overflow-hidden ${isSlider ? '' : 'bg-white/[0.05]'}`}
      style={cardStyle}
    >
      {inner}
    </div>
  );

  if (layout.wrapperRotateDeg != null) {
    return (
      <div
        className="relative size-full"
        style={{
          transform: `rotate(${layout.wrapperRotateDeg}deg)`,
          transformOrigin: 'top left',
        }}
      >
        {cardButton}
      </div>
    );
  }

  return cardButton;
}
