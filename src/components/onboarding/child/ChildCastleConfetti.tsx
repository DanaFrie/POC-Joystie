'use client';

import type { CSSProperties } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';

type ChildCastleConfettiProps = {
  className?: string;
  style?: CSSProperties;
};

/** Figma 13702:9497 — confetti GIF (490.426px). */
export function ChildCastleConfetti({ className = '', style }: ChildCastleConfettiProps) {
  return (
    <OnboardingLazyImage
      src={CHILD_ONBOARDING_ASSETS.confettiRed}
      alt=""
      className={`pointer-events-none object-cover object-center ${className}`}
      style={style}
      priority
    />
  );
}
