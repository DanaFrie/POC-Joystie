'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import {
  FunnelStepBackground,
  FunnelStepForeground,
  FunnelStepRoot,
  FunnelStepSection,
} from '@/components/ui/funnel-layout';
import {
  useFunnelProportionalTopPx,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
import {
  CHILD_ONBOARDING_HERO_VIDEO,
  CHILD_WELCOME_ELLIPSE_389,
  CHILD_WELCOME_ELLIPSE_391,
  CHILD_WELCOME_HEADLINE,
  CHILD_WELCOME_STATUS_BUBBLE,
} from '@/constants/child-onboarding-figma';

type ChildWelcomeStepProps = {
  childName: string;
  childGender?: 'boy' | 'girl';
  onComplete: () => void;
};

/** If `ended` never fires (autoplay blocked / 4G stall), still leave this screen. */
const WELCOME_VIDEO_STALL_MS = 16_000;

function kickWelcomeVideo(el: HTMLVideoElement) {
  el.muted = true;
  el.defaultMuted = true;
  el.playsInline = true;
  el.setAttribute('playsinline', 'true');
  el.setAttribute('webkit-playsinline', 'true');
  return el.play();
}

const WELCOME_ELLIPSE_MIN_LEFT = Math.min(
  CHILD_WELCOME_ELLIPSE_389.left,
  CHILD_WELCOME_ELLIPSE_391.left
);

const WELCOME_ELLIPSE_MAX_RIGHT = Math.max(
  CHILD_WELCOME_ELLIPSE_389.left + CHILD_WELCOME_ELLIPSE_389.width,
  CHILD_WELCOME_ELLIPSE_391.left + CHILD_WELCOME_ELLIPSE_391.width
);

const WELCOME_ELLIPSE_LAYER_HEIGHT = Math.max(
  CHILD_WELCOME_ELLIPSE_389.top + CHILD_WELCOME_ELLIPSE_389.height,
  CHILD_WELCOME_ELLIPSE_391.top + CHILD_WELCOME_ELLIPSE_391.height
);

/**
 * Screen 1 — Figma 13147:5620.
 * Cinematic bleed (video) + 100vh foreground (headline → status bubble).
 */
export function ChildWelcomeStep({
  childName,
  childGender = 'boy',
  onComplete,
}: ChildWelcomeStepProps) {
  const { designWidth } = useFunnelViewportMetrics();
  const completedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  const markVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  const tryPlay = useCallback(() => {
    const el = videoRef.current;
    if (!el || completedRef.current) return;
    void kickWelcomeVideo(el)
      .then(() => setVideoReady(true))
      .catch(() => setVideoReady(true));
  }, []);

  useEffect(() => {
    tryPlay();
    const onVis = () => {
      if (document.visibilityState === 'visible') tryPlay();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [tryPlay]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setVideoReady(true);
    }
    const fallback = window.setTimeout(() => setVideoReady(true), 800);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    let timeoutId = 0;
    const arm = () => {
      window.clearTimeout(timeoutId);
      const duration = el?.duration;
      const waitMs =
        Number.isFinite(duration) && duration && duration > 0
          ? Math.min((duration + 2.5) * 1000, 25_000)
          : WELCOME_VIDEO_STALL_MS;
      timeoutId = window.setTimeout(finish, waitMs);
    };
    arm();
    el?.addEventListener('loadedmetadata', arm);
    return () => {
      window.clearTimeout(timeoutId);
      el?.removeEventListener('loadedmetadata', arm);
    };
  }, [finish]);

  const ellipseLayerWidth =
    Math.max(designWidth, WELCOME_ELLIPSE_MAX_RIGHT) - WELCOME_ELLIPSE_MIN_LEFT;

  return (
    <FunnelStepRoot aria-label="ברוכים הבאים לג׳ויסטי" fitViewport>
      <FunnelStepBackground
        preserveCanvasHeight
        showGrid
        fullBleedLayer={
          <video
            ref={videoRef}
            src={CHILD_ONBOARDING_HERO_VIDEO}
            autoPlay
            muted
            playsInline
            preload="auto"
            onLoadedData={() => {
              markVideoReady();
              tryPlay();
            }}
            onCanPlay={() => {
              markVideoReady();
              tryPlay();
            }}
            onPlaying={markVideoReady}
            onEnded={finish}
            onError={finish}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-200"
            style={{ opacity: videoReady ? 1 : 0 }}
            aria-hidden
          />
        }
      >
        <div
          className="pointer-events-none absolute top-0 overflow-visible"
          style={{
            left: WELCOME_ELLIPSE_MIN_LEFT,
            width: ellipseLayerWidth,
            height: WELCOME_ELLIPSE_LAYER_HEIGHT,
          }}
          aria-hidden
        >
          <div
            className="absolute rounded-[50%]"
            style={{
              top: CHILD_WELCOME_ELLIPSE_391.top,
              left: CHILD_WELCOME_ELLIPSE_391.left - WELCOME_ELLIPSE_MIN_LEFT,
              width: CHILD_WELCOME_ELLIPSE_391.width,
              height: CHILD_WELCOME_ELLIPSE_391.height,
              background: CHILD_WELCOME_ELLIPSE_391.fill,
              filter: `blur(${CHILD_WELCOME_ELLIPSE_391.blurPx}px)`,
            }}
          />
          <div
            className="absolute rounded-[50%]"
            style={{
              top: CHILD_WELCOME_ELLIPSE_389.top,
              left: CHILD_WELCOME_ELLIPSE_389.left - WELCOME_ELLIPSE_MIN_LEFT,
              width: CHILD_WELCOME_ELLIPSE_389.width,
              height: CHILD_WELCOME_ELLIPSE_389.height,
              background: CHILD_WELCOME_ELLIPSE_389.fill,
              filter: `blur(${CHILD_WELCOME_ELLIPSE_389.blurPx}px)`,
            }}
          />
        </div>

        <OnboardingMintGlow />
      </FunnelStepBackground>

      <FunnelStepForeground
        className="!px-0"
        distribution="start"
        padTopPx={0}
        padBottomPx={0}
        fitViewport
      >
        <button
          type="button"
          className="absolute inset-0 z-[5] cursor-pointer bg-transparent"
          aria-label="הפעל"
          onClick={tryPlay}
        />

        <FunnelStepSection>
          <ChildWelcomeHeadline childName={childName} childGender={childGender} />
        </FunnelStepSection>

        <ChildWelcomeStatusBubble />
      </FunnelStepForeground>
    </FunnelStepRoot>
  );
}

type ChildWelcomeHeadlineProps = {
  childName: string;
  childGender: 'boy' | 'girl';
};

/** Figma @ top 108 — flow: clamp top inset, flex with viewport. */
function ChildWelcomeHeadline({ childName, childGender }: ChildWelcomeHeadlineProps) {
  const headline = CHILD_WELCOME_HEADLINE;

  return (
    <div className="pointer-events-none flex w-full justify-center pt-[clamp(48px,13vh,108px)]">
      <h1
        className="w-full max-w-[327px] whitespace-pre-wrap text-center font-simpler font-black text-white"
        style={{
          fontSize: headline.fontSize,
          lineHeight: headline.lineHeight,
          letterSpacing: `${headline.letterSpacing}px`,
          textShadow: headline.textShadow,
        }}
      >
        {`${childName}, `}
        {'\n'}
        {childGender === 'girl' ? 'ברוכה הבאה לג׳ויסטי!' : 'ברוך הבא לג׳ויסטי!'}
      </h1>
    </div>
  );
}

/**
 * Figma @ top 674 on 812 — scale Y with visible canvas so iPhone 12 matches design;
 * SE / S20 stay proportionally aligned.
 */
function ChildWelcomeStatusBubble() {
  const bubble = CHILD_WELCOME_STATUS_BUBBLE;
  const topPx = useFunnelProportionalTopPx(bubble.top);

  return (
    <div
      className="pointer-events-none absolute z-10 overflow-visible"
      style={{ top: topPx, left: bubble.left, width: bubble.width }}
    >
      <div
        className="pointer-events-auto flex shrink-0 items-center justify-center box-border"
        style={{
          width: bubble.width,
          paddingTop: bubble.paddingTop,
          paddingBottom: bubble.paddingBottom,
          paddingLeft: bubble.paddingLeft,
          paddingRight: bubble.paddingRight,
          gap: bubble.gap,
          borderRadius: bubble.borderRadius,
          outline: bubble.outline,
          outlineOffset: 0,
          background: bubble.background,
          boxShadow: bubble.boxShadow,
          backdropFilter: `blur(${bubble.backdropBlur}px)`,
          WebkitBackdropFilter: `blur(${bubble.backdropBlur}px)`,
        }}
      >
        <p
          className="shrink-0 whitespace-nowrap text-center font-simpler font-bold text-white"
          style={{
            fontSize: bubble.fontSize,
            lineHeight: `${bubble.lineHeight}px`,
            letterSpacing: '-0.3px',
          }}
        >
          עוד כמה רגעים מתחילים...
        </p>
      </div>
    </div>
  );
}
