'use client';

import { SHARE_HEADLINE_SCRIBBLE_PATH } from '@/constants/share-headline-scribble-path';

/** Share headline turquoise scribble — Figma layout 254.171×13.231, 16px stroke. */
export function ChildSharedPhotoShareUnderline({
  top,
  left,
  width,
  height,
  strokeWidth = 16,
}: {
  top: number;
  left: number;
  width: number;
  height: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 257 27"
      fill="none"
      preserveAspectRatio="none"
      className="pointer-events-none absolute overflow-visible"
      style={{
        top,
        left,
        width,
        height,
      }}
      aria-hidden
    >
      <path
        d={SHARE_HEADLINE_SCRIBBLE_PATH}
        fill="var(--turquoise-200, #00FFB3)"
        stroke="var(--turquoise-200, #00FFB3)"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
