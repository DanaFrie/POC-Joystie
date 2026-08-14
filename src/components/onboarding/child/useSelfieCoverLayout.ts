'use client';

import type { CSSProperties } from 'react';
import {
  useFunnelFullBleed,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
import { CHILD_SELFIE_ARTBOARD } from '@/components/onboarding/child/childSelfieArtboard';
import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';

/**
 * 100vh cover — pair with `FunnelStepRoot fillViewport` so canvas height ===
 * viewport on every resolution. Artboard uses uniform object-cover so castle
 * + holes stay aligned while filling the viewport.
 */
export function useSelfieCoverLayout(): {
  coverStyle: CSSProperties;
  artboardStyle: CSSProperties;
} {
  const coverStyle = useFunnelFullBleed();
  const { designWidth, scale, viewportHeight, canvasHeightPx } =
    useFunnelViewportMetrics();

  const coverWidth =
    typeof coverStyle.width === 'number' ? coverStyle.width : designWidth;
  // Always at least one viewport tall in canvas space (100vh).
  const viewportCanvasHeight = viewportHeight / Math.max(scale, 0.0001);
  const coverHeight = Math.max(
    typeof coverStyle.height === 'number' ? coverStyle.height : canvasHeightPx,
    viewportCanvasHeight
  );

  const coverScale = Math.max(
    coverWidth / V03_SCREEN_WIDTH,
    coverHeight / V03_SCREEN_HEIGHT
  );
  const scaledW = V03_SCREEN_WIDTH * coverScale;
  const scaledH = V03_SCREEN_HEIGHT * coverScale;

  const artboardStyle: CSSProperties = {
    position: 'absolute',
    left: (coverWidth - scaledW) / 2,
    top: (coverHeight - scaledH) / 2,
    width: CHILD_SELFIE_ARTBOARD.width,
    height: CHILD_SELFIE_ARTBOARD.height,
    transform: `scale(${coverScale})`,
    transformOrigin: 'top left',
  };

  return {
    coverStyle: {
      ...coverStyle,
      top: 0,
      left: 0,
      width: coverWidth,
      height: coverHeight,
    },
    artboardStyle,
  };
}
