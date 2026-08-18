'use client';

import type { ReactNode } from 'react';
import { CHILD_CASTLE_CHANGE_CARD_STACK } from '@/constants/child-post-game-layout';

const stack = CHILD_CASTLE_CHANGE_CARD_STACK;

type ChildCastleChangeCardStackProps = {
  children: ReactNode;
};

/** Stacked proposal cards — Figma 13702:10060 / 13702:9497. */
export function ChildCastleChangeCardStack({ children }: ChildCastleChangeCardStackProps) {
  const back1 = stack.backLayers[0];
  const back2 = stack.backLayers[1];
  const front = stack.front;

  return (
    <div
      className="relative shrink-0"
      style={{ width: stack.width, height: stack.height }}
    >
      <div
        className="absolute flex flex-col items-end"
        style={{
          width: back1.wrapperWidth,
          left: back1.left,
          top: back1.top,
          gap: back1.gap,
        }}
      >
        <div
          className="flex flex-col items-center justify-center overflow-hidden bg-v03-green-900"
          style={{
            width: back1.cardWidth,
            padding: `${back1.paddingY}px ${back1.paddingX}px`,
            borderRadius: back1.borderRadius,
            outline: `${back1.outlineWidth}px solid rgba(255, 255, 255, 0.25)`,
            outlineOffset: -back1.outlineWidth,
            boxShadow: back1.boxShadow,
            gap: back1.contentGap,
          }}
        >
          <p
            className="w-full text-center font-simpler font-normal text-white"
            style={{
              fontSize: back1.label.fontSize,
              lineHeight: `${back1.label.lineHeight}px`,
            }}
          >
            {back1.label.text}
          </p>
          <div
            className="flex w-full flex-col items-end justify-center"
            style={{
              paddingLeft: back1.textPaddingX,
              paddingRight: back1.textPaddingX,
              gap: back1.textGap,
            }}
          >
            <p
              className="w-full text-center font-simpler font-black text-white"
              style={{
                fontSize: back1.title.fontSize,
                lineHeight: `${back1.title.lineHeight}px`,
              }}
            >
              {back1.title.text}
            </p>
          </div>
        </div>
      </div>

      <div
        className="absolute flex flex-col items-end"
        style={{
          width: back2.wrapperWidth,
          left: back2.left,
          top: back2.top,
          gap: back2.gap,
        }}
      >
        <div
          className="flex flex-col items-center justify-center overflow-hidden bg-v03-green-900"
          style={{
            width: back2.cardWidth,
            padding: `${back2.paddingY}px ${back2.paddingX}px`,
            borderRadius: back2.borderRadius,
            outline: `${back2.outlineWidth}px solid rgba(255, 255, 255, 0.25)`,
            outlineOffset: -back2.outlineWidth,
            boxShadow: back2.boxShadow,
            gap: back2.contentGap,
          }}
        >
          <p
            className="w-full text-center font-simpler font-normal text-white"
            style={{
              fontSize: back2.label.fontSize,
              lineHeight: `${back2.label.lineHeight}px`,
            }}
          >
            {back2.label.text}
          </p>
          <div
            className="flex w-full flex-col items-end justify-center"
            style={{
              paddingLeft: back2.textPaddingX,
              paddingRight: back2.textPaddingX,
              gap: back2.textGap,
            }}
          >
            <p
              className="w-full text-center font-simpler font-black text-white"
              style={{
                fontSize: back2.title.fontSize,
                lineHeight: `${back2.title.lineHeight}px`,
              }}
            >
              {back2.title.text}
            </p>
          </div>
        </div>
      </div>

      <div
        className="absolute flex flex-col items-center justify-center overflow-hidden bg-v03-green-900"
        style={{
          width: front.width,
          height: front.height,
          left: front.left,
          top: front.top,
          padding: `${front.paddingY}px ${front.paddingX}px`,
          borderRadius: front.borderRadius,
          outline: `${front.outlineWidth}px solid rgba(255, 255, 255, 0.25)`,
          outlineOffset: -front.outlineWidth,
          boxShadow: front.boxShadow,
          gap: front.gap,
        }}
      >
        <div
          className="pointer-events-none absolute rounded-full"
          aria-hidden
          style={{
            width: front.glow.width,
            height: front.glow.height,
            left: front.glow.left,
            top: front.glow.top,
            background: front.glow.color,
            filter: `blur(${front.glow.blur}px)`,
          }}
        />
        <div className="relative z-[1] flex w-full flex-col items-center" style={{ gap: front.gap }}>
          {children}
        </div>
      </div>
    </div>
  );
}
