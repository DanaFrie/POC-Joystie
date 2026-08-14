'use client';

import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

type ChildSelfieCameraViewportProps = {
  videoRef: (node: HTMLVideoElement | null) => void;
  streamActive: boolean;
  onVideoReady?: () => void;
};

/** Hidden decode surface — live preview is painted into hole canvases. */
export function ChildSelfieCameraViewport({
  videoRef,
  streamActive,
  onVideoReady,
}: ChildSelfieCameraViewportProps) {
  const coverStyle = useFunnelFullBleed();

  if (!streamActive) return null;

  return (
    <div
      className="pointer-events-none absolute z-[1] overflow-hidden opacity-0"
      style={coverStyle}
      aria-hidden
    >
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 size-full object-cover object-center"
        onLoadedData={onVideoReady}
      />
    </div>
  );
}
