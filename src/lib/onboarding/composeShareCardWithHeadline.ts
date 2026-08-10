/**
 * Bake share-step overlay onto the selfie before Storage / native share.
 * Matches ChildSharedPhotoShareStep + ChildSharedPhotoBackdrop:
 * - 375×812 artboard
 * - photo object-fit: cover; object-position: center bottom
 * - Rubik black headline + letter-spacing + text-shadow
 * - same scribble SVG (blob URL — data: URLs truncate the 50KB path)
 * - Joystie wordmark (dark tone)
 */

import { CHILD_SHARED_PHOTO_SHARE } from '@/constants/child-post-game-layout';
import { SHARE_HEADLINE_SCRIBBLE_PATH } from '@/constants/share-headline-scribble-path';
import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';
import {
  CHILD_SHARED_PHOTO_SHARE_HEADLINE_EMPHASIS,
  CHILD_SHARED_PHOTO_SHARE_HEADLINE_PREFIX,
} from '@/lib/onboarding/childPostGameCopy';

const LINE_HEIGHT_PX = 44;
const OUTPUT_SCALE = 3;
const LOGO_VIEWBOX_W = 161;
const LOGO_VIEWBOX_H = 78;
const SCRIBBLE_VIEWBOX_W = 257;
const SCRIBBLE_VIEWBOX_H = 27;

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load share image'));
    };
    img.src = url;
  });
}

function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load share image'));
    img.src = src;
  });
}

/** Prefer Blob URLs — encodeURIComponent data: URLs break the large scribble path. */
function loadSvgBlobAsImage(svgXml: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG layer'));
    };
    img.src = url;
  });
}

function resolveRubikFamily(): string {
  if (typeof document === 'undefined') return 'Rubik, sans-serif';
  const fromVar = getComputedStyle(document.documentElement)
    .getPropertyValue('--font-rubik')
    .trim();
  // next/font sets --font-rubik to the hashed family name (no quotes).
  if (fromVar) return `${fromVar}, Rubik, sans-serif`;
  return 'Rubik, sans-serif';
}

async function ensureRubikReady(fontSizePx: number, family: string): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load(`800 ${fontSizePx}px ${family}`),
      document.fonts.load(`900 ${fontSizePx}px ${family}`),
      document.fonts.load(`800 ${fontSizePx}px Rubik`),
      document.fonts.load(`900 ${fontSizePx}px Rubik`),
    ]);
    await document.fonts.ready;
  } catch {
    // System fallback.
  }
}

function drawImageCoverCenterBottom(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  destW: number,
  destH: number
): void {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const srcRatio = srcW / srcH;
  const destRatio = destW / destH;

  let sw: number;
  let sh: number;
  let sx: number;
  let sy: number;

  if (srcRatio > destRatio) {
    sh = srcH;
    sw = sh * destRatio;
    sx = (srcW - sw) / 2;
    sy = 0;
  } else {
    sw = srcW;
    sh = sw / destRatio;
    sx = 0;
    sy = Math.max(0, srcH - sh);
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, destW, destH);
}

