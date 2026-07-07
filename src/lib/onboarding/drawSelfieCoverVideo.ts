import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';

/** object-cover + mirror into the 375×812 funnel canvas. */
export function drawMirroredCoverVideo(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  destWidth = V03_SCREEN_WIDTH,
  destHeight = V03_SCREEN_HEIGHT,
) {
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  if (!sourceWidth || !sourceHeight) return;

  const scale = Math.max(destWidth / sourceWidth, destHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (destWidth - width) / 2;
  const y = (destHeight - height) / 2;

  ctx.save();
  ctx.translate(destWidth, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, sourceWidth, sourceHeight, x, y, width, height);
  ctx.restore();
}
