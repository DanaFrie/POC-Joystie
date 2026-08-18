'use client';

import { createContext, useContext, type CSSProperties } from 'react';
import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';

export type FunnelViewportMetrics = {
  scale: number;
  offsetX: number;
  offsetY: number;
  /** Logical funnel width before `scale` (375 on contain/cover; grows on wide phones in `width` mode). */
  designWidth: number;
  viewportWidth: number;
  viewportHeight: number;
  /** `scroll` mode — canvas taller than usable viewport (enable page scroll). */
  needsVerticalScroll: boolean;
  /** Canvas px visible in viewport @ scale 1 — min(812, usableHeight / scale). */
  usableCanvasHeightPx: number;
  /** Logical canvas height (812 or compact `--v03-active-canvas-height`). */
  canvasHeightPx: number;
};

const DEFAULT_METRICS: FunnelViewportMetrics = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  designWidth: V03_SCREEN_WIDTH,
  viewportWidth: V03_SCREEN_WIDTH,
  viewportHeight: 812,
  needsVerticalScroll: false,
  usableCanvasHeightPx: V03_SCREEN_HEIGHT,
  canvasHeightPx: V03_SCREEN_HEIGHT,
};

type FunnelViewportContextValue = {
  isDesktop: boolean;
  metrics: FunnelViewportMetrics;
  /** False until first `useLayoutEffect` viewport measure — avoids scale flash on mount. */
  layoutReady: boolean;
};

const FunnelViewportContext = createContext<FunnelViewportContextValue>({
  isDesktop: false,
  metrics: DEFAULT_METRICS,
  layoutReady: false,
});

export function FunnelViewportProvider({
  isDesktop,
  metrics = DEFAULT_METRICS,
  layoutReady = false,
  children,
}: {
  isDesktop: boolean;
  metrics?: FunnelViewportMetrics;
  layoutReady?: boolean;
  children: React.ReactNode;
}) {
  return (
    <FunnelViewportContext.Provider value={{ isDesktop, metrics, layoutReady }}>
      {children}
    </FunnelViewportContext.Provider>
  );
}

/** True when viewport ≥ desktop breakpoint (onboarding shows grid-only). */
export function useFunnelDesktop() {
  return useContext(FunnelViewportContext).isDesktop;
}

export function useFunnelViewportMetrics() {
  return useContext(FunnelViewportContext).metrics;
}

/** True after the first viewport measure — gate portaled layers that use funnel metrics. */
export function useFunnelLayoutReady() {
  return useContext(FunnelViewportContext).layoutReady;
}

/** Scale a Figma Y coordinate to the visible canvas height (812 @ full, less on SE). */
export function funnelProportionalTopPx(
  figmaTopPx: number,
  usableCanvasHeightPx: number
): number {
  return (figmaTopPx / V03_SCREEN_HEIGHT) * usableCanvasHeightPx;
}

/** Scale a Figma Y coordinate to the visible canvas height (812 @ full, less on SE). */
export function useFunnelProportionalTopPx(figmaTopPx: number): number {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  return funnelProportionalTopPx(figmaTopPx, usableCanvasHeightPx);
}

/**
 * Expand a top hero into funnel letterbox gaps (contain scaling).
 * Returns canvas-space absolute position + size covering viewport width and top bleed.
 */
export function useFunnelHeroBleed(baseHeightPx: number): CSSProperties {
  const { bleedX, bleedY, width } = useFunnelHeroBleedInsets();

  return {
    position: 'absolute',
    top: -bleedY,
    left: -bleedX,
    width,
    height: baseHeightPx + bleedY,
  };
}

/** Canvas-space letterbox insets for bleed layers (heroes, ellipses, footer blur). */
export function useFunnelHeroBleedInsets() {
  const { scale, offsetX, offsetY, designWidth, viewportHeight, canvasHeightPx } =
    useFunnelViewportMetrics();
  const bleedX = offsetX / scale;
  const bleedY = offsetY / scale;
  const width = designWidth;
  const scaledH = canvasHeightPx * scale;
  const bottomBleed = Math.max(0, (viewportHeight - offsetY - scaledH) / scale);

  return { bleedX, bleedY, width, bottomBleed };
}

/** Full-width footer / bar backdrop — spans viewport including side + bottom letterbox. */
export function useFunnelBleedBarStyle(shellTopPx: number): CSSProperties {
  const { bleedX, width, bottomBleed } = useFunnelHeroBleedInsets();

  return {
    position: 'absolute',
    top: shellTopPx,
    left: -bleedX,
    width,
    bottom: -bottomBleed,
  };
}

/** Bottom-anchored frosted bar — for overlay footers on fitViewport scroll steps. */
export function useFunnelBleedBarBottomStyle(shellHeightPx: number): CSSProperties {
  const { bleedX, width, bottomBleed } = useFunnelHeroBleedInsets();

  return {
    position: 'absolute',
    bottom: -bottomBleed,
    left: -bleedX,
    width,
    height: shellHeightPx,
  };
}

/** Fill letterbox gaps (contain scaling) — reveal light funnel background. */
export function useFunnelFullBleed(): CSSProperties {
  const { scale, offsetX, offsetY, viewportHeight, canvasHeightPx } =
    useFunnelViewportMetrics();
  const bleedX = offsetX / scale;
  const bleedY = offsetY / scale;
  const scaledH = canvasHeightPx * scale;
  const bottomBleed = Math.max(0, (viewportHeight - offsetY - scaledH) / scale);

  return {
    position: 'absolute',
    top: -bleedY,
    left: -bleedX,
    right: -bleedX,
    bottom: -bottomBleed,
  };
}