function buildScribbleSvg(width: number, height: number, strokeWidth: number): string {
  // Match ChildSharedPhotoShareUnderline — stroke in CSS px (non-scaling).
  // Pad view so overflow stroke is not clipped when rasterized.
  const pad = strokeWidth;
  const totalW = width + pad * 2;
  const totalH = height + pad * 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" fill="none">
  <svg x="${pad}" y="${pad}" width="${width}" height="${height}" viewBox="0 0 ${SCRIBBLE_VIEWBOX_W} ${SCRIBBLE_VIEWBOX_H}" fill="none" preserveAspectRatio="none" overflow="visible">
    <path d="${SHARE_HEADLINE_SCRIBBLE_PATH}" fill="#00FFB3" stroke="#00FFB3" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>
</svg>`;
}

function buildLogoSvg(width: number): string {
  const height = (width * LOGO_VIEWBOX_H) / LOGO_VIEWBOX_W;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO_VIEWBOX_W} ${LOGO_VIEWBOX_H}" width="${width}" height="${height}" fill="none">
<path d="M10.952 48.9243C8.94503 48.9243 7.09014 48.529 5.38728 47.7384C3.88599 47.0287 2.61747 46.0372 1.58173 44.7639C1.3719 44.506 1.38237 44.1372 1.5915 43.8787L3.91476 41.0069C4.21924 40.6305 4.79836 40.6498 5.10908 41.0211C6.71933 42.945 8.60614 43.9069 10.7695 43.9069C14.1448 43.9069 15.8325 41.9456 15.8325 38.023V16.9501H5.1612C4.75705 16.9501 4.42943 16.6225 4.42943 16.2184V12.7102C4.42943 12.306 4.75705 11.9784 5.1612 11.9784H20.9847C21.3888 11.9784 21.7164 12.306 21.7164 12.7102V37.7037C21.7164 41.4439 20.8042 44.2414 18.9797 46.0963C17.1552 47.9816 14.4793 48.9243 10.952 48.9243Z" fill="#092125"/>
<path d="M38.1557 44.2262C35.6927 44.2262 33.4729 43.6941 31.4963 42.6298C29.5198 41.5655 27.969 40.0907 26.8439 38.2054C25.7492 36.2897 25.2019 34.1307 25.2019 31.7285C25.2019 29.3262 25.7492 27.1825 26.8439 25.2972C27.969 23.4119 29.5198 21.9371 31.4963 20.8728C33.4729 19.8085 35.6927 19.2764 38.1557 19.2764C40.6492 19.2764 42.8842 19.8085 44.8607 20.8728C46.8372 21.9371 48.3728 23.4119 49.4675 25.2972C50.5926 27.1825 51.1552 29.3262 51.1552 31.7285C51.1552 34.1307 50.5926 36.2897 49.4675 38.2054C48.3728 40.0907 46.8372 41.5655 44.8607 42.6298C42.8842 43.6941 40.6492 44.2262 38.1557 44.2262ZM38.1557 39.3457C40.2539 39.3457 41.9871 38.6463 43.3555 37.2476C44.7239 35.8488 45.4081 34.0091 45.4081 31.7285C45.4081 29.4479 44.7239 27.6082 43.3555 26.2094C41.9871 24.8106 40.2539 24.1113 38.1557 24.1113C36.0576 24.1113 34.3243 24.8106 32.9559 26.2094C31.618 27.6082 30.949 29.4479 30.949 31.7285C30.949 34.0091 31.618 35.8488 32.9559 37.2476C34.3243 38.6463 36.0576 39.3457 38.1557 39.3457Z" fill="#092125"/>
<path d="M77.1764 19.55C77.5805 19.55 77.9082 19.8777 77.9082 20.2818V40.2124C77.9082 48.7874 73.6966 53.075 65.2736 53.075C63.0538 53.075 60.9252 52.7709 58.8879 52.1628C57.1178 51.6532 55.6198 50.9307 54.3938 49.9954C54.1111 49.7798 54.0489 49.3857 54.2308 49.0803L56.0266 46.0659C56.2586 45.6764 56.7849 45.5908 57.1541 45.8539C58.046 46.4893 59.0801 47.011 60.2562 47.4191C61.7462 47.936 63.3123 48.1945 64.9543 48.1945C67.4478 48.1945 69.2723 47.5863 70.4278 46.37C71.6137 45.1841 72.2066 43.3444 72.2066 40.8509V39.7106C71.2944 40.7141 70.1845 41.4895 68.8769 42.0368C67.5694 42.5538 66.1554 42.8122 64.635 42.8122C61.3813 42.8122 58.8119 41.9152 56.9266 40.1211C55.0717 38.3271 54.1442 35.6359 54.1442 32.0478V20.2818C54.1442 19.8777 54.4718 19.55 54.876 19.55H59.114C59.5181 19.55 59.8457 19.8777 59.8457 20.2818V31.318C59.8457 33.477 60.3323 35.1038 61.3053 36.1985C62.3088 37.2628 63.7228 37.7949 65.5473 37.7949C67.5846 37.7949 69.1962 37.1715 70.3821 35.9248C71.5985 34.6781 72.2066 32.8688 72.2066 30.497V20.2818C72.2066 19.8777 72.5343 19.55 72.9384 19.55H77.1764Z" fill="#092125"/>
<path d="M90.6186 44.2262C88.6421 44.2262 86.7112 43.9678 84.8259 43.4508C83.2224 43.0112 81.8939 42.4725 80.8403 41.8349C80.5294 41.6467 80.4318 41.249 80.5957 40.9246L82.1274 37.8931C82.3254 37.5013 82.8208 37.372 83.2022 37.5893C84.1412 38.1243 85.2146 38.5729 86.4223 38.9352C87.9731 39.3609 89.4935 39.5738 90.9835 39.5738C94.3892 39.5738 96.0921 38.6767 96.0921 36.8827C96.0921 36.0312 95.6512 35.4383 94.7693 35.1038C93.9179 34.7693 92.5343 34.45 90.6186 34.1459C88.6117 33.8419 86.9697 33.4922 85.6925 33.0969C84.4458 32.7015 83.3511 32.0174 82.4084 31.0443C81.4962 30.0408 81.0401 28.6573 81.0401 26.8936C81.0401 24.5826 81.9979 22.7429 83.9136 21.3745C85.8598 19.9757 88.4749 19.2764 91.7589 19.2764C93.4314 19.2764 95.1038 19.474 96.7763 19.8693C98.1515 20.1694 99.3212 20.5619 100.285 21.047C100.628 21.2195 100.747 21.6396 100.574 21.9819L99.0438 25.0114C98.8532 25.3885 98.3845 25.5245 98.0082 25.3324C96.1152 24.3663 94.0169 23.8832 91.7133 23.8832C90.0409 23.8832 88.7637 24.1417 87.8819 24.6586C87.0305 25.1451 86.6048 25.7989 86.6048 26.6199C86.6048 27.5322 87.0609 28.1859 87.9731 28.5812C88.9158 28.9461 90.3602 29.2958 92.3063 29.6303C94.2524 29.9344 95.8488 30.2841 97.0956 30.6794C98.3423 31.0747 99.4066 31.7437 100.288 32.6863C101.201 33.629 101.657 34.967 101.657 36.7002C101.657 38.9808 100.669 40.8053 98.692 42.1737C96.7155 43.542 94.0243 44.2262 90.6186 44.2262Z" fill="#092125"/>
<path d="M117.775 42.0878C117.891 42.3836 117.806 42.7246 117.542 42.9019C116.96 43.2932 116.282 43.5978 115.507 43.8157C114.564 44.0894 113.561 44.2262 112.496 44.2262C109.821 44.2262 107.753 43.5268 106.293 42.1281C104.834 40.7293 104.104 38.6919 104.104 36.016V14.8996C104.104 14.4954 104.431 14.1678 104.836 14.1678H109.074C109.478 14.1678 109.805 14.4954 109.805 14.8996V19.7325H115.596C116 19.7325 116.328 20.0601 116.328 20.4643V23.5619C116.328 23.9661 116 24.2937 115.596 24.2937H109.805V35.8792C109.805 37.0651 110.094 37.9774 110.672 38.6159C111.28 39.2241 112.116 39.5282 113.181 39.5282C114.07 39.5282 114.856 39.3659 115.539 39.0415C115.982 38.8311 116.554 38.9837 116.733 39.4398L117.775 42.0878Z" fill="#092125"/>
<path d="M120.402 19.55H125.372C125.776 19.55 126.104 19.8777 126.104 20.2818V43.1752C126.104 43.5793 125.776 43.9069 125.372 43.9069H121.134C120.73 43.9069 120.402 43.5793 120.402 43.1752V19.55ZM123.276 15.5362C122.242 15.5362 121.375 15.2169 120.676 14.5783C119.976 13.9093 119.627 13.0883 119.627 12.1152C119.627 11.1422 119.976 10.3364 120.676 9.6978C121.375 9.02882 122.242 8.69434 123.276 8.69434C124.309 8.69434 125.176 9.01362 125.875 9.65219C126.575 10.2604 126.925 11.0358 126.925 11.9784C126.925 12.9819 126.575 13.8333 125.875 14.5327C125.206 15.2017 124.34 15.5362 123.276 15.5362Z" fill="#092125"/>
<path d="M142.892 39.3913C145.254 39.3913 147.265 38.688 148.924 37.2814C149.25 37.0058 149.742 37.0222 150.02 37.3458L152.118 39.7939C152.348 40.0626 152.356 40.4598 152.115 40.7196C151.115 41.8005 149.88 42.6349 148.411 43.2228C146.738 43.8917 144.853 44.2262 142.755 44.2262C140.079 44.2262 137.722 43.6941 135.685 42.6298C133.648 41.5655 132.066 40.0907 130.941 38.2054C129.847 36.2897 129.299 34.1307 129.299 31.7285C129.299 29.3567 129.831 27.2281 130.896 25.3428C131.99 23.4271 133.48 21.9371 135.366 20.8728C137.281 19.8085 139.44 19.2764 141.843 19.2764C144.123 19.2764 146.191 19.7781 148.046 20.7816C149.931 21.7546 151.421 23.1686 152.516 25.0235C153.52 26.6976 154.064 28.6405 154.147 30.8522C154.16 31.202 153.91 31.5033 153.567 31.5705L135.502 35.1038C136.08 36.5026 137.008 37.5668 138.285 38.2966C139.562 39.0264 141.098 39.3913 142.892 39.3913ZM141.843 23.8376C139.744 23.8376 138.042 24.5218 136.734 25.8901C135.457 27.2585 134.818 29.0982 134.818 31.4092V31.4548L148.593 28.8093C148.198 27.3193 147.392 26.1182 146.176 25.2059C144.99 24.2937 143.545 23.8376 141.843 23.8376Z" fill="#092125"/>
<path d="M8.38989 59.9259C10.7502 63.8575 19.6881 72.06 36.5569 73.4176C53.4257 74.7751 62.8004 68.0463 65.3792 64.5122" stroke="#1BECAE" stroke-width="6.31862" stroke-linecap="round"/>
</svg>`;
}

