'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChildTurquoiseFooter } from '@/components/onboarding/child/ChildTurquoiseFooter';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import {
  CHILD_HAPPY_TRANSITION_MS,
  CHILD_MISSION_ONE_WIN,
} from '@/constants/child-post-game-layout';
import {
  ONBOARDING_COMPLETION_CHECK_IMAGE,
} from '@/constants/onboarding-completion-layout';

/** Post mission-1 win — purple check, confetti video → dori-happy on single CTA tap. */
export function ChildMissionOneWinStep({
  childName,
  onContinue,
}: {
  childName: string;
  onContinue?: () => void;
}) {
  const layout = CHILD_MISSION_ONE_WIN;
  const happy = layout.happyHero;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [continuing, setContinuing] = useState(false);
  const [pageOpacity, setPageOpacity] = useState(1);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [imageOpacity, setImageOpacity] = useState(0);
  const onContinueRef = useRef(onContinue);
  onContinueRef.current = onContinue;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {});
  }, []);

  const handleContinue = useCallback(() => {
    if (continuing) return;
    setContinuing(true);

    window.requestAnimationFrame(() => {
      setVideoOpacity(0);
      setImageOpacity(1);
    });

    window.setTimeout(() => {
      setPageOpacity(0);
    }, layout.happyFadeMs);

    window.setTimeout(() => {
      onContinueRef.current?.();
    }, layout.happyFadeMs + CHILD_HAPPY_TRANSITION_MS);
  }, [continuing, layout.happyFadeMs]);

  const heroTransition = `opacity ${layout.happyFadeMs}ms ease-out`;
  const pageTransition = `opacity ${CHILD_HAPPY_TRANSITION_MS}ms ease-out`;

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-transparent"
      style={{ opacity: pageOpacity, transition: pageTransition }}
    >
      <section
        className="absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center"
        style={{
          top: layout.content.top,
          width: layout.content.width,
          gap: layout.content.gap,
        }}
        aria-label="סיום משימה 1"
      >
        <div
          className="flex w-full flex-col items-center"
          style={{ gap: layout.header.gap }}
        >
          <div
            className="relative shrink-0"
            style={{ width: layout.check.size, height: layout.check.size }}
          >
            <OnboardingLazyImage
              src={ONBOARDING_COMPLETION_CHECK_IMAGE}
              alt=""
              className="size-full object-contain"
              priority
            />
          </div>

          <div className="flex w-full flex-col items-stretch text-center">
            <h1
              className="w-full font-simpler font-black"
              style={{
                fontSize: layout.headline.fontSize,
                lineHeight: layout.headline.lineHeight,
                letterSpacing: `${layout.headline.letterSpacing}px`,
                color: layout.headline.color,
              }}
            >
              {`אליפות, כל הכבוד ${childName}!`}
            </h1>
            <p
              className="w-full font-simpler font-normal"
              style={{
                fontSize: layout.body.fontSize,
                lineHeight: layout.body.lineHeight,
                letterSpacing: `${layout.body.letterSpacing}px`,
                color: layout.body.color,
              }}
            >
              איזה שיתוף פעולה נהדר, השלמתם את המשימה הראשונה!
            </p>
          </div>
        </div>

        <div
          className="relative flex shrink-0 items-center justify-center"
          style={{ width: layout.hero.width, height: layout.hero.height }}
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
            aria-hidden
          />
          <OnboardingLazyImage
            src={CHILD_ONBOARDING_ASSETS.doriHappy}
            alt=""
            className="relative z-[1] object-cover object-center"
            style={{
              width: happy.width,
              height: happy.height,
              aspectRatio: happy.aspectRatio,
              opacity: imageOpacity,
              transition: heroTransition,
            }}
            priority
          />
        </div>
      </section>

      {onContinue ? (
        <ChildTurquoiseFooter onClick={handleContinue} disabled={continuing}>
          המשך
        </ChildTurquoiseFooter>
      ) : null}
    </div>
  );
}
