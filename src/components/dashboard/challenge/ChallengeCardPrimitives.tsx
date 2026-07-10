'use client';

import type { ReactNode } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';

type ChallengeCardHeroProps = {
  src: string;
  /** Figma artboard width — drives contain sizing inside the frame. */
  frameWidth: number;
  /** Figma artboard height — drives contain sizing inside the frame. */
  frameHeight: number;
  className?: string;
  showGradient?: boolean;
};

/**
 * Hero image inside challenge cards — object-contain to match onboarding frame proportions.
 */
export function ChallengeCardHero({
  src,
  frameWidth,
  frameHeight,
  className = '',
  showGradient = false,
}: ChallengeCardHeroProps) {
  return (
    <div
      className={`relative mx-auto shrink-0 overflow-visible ${className}`}
      style={{ width: frameWidth, height: frameHeight, maxWidth: '100%' }}
      aria-hidden
    >
      <OnboardingLazyImage
        src={src}
        alt=""
        className="size-full object-contain object-center"
        priority
      />
      {showGradient ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(9, 33, 37, 0) 55%, rgba(9, 33, 37, 0.75) 100%)',
          }}
        />
      ) : null}
    </div>
  );
}

type ChallengeEyebrowProps = {
  children: ReactNode;
};

/** Small white headline — onboarding tone. */
export function ChallengeEyebrow({ children }: ChallengeEyebrowProps) {
  return (
    <p className="w-full text-center font-simpler text-[14px] font-semibold leading-[18px] text-white">
      {children}
    </p>
  );
}

type ChallengeTitleProps = {
  id?: string;
  children: ReactNode;
};

export function ChallengeTitle({ id, children }: ChallengeTitleProps) {
  return (
    <h2
      id={id}
      className="w-full text-center font-simpler text-[26px] font-black leading-[30px] tracking-[-0.4px] text-white"
    >
      {children}
    </h2>
  );
}

type ChallengeBodyProps = {
  children: ReactNode;
};

export function ChallengeBody({ children }: ChallengeBodyProps) {
  return (
    <p className="w-full text-center font-simpler text-[15px] font-normal leading-[22px] text-white/85">
      {children}
    </p>
  );
}
