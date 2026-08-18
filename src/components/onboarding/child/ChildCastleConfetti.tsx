'use client';

import type { CSSProperties } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';

type ChildCastleConfettiProps = {
  className?: string;
  style?: CSSProperties;
  /** Defaults to purple GIF — king/queen + contract celebration. */
  src?: string;
};

/** Figma 13702:9497 — confetti GIF (490×490). */
export function ChildCastleConfetti({
  className = '',
  style,
  src = CHILD_ONBOARDING_ASSETS.confettiPurple,
}: ChildCastleConfettiProps) {
  return (
    <OnboardingLazyImage
      src={src}
      alt=""
      className={`pointer-events-none object-cover object-center ${className}`}
      style={style}
      priority
    />
  );
}