/**
 * Draw selfie (cover, bottom-aligned) + logo + RTL headline + mint scribble
 * in the same 375×812 layout as the share step overlay.
 */
export async function composeShareCardWithHeadline(
  source: Blob | string
): Promise<Blob> {
  const img =
    typeof source === 'string'
      ? await loadImageFromUrl(source)
      : await loadImageFromBlob(source);

  const unit = OUTPUT_SCALE;
  const width = V03_SCREEN_WIDTH * unit;
  const height = V03_SCREEN_HEIGHT * unit;

  const frame = CHILD_SHARED_PHOTO_SHARE.headline;
  const fontFamily = resolveRubikFamily();
  const fontSize = frame.fontSize * unit;
  await ensureRubikReady(fontSize, fontFamily);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.fillStyle = '#092125';
  ctx.fillRect(0, 0, width, height);
  drawImageCoverCenterBottom(ctx, img, width, height);

  // Logo — same as ChildSharedPhotoBackdrop.
  const logo = CHILD_SHARED_PHOTO_SHARE.logo;
  const logoImg = await loadSvgBlobAsImage(buildLogoSvg(logo.width * unit));
  ctx.drawImage(logoImg, logo.left * unit, logo.top * unit);

  const lineHeight = LINE_HEIGHT_PX * unit;
  const textCenterX = (frame.left + frame.width / 2) * unit;
  const textTop = frame.top * unit;

  ctx.save();
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  // font-black → 900 (falls back to 800 if unavailable).
  ctx.font = `900 ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.30)';
  ctx.shadowBlur = 10 * unit;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  if ('letterSpacing' in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${frame.letterSpacing * unit}px`;
  }

  ctx.fillText(CHILD_SHARED_PHOTO_SHARE_HEADLINE_PREFIX, textCenterX, textTop);
  ctx.fillText(
    CHILD_SHARED_PHOTO_SHARE_HEADLINE_EMPHASIS,
    textCenterX,
    textTop + lineHeight
  );
  ctx.restore();

  // Scribble — same SVG as UI, rasterized at output scale (blob URL, not data:).
  const underline = frame.underline;
  const scribblePad = underline.strokeWidth * unit;
  const scribbleImg = await loadSvgBlobAsImage(
    buildScribbleSvg(
      underline.width * unit,
      underline.height * unit,
      underline.strokeWidth * unit
    )
  );
  ctx.drawImage(
    scribbleImg,
    (frame.left + underline.left) * unit - scribblePad,
    (frame.top + underline.top) * unit - scribblePad
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode share card'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      0.92
    );
  });
}
