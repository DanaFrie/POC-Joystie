'use client';

import { useCallback, useEffect, useState } from 'react';
import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import { useFunnelHeroBleedInsets } from '@/components/ui/FunnelViewportContext';
import {
  CHILD_EGG_HATCH_SEGMENT_COUNT,
  CHILD_ONBOARDING_ASSETS,
} from '@/constants/child-onboarding-assets';
import {
  CHILD_EGG_INTRO_FRAME,
  CHILD_EGG_VIDEO_FRAME,
} from '@/constants/child-onboarding-layout';
import { useSegmentedVideoTap } from '@/hooks/useSegmentedVideoTap';
import { ChildEggHatchArrow } from '@/components/onboarding/child/ChildEggHatchArrow';

type ChildEggHatchStepProps = {
  childGender?: 'boy' | 'girl';
  onComplete: () => void;
  onBack?: () => void;
};

function eggTapHint(gender: 'boy' | 'girl') {
  return gender === 'girl' ? 'לחצי על הביצה!' : 'תלחץ על הביצה!';
}

function eggHeadlineStart(gender: 'boy' | 'girl') {
  return gender === 'girl' ? 'תתחילי ללחוץ על' : 'תתחיל ללחוץ על';
}

/**
 * Screens 5–5b — Figma 13147:5625 + 5626.
 * Intro stays mounted; egg video advances one segment per tap at normal speed.
 */
export function ChildEggHatchStep({
  childGender = 'boy',
  onComplete,
  onBack,
}: ChildEggHatchStepProps) {
  const intro = CHILD_EGG_INTRO_FRAME;
  const eggFrame = CHILD_EGG_VIDEO_FRAME;
  const { bleedX, bleedY, width: bleedWidth } = useFunnelHeroBleedInsets();
  const [hintPulse, setHintPulse] = useState(false);

  const {
    videoRef,
    videoReady,
    markVideoReady,
    playNextSegment,
    isPlayingSegment,
  } = useSegmentedVideoTap(CHILD_EGG_HATCH_SEGMENT_COUNT, onComplete);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markVideoReady();
      return;
    }
    const fallback = window.setTimeout(() => markVideoReady(), 800);
    return () => window.clearTimeout(fallback);
  }, [markVideoReady, videoRef]);

  const handleEggTap = useCallback(() => {
    if (isPlayingSegment) return;
    setHintPulse(true);
    window.setTimeout(() => setHintPulse(false), 220);
    playNextSegment();
  }, [isPlayingSegment, playNextSegment]);

  const glowLayerWidth = Math.max(intro.glow.width, bleedWidth + bleedX * 2);

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      {onBack ? (
        <OnboardingBackButton tone="light" onClick={onBack} />
      ) : null}

      <div
        className="absolute z-[3] overflow-hidden"
        style={{
          left: eggFrame.left,
          top: eggFrame.top,
          width: eggFrame.width,
          height: eggFrame.height,
          aspectRatio: eggFrame.aspectRatio,
        }}
      >
        <video
          ref={videoRef}
          src={CHILD_ONBOARDING_ASSETS.eggHatchVideo}
          muted
          playsInline
          preload="auto"
          onLoadedData={markVideoReady}
          onCanPlay={markVideoReady}
          onLoadedMetadata={markVideoReady}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-200"
          style={{
            opacity: videoReady ? 1 : 0,
            aspectRatio: eggFrame.aspectRatio,
          }}
          aria-hidden
        />
      </div>

      {/* Ellipse 482 — foreground wash over video */}
      <div
        className="pointer-events-none absolute z-[8] overflow-visible"
        style={{
          top: -bleedY,
          left: intro.glow.left - bleedX,
          width: glowLayerWidth,
          height: intro.glow.height + bleedY,
        }}
        aria-hidden
      >
        <div
          className="absolute"
          style={{
            top: 0,
            left: 0,
            width: intro.glow.width,
            height: intro.glow.height,
          }}
        >
          <div
            className="absolute rounded-[50%]"
            style={{
              inset: '-201% -41.5%',
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(140, 0, 255, 0.35) 0%, rgba(200, 180, 255, 0.2) 35%, transparent 72%)',
              filter: 'blur(48px)',
            }}
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute z-10 flex flex-col items-center"
        style={{
          left: intro.left,
          top: intro.top,
          width: intro.width,
          gap: intro.contentGap,
        }}
      >
        <p className="w-full text-center font-simpler text-[24px] font-normal leading-[30px] tracking-[-0.36px] text-v03-green-900">
          כדי להעיר את דורי,
        </p>
        <div
          className="flex w-full flex-col items-center"
          style={{ gap: intro.titleGap }}
        >
          <p className="w-[287px] text-center font-simpler text-[36px] font-semibold leading-none tracking-[-0.72px] text-v03-green-900">
            {eggHeadlineStart(childGender)}
          </p>
          <p className="w-full text-center font-simpler text-[50px] font-black leading-[1.1] tracking-[-1px] text-[#8C00FF]">
            ביצת הדרקון!
          </p>
        </div>
      </div>

      <p
        className={`pointer-events-none absolute left-1/2 z-10 w-[161px] -translate-x-1/2 -translate-y-1/2 text-center font-simpler text-[24px] font-bold leading-[30px] tracking-[-0.36px] text-v03-green-900 ${
          hintPulse ? 'egg-hint-pulse' : ''
        }`}
        style={{ top: intro.hintTop }}
      >
        {eggTapHint(childGender)}
      </p>

      <ChildEggHatchArrow
        className="pointer-events-none absolute z-10"
        style={{
          left: intro.arrow.left,
          top: intro.arrow.top,
        }}
      />

      <button
        type="button"
        onClick={handleEggTap}
        disabled={isPlayingSegment}
        className="absolute z-20 cursor-pointer border-0 bg-transparent p-0"
        style={{
          left: eggFrame.left,
          top: eggFrame.top,
          width: eggFrame.width,
          height: eggFrame.height,
        }}
        aria-label="לחץ על ביצת הדרקון"
      />
    </div>
  );
}
