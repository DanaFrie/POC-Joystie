'use client';

import type { ReactNode } from 'react';

type BallGameBlurFrameProps = {
  children: ReactNode;
  zIndex?: number;
  'aria-labelledby'?: string;
};

/** Dim scrim for ready / failure cards — no backdrop blur on game screens. */
export function BallGameBlurFrame({
  children,
  zIndex = 40,
  'aria-labelledby': ariaLabelledBy,
}: BallGameBlurFrameProps) {
  return (
    <div
      className="v03-scroll-hidden absolute inset-0 isolate flex items-center justify-center overflow-x-hidden overflow-y-auto bg-[rgba(0,0,0,0.20)] px-v03-gutter"
      style={{
        zIndex,
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </div>
  );
}
