import type { CSSProperties } from 'react';
import type { SelfieFaceHole } from '@/components/onboarding/child/ChildSelfieFaceMask';
import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';

/** Fixed 375×812 artboard — all selfie layers share these coordinates. */
export const CHILD_SELFIE_ARTBOARD = {
  width: V03_SCREEN_WIDTH,
  height: V03_SCREEN_HEIGHT,
} as const;

export function holeBadgeStyle(hole: SelfieFaceHole): CSSProperties {
  return {
    position: 'absolute',
    left: hole.cx,
    top: hole.cy - hole.r - 14,
    transform: 'translateX(-50%)',
  };
}

export function holeFaceClipStyle(hole: SelfieFaceHole): CSSProperties {
  const diameter = hole.r * 2;
  return {
    position: 'absolute',
    left: hole.cx - hole.r,
    top: hole.cy - hole.r,
    width: diameter,
    height: diameter,
    borderRadius: '50%',
    overflow: 'hidden',
  };
}
