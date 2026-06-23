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
};

const DEFAULT_METRICS: FunnelViewportMetrics = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  designWidth: V03_SCREEN_WIDTH,
  viewportWidth: V03_SCREEN_WIDTH,
  viewportHeight: 812,
};

type FunnelViewportContextValue = {
  isDesktop: boolean;
  metrics: FunnelViewportMetrics;
};

const FunnelViewportContext = createContext<FunnelViewportContextValue>({
  isDesktop: false,
  metrics: DEFAULT_METRICS,
});

export function FunnelViewportProvider({
  isDesktop,
  metrics = DEFAULT_METRICS,
  children,
}: {
  isDesktop: boolean;
  metrics?: FunnelViewportMetrics;
  children: React.ReactNode;
}) {
  return (
    <FunnelViewportContext.Provider value={{ isDesktop, metrics }}>
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
  const { scale, offsetX, offsetY, designWidth, viewportHeight } =
    useFunnelViewportMetrics();
  const bleedX = offsetX / scale;
  const bleedY = offsetY / scale;
  const width = designWidth;
  const scaledH = V03_SCREEN_HEIGHT * scale;
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

/** Fill letterbox gaps (contain scaling) — reveal light funnel background. */
export function useFunnelFullBleed(): CSSProperties {
  const { scale, offsetX, offsetY, designWidth, viewportHeight } =
    useFunnelViewportMetrics();
  const bleedX = offsetX / scale;
  const bleedY = offsetY / scale;
  const width = designWidth;
  const scaledH = V03_SCREEN_HEIGHT * scale;
  const bottomBleed = Math.max(0, (viewportHeight - offsetY - scaledH) / scale);

  return {
    position: 'absolute',
    top: -bleedY,
    left: -bleedX,
    width,
    height: V03_SCREEN_HEIGHT + bleedY + bottomBleed,
  };
}
