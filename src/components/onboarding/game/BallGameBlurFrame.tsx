'use client';

import type { ReactNode } from 'react';

type BallGameBlurFrameProps = {
  children: ReactNode;
  zIndex?: number;
  /** Slider overlays use a heavier court blur than default waiting states. */
  blurStrength?: 'default' | 'slider';
  'aria-labelledby'?: string;
};

/** Figma — full-screen court blur; scrollable on short viewports so card stays visible. */
export function BallGameBlurFrame({
  children,
  zIndex = 40,
  blurStrength = 'default',
  'aria-labelledby': ariaLabelledBy,
}: BallGameBlurFrameProps) {
  const blurClass = blurStrength === 'slider' ? 'backdrop-blur-[30px]' : 'backdrop-blur-[15px]';

  return (
    <div
      className={`v03-scroll-hidden absolute inset-0 isolate flex items-center justify-center overflow-x-hidden overflow-y-auto bg-[rgba(0,0,0,0.20)] px-v03-gutter ${blurClass}`}
      style={{
        zIndex,
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(48px, calc(env(safe-area-inset-bottom) + 32px))',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </div>
  );
}
