'use client';

import { useRef } from 'react';
import {
  useFunnelBleedBarStyle,
  useFunnelHeroBleed,
} from '@/components/ui/FunnelViewportContext';
import {
  CHILD_ONBOARDING_HERO_VIDEO,
  CHILD_WELCOME_STATUS_BUBBLE,
} from '@/constants/child-onboarding-figma';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

type ChildWelcomeStepProps = {
  onComplete: () => void;
};

/**
 * Screen 1 — hero video (letterbox bleed) + Frame 1597882462 status bar
 * (482px centered on 375; corners clip inside canvas).
 */
export function ChildWelcomeStep({ onComplete }: ChildWelcomeStepProps) {
  const bubble = CHILD_WELCOME_STATUS_BUBBLE;
  const videoBleedStyle = useFunnelHeroBleed(V03_SCREEN_HEIGHT);
  const statusBarStyle = useFunnelBleedBarStyle(bubble.top);
  const completedRef = useRef(false);

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
        className="absolute z-[1] flex justify-center overflow-hidden"
        style={videoBleedStyle}
      >
        <video
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="block h-full w-auto max-w-none"
          aria-hidden
        >
          <source src={CHILD_ONBOARDING_HERO_VIDEO} type="video/mp4" />
        </video>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
        <div
          className="pointer-events-auto absolute flex items-center justify-center box-border"
          style={{
            ...statusBarStyle,
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
            className="shrink-0 text-center font-simpler font-bold text-white"
            style={{
              fontSize: bubble.fontSize,
              lineHeight: `${bubble.lineHeight}px`,
            }}
          >
            עוד כמה רגעים מתחילים...
          </p>
        </div>
      </div>
    </div>
  );
}
