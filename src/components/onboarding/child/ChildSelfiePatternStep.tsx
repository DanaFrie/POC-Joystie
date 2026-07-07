'use client';

import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildSelfieCameraDeniedOverlay } from '@/components/onboarding/child/ChildSelfieCameraDeniedOverlay';
import { ChildSelfieCastleFrameOverlay } from '@/components/onboarding/child/ChildSelfieCastleFrameOverlay';
import { ChildSelfieFaceMask } from '@/components/onboarding/child/ChildSelfieFaceMask';
import type { SelfieFaceHole } from '@/components/onboarding/child/ChildSelfieFaceMask';
import {
  FunnelStepForeground,
  FunnelStepRoot,
  FunnelStepSection,
} from '@/components/ui/funnel-layout';
import {
  useFunnelBleedBarStyle,
  useFunnelFullBleed,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
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
  CHILD_SHARED_PHOTO_SKIP_LABEL,
} from '@/lib/onboarding/childPostGameCopy';
import { resolveParentCourtLabel } from '@/lib/onboarding/childBondingLabels';

function holeBadgeStyle(
  hole: SelfieFaceHole,
  scale: number,
  canvasOffsetX: number,
  compactLiftPx: number,
): CSSProperties {
  return {
    left: canvasOffsetX + hole.cx * scale,
    top: (hole.cy - hole.r - 14) * scale - compactLiftPx,
    transform: 'translateX(-50%)',
  };
}

function SelfieEllipse({
  sizePx,
  blurPx,
  strokePx,
  className = '',
  style,
}: {
  sizePx: number;
  blurPx: number;
  strokePx: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded-full bg-white/20 outline outline-white backdrop-blur-[27px] ${className}`}
      style={{
        width: sizePx,
        height: sizePx,
        outlineWidth: strokePx,
        outlineOffset: -strokePx,
        backdropFilter: `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
        ...style,
      }}
      aria-hidden
    />
  );
}

function SelfieLiveHoleVideo({
  stream,
  hole,
  scale,
  canvasOffsetX,
  compactLiftPx = 0,
}: {
  stream: MediaStream | null;
  hole: SelfieFaceHole;
  scale: number;
  canvasOffsetX: number;
  compactLiftPx?: number;
}) {
  const holeVideoRef = useRef<HTMLVideoElement>(null);
  const diameter = hole.r * 2 * scale;

  useEffect(() => {
    const video = holeVideoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    void video.play().catch(() => {
      /* autoplay blocked */
    });
  }, [stream]);

  return (
    <div
      className="pointer-events-none absolute z-[3] overflow-hidden rounded-full"
      style={{
        width: diameter,
        height: diameter,
        left: canvasOffsetX + hole.cx * scale - hole.r * scale,
        top: hole.cy * scale - hole.r * scale - compactLiftPx,
      }}
      aria-hidden
    >
      <video
        ref={holeVideoRef}
        playsInline
        muted
        autoPlay
        className="size-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
    </div>
  );
}

