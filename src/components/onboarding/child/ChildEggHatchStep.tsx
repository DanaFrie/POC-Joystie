'use client';

import { useCallback, useEffect, useState } from 'react';
import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import {
  useFunnelHeroBleedInsets,
  useFunnelProportionalTopPx,
} from '@/components/ui/FunnelViewportContext';
import {
  CHILD_EGG_HATCH_FAST_HEAD_TAPS,
  CHILD_EGG_HATCH_FAST_PLAYBACK_RATE,
  CHILD_EGG_HATCH_FAST_TAIL_TAPS,
  CHILD_EGG_HATCH_LATE_DURATION_SHARE,
  CHILD_EGG_HATCH_LATE_TAP_COUNT,
  CHILD_EGG_HATCH_MID_PLAYBACK_RATE,
  CHILD_EGG_HATCH_SEGMENT_COUNT,
  CHILD_ONBOARDING_ASSETS,
} from '@/constants/child-onboarding-assets';
import {
  CHILD_EGG_INTRO_FRAME,
  CHILD_EGG_ARROW_TO_HINT_GAP_PX,
  CHILD_EGG_EGG_TO_ARROW_GAP_PX,
  CHILD_EGG_INTRO_TO_EGG_GAP_PX,
  CHILD_EGG_VIDEO_FRAME,
} from '@/constants/child-onboarding-layout';
import {
  useSegmentedVideoTap,
  type SegmentPlaybackRateFn,
  type SegmentRangeFn,
} from '@/hooks/useSegmentedVideoTap';
import { ChildEggHatchArrow } from '@/components/onboarding/child/ChildEggHatchArrow';

/** Soft oval — hides the baked white square plate + Kling watermark in the MP4. */
const EGG_VIDEO_SOFT_MASK =
  'radial-gradient(ellipse 52% 58% at 50% 48%, #000 58%, transparent 76%)';

const eggHatchPlaybackRate: SegmentPlaybackRateFn = (segmentIndex, segmentCount) => {
  if (segmentIndex < CHILD_EGG_HATCH_FAST_HEAD_TAPS) {
    return CHILD_EGG_HATCH_FAST_PLAYBACK_RATE;
  }
  if (segmentIndex >= segmentCount - CHILD_EGG_HATCH_FAST_TAIL_TAPS) {
    return CHILD_EGG_HATCH_FAST_PLAYBACK_RATE;
  }
  return CHILD_EGG_HATCH_MID_PLAYBACK_RATE;
};

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

/** First 18 taps share 85%; last 2 taps share 15% of the hatch clip. */
const eggHatchSegmentRange: SegmentRangeFn = (segmentIndex, segmentCount, duration) => {
  const lateCount = Math.min(CHILD_EGG_HATCH_LATE_TAP_COUNT, segmentCount);
  const earlyCount = Math.max(0, segmentCount - lateCount);
  const lateShare = CHILD_EGG_HATCH_LATE_DURATION_SHARE;
  const earlyShare = 1 - lateShare;
  const earlyEnd = duration * earlyShare;

  if (segmentIndex < earlyCount) {
    const seg = earlyEnd / earlyCount;
    return {
      start: segmentIndex * seg,
      end: Math.min((segmentIndex + 1) * seg, earlyEnd),
    };
  }

  const lateIndex = segmentIndex - earlyCount;
  const lateSeg = (duration * lateShare) / lateCount;
  return {
    start: earlyEnd + lateIndex * lateSeg,
    end: Math.min(earlyEnd + (lateIndex + 1) * lateSeg, duration),
  };
};

/**
 * Screens 5–5b — Figma 13147:5625 + 5626.
 * Light background (flow shell) · 100vh fixed stack · egg @ top 295.
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

  const scaleY = useFunnelProportionalTopPx;

  const eggTopPx = scaleY(eggFrame.top);
  const introToEggGapPx = scaleY(CHILD_EGG_INTRO_TO_EGG_GAP_PX);
  const introBottomPx = eggTopPx - introToEggGapPx;
  const eggHeightPx = scaleY(eggFrame.height);
  const eggBottomPx = eggTopPx + eggHeightPx;
  const arrowTopPx = eggBottomPx + scaleY(CHILD_EGG_EGG_TO_ARROW_GAP_PX);
  const arrowHeightPx = scaleY(intro.arrow.height);
  const hintTopPx = arrowTopPx + arrowHeightPx + scaleY(CHILD_EGG_ARROW_TO_HINT_GAP_PX);
  const glowLayerHeightPx = eggTopPx + eggHeightPx * 0.45 + bleedY;

  const {
    videoRef,
    videoReady,
    markVideoReady,
    playNextSegment,
    isPlayingSegment,
  } = useSegmentedVideoTap(
    CHILD_EGG_HATCH_SEGMENT_COUNT,
    onComplete,
    eggHatchPlaybackRate,
    eggHatchSegmentRange
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
    setHintPulse(true);
    window.setTimeout(() => setHintPulse(false), 180);
    playNextSegment();
  }, [playNextSegment]);

  const glowLayerWidth = Math.max(intro.glow.width, bleedWidth + bleedX * 2);

  return (
    <FunnelStepRoot fitViewport aria-label="ביצת הדרקון" className="overflow-hidden bg-transparent">
      {onBack ? (
        <OnboardingBackButton tone="light" onClick={onBack} />
      ) : null}

      {/* Egg video — soft oval mask drops the white square plate from the MP4 */}
      <div
        className="absolute z-[2] overflow-hidden"
        style={{
          left: eggFrame.left,
          top: eggTopPx,
          width: eggFrame.width,
          height: eggHeightPx,
          WebkitMaskImage: EGG_VIDEO_SOFT_MASK,
          maskImage: EGG_VIDEO_SOFT_MASK,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
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
            /* White plate → transparent against the light funnel gradient */
            mixBlendMode: 'multiply',
          }}
          aria-hidden
        />
      </div>

      {/* Ellipse 482 — in front of egg video, under copy */}
      <div
        className="pointer-events-none absolute z-[6] overflow-visible"
        style={{
          top: -bleedY,
          left: intro.glow.left - bleedX,
          width: glowLayerWidth,
          height: glowLayerHeightPx + bleedY,
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
          top: introBottomPx,
          transform: 'translateY(-100%)',
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
        className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center font-simpler text-[24px] font-bold leading-[30px] tracking-[-0.36px] text-v03-green-900 ${
          hintPulse ? 'egg-hint-pulse' : ''
        }`}
        style={{ top: hintTopPx, width: intro.hintWidth }}
      >
        {eggTapHint(childGender)}
      </p>

      <ChildEggHatchArrow
        className="pointer-events-none absolute z-10"
        style={{
          left: intro.arrow.left,
          top: arrowTopPx,
          width: intro.arrow.width,
          height: arrowHeightPx,
        }}
      />

      <button
        type="button"
        onClick={handleEggTap}
        className="absolute z-20 cursor-pointer border-0 bg-transparent p-0"
        style={{
          left: eggFrame.left,
          top: eggTopPx,
          width: eggFrame.width,
          height: eggHeightPx,
        }}
        aria-label="לחץ על ביצת הדרקון"
        aria-busy={isPlayingSegment}
      />
    </FunnelStepRoot>
  );
}
