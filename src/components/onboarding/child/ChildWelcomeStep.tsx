'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import {
  useFunnelFullBleed,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
import {
  CHILD_ONBOARDING_HERO_VIDEO,
  CHILD_ONBOARDING_PLACEHOLDER_NAME,
  CHILD_WELCOME_ELLIPSE_389,
  CHILD_WELCOME_ELLIPSE_391,
  CHILD_WELCOME_HEADLINE,
  CHILD_WELCOME_STATUS_BUBBLE,
} from '@/constants/child-onboarding-figma';

type ChildWelcomeStepProps = {
  onComplete: () => void;
};

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
 * Hero video + welcome copy + status bubble (no device status-bar chrome).
 */
export function ChildWelcomeStep({ onComplete }: ChildWelcomeStepProps) {
  const bubble = CHILD_WELCOME_STATUS_BUBBLE;
  const headline = CHILD_WELCOME_HEADLINE;
  const videoFillStyle = useFunnelFullBleed();
  const { designWidth } = useFunnelViewportMetrics();
  const completedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const markVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setVideoReady(true);
      return;
    }
    const fallback = window.setTimeout(() => setVideoReady(true), 800);
    return () => window.clearTimeout(fallback);
  }, []);

  const ellipseLayerWidth =
    Math.max(designWidth, WELCOME_ELLIPSE_MAX_RIGHT) - WELCOME_ELLIPSE_MIN_LEFT;

  const handleVideoEnd = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  return (
    <div
      className="relative h-full w-full overflow-visible bg-transparent"
      aria-label="ברוכים הבאים לג׳ויסטי"
    >
      <div
        className="absolute z-[1] overflow-hidden bg-v03-green-900"
        style={videoFillStyle}
      >
        <video
          ref={videoRef}
          src={CHILD_ONBOARDING_HERO_VIDEO}
          autoPlay
          muted
          playsInline
          preload="auto"
          onLoadedData={markVideoReady}
          onCanPlay={markVideoReady}
          onPlaying={markVideoReady}
          onEnded={handleVideoEnd}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-200"
          style={{ opacity: videoReady ? 1 : 0 }}
          aria-hidden
        />
      </div>

      <OnboardingMintGlow />

      <div
        className="pointer-events-none absolute top-0 z-[3] overflow-visible"
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

      <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
        <div
          className="absolute left-1/2 flex -translate-x-1/2 flex-col items-start"
          style={{
            top: headline.top,
            width: headline.width,
          }}
        >
          <h1
            className="w-full whitespace-pre-wrap text-center font-simpler font-black text-white"
            style={{
              fontSize: headline.fontSize,
              lineHeight: headline.lineHeight,
              letterSpacing: `${headline.letterSpacing}px`,
              textShadow: headline.textShadow,
            }}
          >
            {`${CHILD_ONBOARDING_PLACEHOLDER_NAME}, `}
            {'\n'}
            ברוך הבא לג׳ויסטי!
          </h1>
        </div>

        <div
          className="pointer-events-auto absolute flex items-center justify-center box-border"
          style={{
            top: bubble.top,
            left: bubble.left,
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
    </div>
  );
}
