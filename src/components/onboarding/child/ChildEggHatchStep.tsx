'use client';

import { useCallback, useEffect } from 'react';
import { useFunnelHeroBleedInsets } from '@/components/ui/FunnelViewportContext';
import {
  CHILD_EGG_HATCH_FAST_HEAD_TAPS,
  CHILD_EGG_HATCH_FAST_PLAYBACK_RATE,
  CHILD_EGG_HATCH_FAST_TAIL_TAPS,
  CHILD_EGG_HATCH_NORMAL_PLAYBACK_RATE,
  CHILD_EGG_HATCH_SEGMENT_COUNT,
  CHILD_ONBOARDING_ASSETS,
} from '@/constants/child-onboarding-assets';
import {
  CHILD_EGG_INTRO_FRAME,
  CHILD_EGG_VIDEO_FRAME,
} from '@/constants/child-onboarding-layout';
import {
  useSegmentedVideoTap,
  type SegmentPlaybackRateFn,
} from '@/hooks/useSegmentedVideoTap';

type ChildEggHatchStepProps = {
  onComplete: () => void;
};

const eggHatchPlaybackRate: SegmentPlaybackRateFn = (segmentIndex, segmentCount) => {
  if (segmentIndex < CHILD_EGG_HATCH_FAST_HEAD_TAPS) {
    return CHILD_EGG_HATCH_FAST_PLAYBACK_RATE;
  }
  if (segmentIndex >= segmentCount - CHILD_EGG_HATCH_FAST_TAIL_TAPS) {
    return CHILD_EGG_HATCH_FAST_PLAYBACK_RATE;
  }
  return CHILD_EGG_HATCH_NORMAL_PLAYBACK_RATE;
};

/**
 * Screens 5–5b — Figma 13147:5625 + 5626.
 * Intro stays mounted; egg video advances 1/50 per tap (fast head/tail segments).
 */
export function ChildEggHatchStep({ onComplete }: ChildEggHatchStepProps) {
  const intro = CHILD_EGG_INTRO_FRAME;
  const eggFrame = CHILD_EGG_VIDEO_FRAME;
  const { bleedX, bleedY, width: bleedWidth } = useFunnelHeroBleedInsets();

  const {
    videoRef,
    videoReady,
    markVideoReady,
    playNextSegment,
    isPlayingSegment,
  } = useSegmentedVideoTap(
    CHILD_EGG_HATCH_SEGMENT_COUNT,
    onComplete,
    eggHatchPlaybackRate
  );

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
    playNextSegment();
  }, [isPlayingSegment, playNextSegment]);

  const glowLayerWidth = Math.max(intro.glow.width, bleedWidth + bleedX * 2);

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      {/* Ellipse 482 — full upper wash (Figma 12945:15318) */}
      <div
        className="pointer-events-none absolute z-[2] overflow-visible"
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
        className="absolute z-[3] overflow-hidden"
        style={{
          left: eggFrame.left,
          top: eggFrame.top,
          width: eggFrame.width,
          height: eggFrame.height,
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
          style={{ opacity: videoReady ? 1 : 0 }}
          aria-hidden
        />
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
            תתחיל ללחוץ על
          </p>
          <p className="w-full text-center font-simpler text-[50px] font-black leading-[1.1] tracking-[-1px] text-[#8C00FF]">
            ביצת הדרקון!
          </p>
        </div>
      </div>

      <p
        className="pointer-events-none absolute left-1/2 z-10 w-[161px] -translate-x-1/2 -translate-y-1/2 text-center font-simpler text-[24px] font-bold leading-[30px] tracking-[-0.36px] text-v03-green-900"
        style={{ top: intro.hintTop }}
      >
        תלחץ על הביצה!
      </p>

      <svg
        className="pointer-events-none absolute z-10"
        style={{
          left: intro.arrow.left,
          top: intro.arrow.top,
          width: intro.arrow.width,
          height: intro.arrow.height,
        }}
        viewBox="0 0 13 36"
        fill="none"
        aria-hidden
      >
        <path
          d="M6.5 0C6.5 12 1 18 1 28C1 32 3 36 6.5 36"
          stroke="#8C00FF"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

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
