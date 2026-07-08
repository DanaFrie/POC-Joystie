'use client';

import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildSelfieCameraDeniedOverlay } from '@/components/onboarding/child/ChildSelfieCameraDeniedOverlay';
import { ChildSelfieCameraViewport } from '@/components/onboarding/child/ChildSelfieCameraViewport';
import { ChildSelfieCapturedFacesLayer } from '@/components/onboarding/child/ChildSelfieCapturedFacesLayer';
import { ChildSelfieHoleLiveFeed } from '@/components/onboarding/child/ChildSelfieHoleLiveFeed';
import { ChildSelfieFaceMask } from '@/components/onboarding/child/ChildSelfieFaceMask';
import type { SelfieFaceHole } from '@/components/onboarding/child/ChildSelfieFaceMask';
import { holeBadgeStyle } from '@/components/onboarding/child/childSelfieArtboard';
import {
  FunnelStepForeground,
  FunnelStepRoot,
  FunnelStepSection,
} from '@/components/ui/funnel-layout';
import { useFunnelBleedBarStyle, useFunnelFullBleed, useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import {
  CHILD_SELFIE_CAPTURE_PREVIEW,
  CHILD_SELFIE_PATTERN,
} from '@/constants/child-post-game-layout';
import { ChildSelfieCaptureCameraIcon } from '@/components/onboarding/child/ChildSharedPhotoIcons';
import { useSelfieCameraStream } from '@/hooks/useSelfieCameraStream';
import { captureLiveSelfieFaces } from '@/lib/onboarding/composeChildSelfieFrame';
import {
  CHILD_SELFIE_PATTERN_CAPTURE_LABEL,
} from '@/lib/onboarding/childPostGameCopy';
import { resolveParentCourtLabel } from '@/lib/onboarding/childBondingLabels';

function SelfieBlurredHole({
  hole,
  blurPx,
  strokePx,
}: {
  hole: SelfieFaceHole;
  blurPx: number;
  strokePx: number;
}) {
  const diameter = hole.r * 2;
  return (
    <div
      className="absolute rounded-full bg-white/20 outline outline-white backdrop-blur-[27px]"
      style={{
        left: hole.cx - hole.r,
        top: hole.cy - hole.r,
        width: diameter,
        height: diameter,
        outlineWidth: strokePx,
        outlineOffset: -strokePx,
        backdropFilter: `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
      }}
      aria-hidden
    />
  );
}

function ChildSelfieStaticBackdrop() {
  const coverStyle = useFunnelBleedBarStyle(0);
  return (
    <OnboardingLazyImage
      src={CHILD_ONBOARDING_ASSETS.castleDoriSelfie}
      alt=""
      className="pointer-events-none absolute z-0 object-cover"
      style={{ ...coverStyle, objectPosition: 'center bottom' }}
      priority
    />
  );
}

export type SelfieCapturedFaces = {
  childFace: Blob;
  parentFace: Blob;
};

type ChildSelfiePatternStepProps = {
  childName: string;
  parentGender?: 'female' | 'male' | null;
  parentName?: string | null;
  onFacesReady?: (faces: SelfieCapturedFaces) => void;
  onPreviewComplete?: () => void;
  onSkipWithoutPhoto?: () => void;
};

/** Mission 3 — one camera stream in two holes → capture → preview → loader. */
export function ChildSelfiePatternStep({
  childName,
  parentGender,
  parentName,
  onFacesReady,
  onPreviewComplete,
  onSkipWithoutPhoto,
}: ChildSelfiePatternStepProps) {
  const layout = CHILD_SELFIE_PATTERN;
  const previewTiming = CHILD_SELFIE_CAPTURE_PREVIEW;
  const fullBleedStyle = useFunnelFullBleed();
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const scale = usableCanvasHeightPx / 812;
  const parentLabel = resolveParentCourtLabel(parentGender, parentName);
  const {
    videoRef,
    bindVideoElement,
    status,
    stream,
    videoReady,
    markVideoReady,
    requestCamera,
    releaseCamera,
  } = useSelfieCameraStream();
  const [previewUrls, setPreviewUrls] = useState<{ child: string; parent: string } | null>(null);
  const [previewFading, setPreviewFading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [retryBusy, setRetryBusy] = useState(false);
  const capturedRef = useRef(false);
  const previewUrlsRef = useRef<{ child: string; parent: string } | null>(null);
  const onPreviewCompleteRef = useRef(onPreviewComplete);

  onPreviewCompleteRef.current = onPreviewComplete;

  const cameraWarming = status === 'active' && Boolean(stream) && !previewUrls && !videoReady;
  const streamActive = status === 'active' && Boolean(stream) && !previewUrls;
  const useLiveCamera = streamActive && videoReady;
  const showBlurredHoles = (!useLiveCamera && !previewUrls) || cameraWarming;
  const showDisappointed = status === 'denied' && !retryBusy;
  const capture = layout.captureButton;
  const childHole = layout.childHole;
  const parentHole = layout.parentHole;
  const blurPx = layout.ellipseBlur;
  const strokePx = layout.ellipseStroke;
  const childBadge = layout.childBadge;
  const parentBadge = layout.parentBadge;

  const badgeLayerStyle: CSSProperties = {
    ...fullBleedStyle,
    zIndex: 20,
  };

  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(
    () => () => {
      releaseCamera();
      if (previewUrlsRef.current?.child) URL.revokeObjectURL(previewUrlsRef.current.child);
      if (previewUrlsRef.current?.parent) URL.revokeObjectURL(previewUrlsRef.current.parent);
    },
    [releaseCamera],
  );

  useEffect(() => {
    if (!previewUrls) return;

    const fadeTimer = window.setTimeout(() => setPreviewFading(true), previewTiming.holdMs);
    const advanceTimer = window.setTimeout(() => {
      onPreviewCompleteRef.current?.();
    }, previewTiming.holdMs + previewTiming.fadeMs);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(advanceTimer);
    };
  }, [previewUrls, previewTiming.fadeMs, previewTiming.holdMs]);

  const handleRetryCamera = useCallback(async () => {
    setPreviewFading(false);
    setCapturing(false);
    capturedRef.current = false;

    if (previewUrlsRef.current?.child) URL.revokeObjectURL(previewUrlsRef.current.child);
    if (previewUrlsRef.current?.parent) URL.revokeObjectURL(previewUrlsRef.current.parent);
    previewUrlsRef.current = null;
    setPreviewUrls(null);

    setRetryBusy(true);
    try {
      releaseCamera();
      await requestCamera();
    } finally {
      setRetryBusy(false);
    }
  }, [releaseCamera, requestCamera]);

  const handleSkipDecline = useCallback(() => {
    releaseCamera();
    onSkipWithoutPhoto?.();
  }, [onSkipWithoutPhoto, releaseCamera]);

  const handleCapture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !useLiveCamera || capturing || capturedRef.current) return;

    setCapturing(true);
    try {
      const faces = await captureLiveSelfieFaces(video);
      releaseCamera();

      const childUrl = URL.createObjectURL(faces.childFace);
      const parentUrl = URL.createObjectURL(faces.parentFace);
      setPreviewUrls({ child: childUrl, parent: parentUrl });
      capturedRef.current = true;
      onFacesReady?.(faces);
    } finally {
      setCapturing(false);
    }
  }, [capturing, onFacesReady, releaseCamera, useLiveCamera, videoRef]);

  return (
    <FunnelStepRoot fitViewport className="overflow-hidden bg-v03-green-900" aria-label="סלפי עם דורי">
      <div className="pointer-events-none absolute z-0 bg-v03-green-900" style={fullBleedStyle} aria-hidden />

      <ChildSelfieStaticBackdrop />

      <ChildSelfieCameraViewport
        videoRef={bindVideoElement}
        streamActive={streamActive}
        onVideoReady={markVideoReady}
      />

      <ChildSelfieHoleLiveFeed
        videoRef={videoRef}
        videoReady={videoReady}
        childHole={childHole}
        parentHole={parentHole}
        active={useLiveCamera}
      />

      {previewUrls ? (
        <ChildSelfieCapturedFacesLayer
          childSrc={previewUrls.child}
          parentSrc={previewUrls.parent}
          childHole={childHole}
          parentHole={parentHole}
          fading={previewFading}
          fadeMs={previewTiming.fadeMs}
        />
      ) : null}

      <ChildSelfieFaceMask
        childHole={childHole}
        parentHole={parentHole}
        blur={layout.mask.blur}
        overlay={layout.mask.overlay}
        ringStroke={layout.mask.ringStroke}
        ringOpacity={layout.mask.ringOpacity}
        showFrost={showBlurredHoles}
        showRings={!showBlurredHoles}
      />

      {showBlurredHoles ? (
        <div className="pointer-events-none absolute z-[15]" style={fullBleedStyle} aria-hidden>
          <div className="relative" style={{ width: 375, height: 812 }}>
            <SelfieBlurredHole hole={parentHole} blurPx={blurPx} strokePx={strokePx} />
            <SelfieBlurredHole hole={childHole} blurPx={blurPx} strokePx={strokePx} />
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute" style={badgeLayerStyle}>
        <div className="relative" style={{ width: 375, height: 812 }}>
          <span
            className="inline-flex items-center justify-center bg-v03-green-700"
            style={{
              ...holeBadgeStyle(childHole),
              paddingLeft: childBadge.paddingX,
              paddingRight: childBadge.paddingX,
              paddingTop: childBadge.paddingY,
              paddingBottom: childBadge.paddingY,
              borderRadius: childBadge.borderRadius,
            }}
          >
            <span
              className="whitespace-nowrap text-center font-simpler font-bold text-white"
              style={{ fontSize: childBadge.fontSize }}
            >
              {childName}
            </span>
          </span>

          <span
            className="inline-flex items-center justify-center bg-v03-green-700"
            style={{
              ...holeBadgeStyle(parentHole),
              paddingLeft: parentBadge.paddingX,
              paddingRight: parentBadge.paddingX,
              paddingTop: parentBadge.paddingY,
              paddingBottom: parentBadge.paddingY,
              borderRadius: parentBadge.borderRadius,
            }}
          >
            <span
              className="whitespace-nowrap text-center font-simpler font-bold text-white"
              style={{ fontSize: parentBadge.fontSize }}
            >
              {parentLabel}
            </span>
          </span>
        </div>
      </div>

      {showDisappointed ? (
        <ChildSelfieCameraDeniedOverlay
          onRetry={() => void handleRetryCamera()}
          onDecline={handleSkipDecline}
          busy={retryBusy}
        />
      ) : null}

      {useLiveCamera && !previewUrls ? (
        <FunnelStepForeground
          fitViewport
          distribution="between"
          padTopPx={0}
          padBottomPx={Math.max(24, Math.round(34 * scale))}
          className="pointer-events-none !px-0"
        >
          <div aria-hidden />
          <FunnelStepSection className="pointer-events-auto flex flex-col items-center gap-3 px-v03-gutter">
            <button
              type="button"
              onClick={() => void handleCapture()}
              disabled={capturing}
              className="mx-auto flex w-full max-w-v03-content cursor-pointer touch-manipulation items-center justify-center rounded-[22px] bg-v03-turquoise-300 font-simpler text-[18px] font-bold leading-[1.2] text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70"
              style={{
                maxWidth: capture.width,
                height: capture.height,
                padding: `${capture.paddingY}px ${capture.paddingX}px`,
                gap: capture.gap,
              }}
              aria-label={CHILD_SELFIE_PATTERN_CAPTURE_LABEL}
            >
              <span className="inline-flex items-center gap-2" dir="rtl">
                <span>{CHILD_SELFIE_PATTERN_CAPTURE_LABEL}</span>
                <ChildSelfieCaptureCameraIcon size={18} />
              </span>
            </button>
          </FunnelStepSection>
        </FunnelStepForeground>
      ) : null}
    </FunnelStepRoot>
  );
}