function SelfieCapturedFace({
  src,
  hole,
  scale,
  canvasOffsetX,
}: {
  src: string;
  hole: SelfieFaceHole;
  scale: number;
  canvasOffsetX: number;
}) {
  const diameter = hole.r * 2 * scale;

  return (
    <div
      className="pointer-events-none absolute overflow-hidden rounded-full"
      style={{
        width: diameter,
        height: diameter,
        left: canvasOffsetX + hole.cx * scale - hole.r * scale,
        top: hole.cy * scale - hole.r * scale,
      }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-full object-cover" />
    </div>
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

/** Mission 3 — blurred holes → live camera fill → 3s still → loader. */
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
  const coverStyle = useFunnelBleedBarStyle(0);
  const fullBleedStyle = useFunnelFullBleed();
  const { usableCanvasHeightPx, offsetX } = useFunnelViewportMetrics();
  const scale = usableCanvasHeightPx / 812;
  const compactLiftPx =
    usableCanvasHeightPx < 700 ? Math.round((700 - usableCanvasHeightPx) * 0.4) : 0;
  const canvasOffsetX = offsetX;
  const parentLabel = resolveParentCourtLabel(parentGender, parentName);
  const { videoRef, status, stream, requestCamera, releaseCamera } = useSelfieCameraStream();
  const [previewUrls, setPreviewUrls] = useState<{ child: string; parent: string } | null>(null);
  const [previewFading, setPreviewFading] = useState(false);
  const [showSkipCard, setShowSkipCard] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [retryBusy, setRetryBusy] = useState(false);
  const capturedRef = useRef(false);
  const previewUrlsRef = useRef<{ child: string; parent: string } | null>(null);
  const onPreviewCompleteRef = useRef(onPreviewComplete);

  onPreviewCompleteRef.current = onPreviewComplete;

  const useLiveCamera = status === 'active' && !previewUrls;
  const showBlurredHoles = !useLiveCamera && !previewUrls;
  const showDisappointed = status === 'denied' || showSkipCard;
  const capture = layout.captureButton;
  const cameraFrame = layout.cameraFrame;
  const childHole = layout.childHole;
  const parentHole = layout.parentHole;
  const ellipseSizePx = layout.ellipseSize * scale;
  const blurPx = layout.ellipseBlur * scale;
  const strokePx = layout.ellipseStroke * scale;
  const childBadge = layout.childBadge;
  const parentBadge = layout.parentBadge;
  const frameWidthPx = cameraFrame.width * scale;
  const frameHeightPx = cameraFrame.height * scale;
  const frameLeftPx = canvasOffsetX + cameraFrame.left * scale;
  const frameTopPx = cameraFrame.top * scale - compactLiftPx;
  const childEllipseTopPx =
    ((cameraFrame.height - layout.ellipseSize) / 2) * scale;

  useEffect(() => {
    void requestCamera();
  }, [requestCamera]);

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
    setShowSkipCard(false);
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
      <div
        className="pointer-events-none absolute z-0 bg-v03-green-900"
        style={fullBleedStyle}
        aria-hidden
      />
      <OnboardingLazyImage
        src={CHILD_ONBOARDING_ASSETS.castleDoriSelfie}
        alt=""
        className="pointer-events-none absolute z-0 object-cover"
        style={{ ...coverStyle, objectPosition: 'center bottom' }}
        priority
      />

      {useLiveCamera ? (
        <>
          <video ref={videoRef} playsInline muted autoPlay className="sr-only" aria-hidden tabIndex={-1} />
          <SelfieLiveHoleVideo
            stream={stream}
            hole={layout.childHole}
            scale={scale}
            canvasOffsetX={canvasOffsetX}
            compactLiftPx={compactLiftPx}
          />
          <SelfieLiveHoleVideo
            stream={stream}
            hole={layout.parentHole}
            scale={scale}
            canvasOffsetX={canvasOffsetX}
            compactLiftPx={compactLiftPx}
          />
          <ChildSelfieCastleFrameOverlay
            src={CHILD_ONBOARDING_ASSETS.castleDoriSelfie}
            childHole={layout.childHole}
            parentHole={layout.parentHole}
          />
        </>
      ) : (
        <video ref={videoRef} playsInline muted className="sr-only" aria-hidden tabIndex={-1} />
      )}

      {previewUrls ? (
        <div
          className="pointer-events-none absolute inset-0 z-[4]"
          style={{
            opacity: previewFading ? 0 : 1,
            transition: `opacity ${previewTiming.fadeMs}ms ease-out`,
          }}
        >
          <ChildSelfieCastleFrameOverlay
            src={CHILD_ONBOARDING_ASSETS.castleDoriSelfie}
            childHole={layout.childHole}
            parentHole={layout.parentHole}
          />
          <SelfieCapturedFace
            src={previewUrls.child}
            hole={layout.childHole}
            scale={scale}
            canvasOffsetX={canvasOffsetX}
          />
          <SelfieCapturedFace
            src={previewUrls.parent}
            hole={layout.parentHole}
            scale={scale}
            canvasOffsetX={canvasOffsetX}
          />
        </div>
      ) : null}

      <ChildSelfieFaceMask
        childHole={layout.childHole}
        parentHole={layout.parentHole}
        blur={layout.mask.blur}
        overlay={layout.mask.overlay}
        ringStroke={layout.mask.ringStroke}
        ringOpacity={layout.mask.ringOpacity}
        showFrost={!useLiveCamera && !previewUrls}
        showRings={!showBlurredHoles}
      />

      {showBlurredHoles ? (
        <div
          className="pointer-events-none absolute z-[15]"
          style={{
            top: frameTopPx,
            left: frameLeftPx,
            width: frameWidthPx,
            height: frameHeightPx,
          }}
          aria-hidden
        >
          <SelfieEllipse
            sizePx={ellipseSizePx}
            blurPx={blurPx}
            strokePx={strokePx}
            className="absolute"
            style={{
              left: layout.childEllipse.left * scale,
              top: childEllipseTopPx,
            }}
          />
          <SelfieEllipse
            sizePx={ellipseSizePx}
            blurPx={blurPx}
            strokePx={strokePx}
            className="absolute"
            style={{
              right: layout.parentEllipse.right * scale,
              top: layout.parentEllipse.top * scale,
            }}
          />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-20">
        <span
          className="absolute inline-flex items-center justify-center bg-v03-green-700"
          style={{
            ...holeBadgeStyle(childHole, scale, canvasOffsetX, compactLiftPx),
            paddingLeft: childBadge.paddingX * scale,
            paddingRight: childBadge.paddingX * scale,
            paddingTop: childBadge.paddingY * scale,
            paddingBottom: childBadge.paddingY * scale,
            borderRadius: childBadge.borderRadius * scale,
          }}
        >
          <span
            className="whitespace-nowrap text-center font-simpler font-bold text-white"
            style={{ fontSize: childBadge.fontSize * scale }}
          >
            {childName}
          </span>
        </span>

        <span
          className="absolute inline-flex items-center justify-center bg-v03-green-700"
          style={{
            ...holeBadgeStyle(parentHole, scale, canvasOffsetX, compactLiftPx),
            paddingLeft: parentBadge.paddingX * scale,
            paddingRight: parentBadge.paddingX * scale,
            paddingTop: parentBadge.paddingY * scale,
            paddingBottom: parentBadge.paddingY * scale,
            borderRadius: parentBadge.borderRadius * scale,
          }}
        >
          <span
            className="whitespace-nowrap text-center font-simpler font-bold text-white"
            style={{ fontSize: parentBadge.fontSize * scale }}
          >
            {parentLabel}
          </span>
        </span>
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
            {onSkipWithoutPhoto ? (
              <button
                type="button"
                onClick={() => setShowSkipCard(true)}
                className="font-simpler text-[14px] font-normal leading-[17.5px] tracking-[-0.21px] text-white/80 underline decoration-solid underline-offset-2"
              >
                {CHILD_SHARED_PHOTO_SKIP_LABEL}
              </button>
            ) : null}
          </FunnelStepSection>
        </FunnelStepForeground>
      ) : null}
    </FunnelStepRoot>
  );
}
