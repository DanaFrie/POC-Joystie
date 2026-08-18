import type { CSSProperties } from 'react';

/** Figma ellipses 387 + 388 — Green-900 glow, blur 45px */
export const ELLIPSE_387 = {
  width: 253,
  height: 236,
  blurPx: 45,
  fill: 'var(--v03-green-900, #092125)',
} as const;

export const ELLIPSE_388 = {
  width: 265,
  height: 248,
  blurPx: 45,
  fill: 'var(--v03-green-900, #092125)',
} as const;

type BlurEllipseProps = {
  className?: string;
  width: number;
  height: number;
  blurPx: number;
  fill: string;
  style?: CSSProperties;
};

export function GreenBlurEllipse({
  className = '',
  width,
  height,
  blurPx,
  fill,
  style,
}: BlurEllipseProps) {
  return (
    <div
      className={`pointer-events-none overflow-visible ${className}`}
      style={{ width, height, ...style }}
      aria-hidden
    >
      <div
        className="h-full w-full rounded-full"
        style={{ background: fill, filter: `blur(${blurPx}px)` }}
      />
    </div>
  );
}
