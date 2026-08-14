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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: isSlider ? 'flex-start' : undefined,
    alignItems: isSlider ? 'stretch' : undefined,
    flexShrink: isSlider ? 0 : undefined,
    boxSizing: 'border-box',
    width: layout.width,
    minHeight: layout.height,
    height: layout.height,
    paddingTop: isSlider ? sliderStyle.paddingTop : layout.paddingTop,
    paddingBottom: isSlider ? sliderStyle.paddingBottom : layout.paddingBottom,
    paddingLeft: isSlider ? sliderStyle.paddingLeft : layout.paddingX,
    paddingRight: isSlider ? sliderStyle.paddingRight : layout.paddingX,
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

  const glow = isSlider
    ? layout.glow.width > 0
      ? layout.glow
      : { ...sliderStyle.glow, width: 0, height: 0, blur: 0 }
    : layout.glow;
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
      {glow.width > 0 ? (
        <div
          className="pointer-events-none absolute rounded-full"
          aria-hidden
          style={glowStyle}
        />
      ) : null}
      <div
        className="relative z-[1] flex w-full flex-col items-stretch"
        style={{ gap: isSlider ? sliderStyle.contentGap : layout.contentGap }}
      >
        <div
          className={`flex w-full flex-col ${
            isSlider ? 'items-stretch justify-start' : 'items-end justify-center'
          }`}
          style={{
            paddingLeft: isSlider ? sliderStyle.textPaddingX : layout.textPaddingX,
            paddingRight: isSlider ? sliderStyle.textPaddingX : layout.textPaddingX,
            gap: isSlider ? sliderStyle.textGap : layout.textGap,
          }}
        >
          <p
            className="w-full text-center font-simpler font-black text-white"
            style={{
              minHeight: isSlider ? undefined : layout.titleStyle.minHeight,
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
      className={`absolute transition hover:brightness-105 ${
        isSlider ? 'overflow-visible' : 'overflow-hidden'
      } ${isSlider ? '' : 'bg-white/[0.05]'}`}
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
