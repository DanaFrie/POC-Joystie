import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';

/**
 * Zoom-out vs object-cover so faces sit smaller in the castle holes and
 * parent + child can position themselves more easily.
 */
export const SELFIE_COVER_ZOOM_OUT = 0.82;

/** object-cover + mirror into the 375×812 funnel canvas (slightly zoomed out). */
export function drawMirroredCoverVideo(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  destWidth = V03_SCREEN_WIDTH,
  destHeight = V03_SCREEN_HEIGHT,
  zoomOut = SELFIE_COVER_ZOOM_OUT,
) {
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  if (!sourceWidth || !sourceHeight) return;

  const coverScale = Math.max(destWidth / sourceWidth, destHeight / sourceHeight);
  const scale = coverScale * Math.min(1, Math.max(0.5, zoomOut));
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (destWidth - width) / 2;
  const y = (destHeight - height) / 2;

  ctx.save();
  ctx.fillStyle = '#061C1E';
  ctx.fillRect(0, 0, destWidth, destHeight);
  ctx.translate(destWidth, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, sourceWidth, sourceHeight, x, y, width, height);
  ctx.restore();
}
