import type { SelfieFaceHole } from '@/components/onboarding/child/ChildSelfieFaceMask';
import { CHILD_SELFIE_PATTERN } from '@/constants/child-post-game-layout';
import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';

type ComposeChildSelfieFrameInput = {
  video: HTMLVideoElement | null;
  castleSrc: string;
  useLiveCamera: boolean;
  layout?: typeof CHILD_SELFIE_PATTERN;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: 'image/jpeg' | 'image/png' = 'image/jpeg',
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      type,
      quality,
    );
  });
}

function extractCircularFace(source: HTMLCanvasElement, hole: SelfieFaceHole): Promise<Blob> {
  const diameter = hole.r * 2;
  const canvas = document.createElement('canvas');
  canvas.width = diameter;
  canvas.height = diameter;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.beginPath();
  ctx.arc(hole.r, hole.r, hole.r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(
    source,
    hole.cx - hole.r,
    hole.cy - hole.r,
    diameter,
    diameter,
    0,
    0,
    diameter,
    diameter,
  );

  return canvasToBlob(canvas, 'image/png');
}

/** object-cover draw into the 375×812 funnel canvas. */
function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  destWidth: number,
  destHeight: number,
  mirror = false,
) {
  const scale = Math.max(destWidth / sourceWidth, destHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (destWidth - width) / 2;
  const y = (destHeight - height) / 2;

  ctx.save();
  if (mirror) {
    ctx.translate(destWidth, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, 0, 0, sourceWidth, sourceHeight, x, y, width, height);
  ctx.restore();
}

function clipOutsideFaceHoles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  holes: SelfieFaceHole[],
) {
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  for (const hole of holes) {
    ctx.moveTo(hole.cx + hole.r, hole.cy);
    ctx.arc(hole.cx, hole.cy, hole.r, 0, Math.PI * 2);
  }
  ctx.clip('evenodd');
}

function applyBlurredOverlay(
  ctx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  holes: SelfieFaceHole[],
  blur: number,
  overlay: string,
  width: number,
  height: number,
) {
  const blurred = document.createElement('canvas');
  blurred.width = width;
  blurred.height = height;
  const blurredCtx = blurred.getContext('2d');
  if (!blurredCtx) return;

  blurredCtx.filter = `blur(${blur}px)`;
  blurredCtx.drawImage(sourceCanvas, 0, 0);

  ctx.save();
  clipOutsideFaceHoles(ctx, width, height, holes);
  ctx.drawImage(blurred, 0, 0);
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawCastleOutsideHoles(
  ctx: CanvasRenderingContext2D,
  castle: HTMLImageElement,
  holes: SelfieFaceHole[],
  width: number,
  height: number,
) {
  ctx.save();
  clipOutsideFaceHoles(ctx, width, height, holes);
  drawCoverImage(ctx, castle, castle.naturalWidth, castle.naturalHeight, width, height);
  ctx.restore();
}

function drawHoleRings(
  ctx: CanvasRenderingContext2D,
  holes: SelfieFaceHole[],
  ringStroke: number,
  ringOpacity: number,
) {
  ctx.save();
  ctx.strokeStyle = `rgba(255, 255, 255, ${ringOpacity})`;
  ctx.lineWidth = ringStroke;
  for (const hole of holes) {
    ctx.beginPath();
    ctx.arc(hole.cx, hole.cy, hole.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** Live camera — circular child (left) + parent (right) face crops only. */
export async function captureLiveSelfieFaces(
  video: HTMLVideoElement,
  layout = CHILD_SELFIE_PATTERN,
): Promise<{ childFace: Blob; parentFace: Blob }> {
  const width = V03_SCREEN_WIDTH;
  const height = V03_SCREEN_HEIGHT;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  drawCoverImage(ctx, video, video.videoWidth, video.videoHeight, width, height, true);

  const [childFace, parentFace] = await Promise.all([
    extractCircularFace(canvas, layout.childHole),
    extractCircularFace(canvas, layout.parentHole),
  ]);

  return { childFace, parentFace };
}

/** Composite selfie scene + isolated circular face crops (child left, parent right). */
export type ChildSelfieCaptureResult = {
  frame: Blob;
  childFace: Blob;
  parentFace: Blob;
};

/** Composite the selfie scene as rendered — background, face holes, blur mask; no name badges. */
export async function composeChildSelfieCapture({
  video,
  castleSrc,
  useLiveCamera,
  layout = CHILD_SELFIE_PATTERN,
}: ComposeChildSelfieFrameInput): Promise<ChildSelfieCaptureResult> {
  const width = V03_SCREEN_WIDTH;
  const height = V03_SCREEN_HEIGHT;
  const holes = [layout.childHole, layout.parentHole];
  const { blur, overlay, ringStroke, ringOpacity } = layout.mask;
  const castle = await loadImage(castleSrc);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const hasLiveVideo =
    useLiveCamera && video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0;

  if (hasLiveVideo) {
    drawCoverImage(ctx, video, video.videoWidth, video.videoHeight, width, height, true);
    applyBlurredOverlay(ctx, canvas, holes, blur, overlay, width, height);
    drawCastleOutsideHoles(ctx, castle, holes, width, height);
  } else {
    drawCoverImage(ctx, castle, castle.naturalWidth, castle.naturalHeight, width, height);
    applyBlurredOverlay(ctx, canvas, holes, blur, overlay, width, height);
  }

  const [childFace, parentFace] = await Promise.all([
    extractCircularFace(canvas, layout.childHole),
    extractCircularFace(canvas, layout.parentHole),
  ]);

  drawHoleRings(ctx, holes, ringStroke, ringOpacity);

  const frame = await canvasToBlob(canvas);
  return { frame, childFace, parentFace };
}
