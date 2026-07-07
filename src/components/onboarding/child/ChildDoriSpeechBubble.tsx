'use client';

import type { CSSProperties } from 'react';
import { ChildDoriSpeechTail } from '@/components/onboarding/child/ChildDoriSpeechTail';
import { CHILD_COMPANION_PICK_FRAME, CHILD_DORI_SPEECH_TAIL } from '@/constants/child-onboarding-layout';

type ChildDoriSpeechBubbleProps = {
  className?: string;
  /** Scale Figma coords when companion cluster shrinks on short viewports. */
  scale?: number;
  style?: CSSProperties;
};

/** Figma 13367 — Dori intro speech bubble + tail (absolute inside companion column). */
export function ChildDoriSpeechBubble({
  className = '',
  scale = 1,
  style,
}: ChildDoriSpeechBubbleProps) {
  const speech = CHILD_COMPANION_PICK_FRAME.speechBubble;
  const s = scale;

  return (
    <div
      className={`absolute flex items-center justify-center overflow-visible box-border ${className}`}
      style={{
        width: speech.width * s,
        right: speech.right * s,
        top: speech.top * s,
        padding: `${speech.paddingTop * s}px ${speech.paddingRight * s}px ${speech.paddingBottom * s}px ${speech.paddingLeft * s}px`,
        gap: speech.gap * s,
        borderRadius: speech.borderRadius,
        border: speech.border,
        background: speech.background,
        boxShadow: speech.boxShadow,
        backdropFilter: `blur(${speech.backdropBlur}px)`,
        WebkitBackdropFilter: `blur(${speech.backdropBlur}px)`,
        ...style,
      }}
    >
      <p
        className="flex-[1_0_0] text-right font-simpler text-white"
        style={{
          fontSize: speech.fontSize * s,
          letterSpacing: `${speech.letterSpacing * s}px`,
        }}
      >
        <span
          className="font-normal"
          style={{
            lineHeight: `${speech.lineHeightRegular * 100}%`,
          }}
        >
          היי!{' '}
        </span>
        <span
          className="font-bold"
          style={{
            lineHeight: `${speech.lineHeightBold * s}px`,
          }}
        >
          אני דורי הדרקון
        </span>
        <span
          className="font-normal"
          style={{
            lineHeight: `${speech.lineHeightRegular * 100}%`,
          }}
        >
          {' '}
          👋
        </span>
      </p>

      <ChildDoriSpeechTail
        className="pointer-events-none absolute"
        style={{
          left: CHILD_DORI_SPEECH_TAIL.left * s,
          top: `calc(100% - ${CHILD_DORI_SPEECH_TAIL.borderOverlap * s}px)`,
          width: CHILD_DORI_SPEECH_TAIL.width * s,
        }}
      />
    </div>
  );
}
