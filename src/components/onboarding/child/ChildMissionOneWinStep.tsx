'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChildTurquoiseFooter } from '@/components/onboarding/child/ChildTurquoiseFooter';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
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
  const scaleY = useFunnelProportionalTopPx;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [continuing, setContinuing] = useState(false);
  const [pageOpacity, setPageOpacity] = useState(1);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [imageOpacity, setImageOpacity] = useState(0);
  const onContinueRef = useRef(onContinue);
  onContinueRef.current = onContinue;

  const contentTopPx = scaleY(layout.content.top);
  const contentGapPx = scaleY(layout.content.gap);
  const headerGapPx = scaleY(layout.header.gap);
  const checkSizePx = scaleY(layout.check.size);
  const heroWidthPx = scaleY(layout.hero.width);
  const heroHeightPx = scaleY(layout.hero.height);
  const happyWidthPx = scaleY(happy.width);
  const happyHeightPx = scaleY(happy.height);

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
    <FunnelStepRoot
      fitViewport
      aria-label="סיום משימה 1"
      className="overflow-hidden bg-transparent"
      style={{ opacity: pageOpacity, transition: pageTransition }}
    >
      <section
        className="absolute z-10 flex flex-col items-center"
        style={{
          left: `calc(50% - ${layout.content.width / 2}px)`,
          top: contentTopPx,
          width: layout.content.width,
          gap: contentGapPx,
        }}
      >
        <div
          className="flex w-full flex-col items-center"
          style={{ gap: headerGapPx }}
        >
          <div
            className="relative shrink-0"
            style={{ width: checkSizePx, height: checkSizePx }}
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
          style={{ width: heroWidthPx, height: heroHeightPx }}
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
              width: happyWidthPx,
              height: happyHeightPx,
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
    </FunnelStepRoot>
  );
}
