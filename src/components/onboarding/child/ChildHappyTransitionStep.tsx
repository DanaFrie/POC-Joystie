'use client';

import { useEffect, useRef, useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import {
  CHILD_HAPPY_TRANSITION,
  CHILD_HAPPY_TRANSITION_MS,
  CHILD_MISSION_ONE_WIN,
} from '@/constants/child-post-game-layout';

/** Headline only — confetti video crossfades to dori-happy at mission-1 hero position. */
export function ChildHappyTransitionStep({
  childName,
  onComplete,
}: {
  childName: string;
  onComplete: () => void;
}) {
  const layout = CHILD_HAPPY_TRANSITION;
  const headline = CHILD_MISSION_ONE_WIN.headline;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [imageOpacity, setImageOpacity] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (video) void video.play().catch(() => {});

    const fadeStart = window.setTimeout(() => {
      setVideoOpacity(0);
      setImageOpacity(1);
    }, CHILD_HAPPY_TRANSITION_MS * 0.35);

    const done = window.setTimeout(onComplete, CHILD_HAPPY_TRANSITION_MS);

    return () => {
      window.clearTimeout(fadeStart);
      window.clearTimeout(done);
    };
  }, [onComplete]);

  const heroTransition = `opacity ${CHILD_HAPPY_TRANSITION_MS * 0.65}ms ease-out`;

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      <h1
        className="absolute left-1/2 z-10 w-full max-w-[327px] -translate-x-1/2 text-center font-simpler font-black"
        style={{
          top: layout.headlineTop,
          fontSize: headline.fontSize,
          lineHeight: headline.lineHeight,
          letterSpacing: `${headline.letterSpacing}px`,
          color: headline.color,
        }}
      >
        {`אליפות, כל הכבוד ${childName}!`}
      </h1>

      <div
        className="absolute left-1/2 z-10 -translate-x-1/2 overflow-hidden rounded-full"
        style={{
          top: layout.heroTop,
          width: layout.hero.width,
          height: layout.hero.height,
        }}
        aria-hidden
      >
        <video
          ref={videoRef}
          src={CHILD_ONBOARDING_ASSETS.doriConfettiCelebrate}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 size-full object-cover object-center"
          style={{ opacity: videoOpacity, transition: heroTransition }}
        />
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.doriHappy}
          alt=""
          className="absolute inset-0 size-full object-cover object-center"
          style={{ opacity: imageOpacity, transition: heroTransition }}
          priority
        />
      </div>
    </div>
  );
}
