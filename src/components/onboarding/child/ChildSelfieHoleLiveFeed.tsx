'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { SelfieFaceHole } from '@/components/onboarding/child/ChildSelfieFaceMask';
import { useSelfieCoverLayout } from '@/components/onboarding/child/useSelfieCoverLayout';
import { drawMirroredCoverVideo } from '@/lib/onboarding/drawSelfieCoverVideo';
import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';

type ChildSelfieHoleLiveFeedProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  videoReady: boolean;
  childHole: SelfieFaceHole;
  parentHole: SelfieFaceHole;
  active: boolean;
};

function paintHole(
  target: HTMLCanvasElement,
  source: HTMLCanvasElement,
  hole: SelfieFaceHole,
) {
  const diameter = Math.round(hole.r * 2);
  const ctx = target.getContext('2d');
  if (!ctx) return;

  const holeLeft = hole.cx - hole.r;
  const holeTop = hole.cy - hole.r;
  ctx.clearRect(0, 0, diameter, diameter);
  ctx.drawImage(source, holeLeft, holeTop, diameter, diameter, 0, 0, diameter, diameter);
}

/**
 * Circular live previews — canvas copies from a hidden full-bleed frame buffer.
 * Works on Android where SVG-masked video/castle layers fail to reveal the stream.
 */
export function ChildSelfieHoleLiveFeed({
  videoRef,
  videoReady,
  childHole,
  parentHole,
  active,
}: ChildSelfieHoleLiveFeedProps) {
  const { coverStyle, artboardStyle } = useSelfieCoverLayout();
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const parentCanvasRef = useRef<HTMLCanvasElement>(null);
  const childCanvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!active || !videoReady || !video) return;

    const source = sourceCanvasRef.current;
    const parentCanvas = parentCanvasRef.current;
    const childCanvas = childCanvasRef.current;
    if (!source || !parentCanvas || !childCanvas) return;

    const ctx = source.getContext('2d');
    if (!ctx) return;

    const paint = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        ctx.clearRect(0, 0, V03_SCREEN_WIDTH, V03_SCREEN_HEIGHT);
        drawMirroredCoverVideo(ctx, video);
        paintHole(parentCanvas, source, parentHole);
        paintHole(childCanvas, source, childHole);
      }
      frameRef.current = window.requestAnimationFrame(paint);
    };

    paint();

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [active, childHole, parentHole, videoReady, videoRef]);

  if (!active) return null;

  const parentDiameter = Math.round(parentHole.r * 2);
  const childDiameter = Math.round(childHole.r * 2);

  return (
    <div className="pointer-events-none absolute z-[4]" style={coverStyle} aria-hidden>
      <canvas
        ref={sourceCanvasRef}
        width={V03_SCREEN_WIDTH}
        height={V03_SCREEN_HEIGHT}
        className="absolute opacity-0"
        aria-hidden
      />
      <div className="relative" style={artboardStyle}>
        <canvas
          ref={parentCanvasRef}
          width={parentDiameter}
          height={parentDiameter}
          className="absolute rounded-full"
          style={{
            left: parentHole.cx - parentHole.r,
            top: parentHole.cy - parentHole.r,
            width: parentDiameter,
            height: parentDiameter,
          }}
        />
        <canvas
          ref={childCanvasRef}
          width={childDiameter}
          height={childDiameter}
          className="absolute rounded-full"
          style={{
            left: childHole.cx - childHole.r,
            top: childHole.cy - childHole.r,
            width: childDiameter,
            height: childDiameter,
          }}
        />
      </div>
    </div>
  );
}
