'use client';

import type { ReactNode } from 'react';
import { useCallback, useLayoutEffect, useState } from 'react';
import {
  FunnelViewportProvider,
  type FunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
import { FunnelDesktopOverlay } from '@/components/ui/FunnelDesktopOverlay';
import {
  V03_DESKTOP_MIN_WIDTH,
  V03_SCREEN_HEIGHT,
  V03_SCREEN_WIDTH,
} from '@/constants/v03-screen';
import { V03_ACTIVE_CANVAS_HEIGHT_VAR } from '@/constants/funnel-vertical-layout';

export type FunnelSurface = 'dark' | 'light';

/**
 * `width` = fit height + grow artboard width on wider screens (always fills viewport width).
 * `scroll` = fit width only; short viewports scroll instead of shrinking (see v03-small-viewports rule).
 */
export type FunnelScaleMode = 'cover' | 'contain' | 'width' | 'scroll';

type FunnelViewportProps = {
  children: ReactNode;
  className?: string;
  surface?: FunnelSurface;
  /** `width` = height-fit + wider artboard on wide screens. `contain` = fit + vertical center. */
  scaleMode?: FunnelScaleMode;
  /** Skip safe-area inset math — full-bleed funnel (e.g. `/onboarding/child`). */
  ignoreSafeArea?: boolean;
};

function funnelSurfaceClass(surface: FunnelSurface): string {
  return surface === 'light' ? 'v03-funnel-surface-light' : 'bg-v03-green-900';
}

type ViewportMetrics = FunnelViewportMetrics;

type FunnelLayout = {
  metrics: ViewportMetrics;
  isDesktop: boolean;
};

const SSR_FUNNEL_METRICS: FunnelViewportMetrics = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  designWidth: V03_SCREEN_WIDTH,
  viewportWidth: V03_SCREEN_WIDTH,
  viewportHeight: V03_SCREEN_HEIGHT,
  needsVerticalScroll: false,
  usableCanvasHeightPx: V03_SCREEN_HEIGHT,
  canvasHeightPx: V03_SCREEN_HEIGHT,
};

const V03_CONTENT_GUTTER_TOTAL = 48;

function readActiveCanvasHeightPx(): number {
  const funnelRoot = document.querySelector('[data-v03-funnel]');
  if (!(funnelRoot instanceof HTMLElement)) {
    return V03_SCREEN_HEIGHT;
  }
  const compact = parseFloat(
    funnelRoot.style.getPropertyValue(V03_ACTIVE_CANVAS_HEIGHT_VAR) || '0'
  );
  if (compact > 0) {
    return Math.min(V03_SCREEN_HEIGHT, compact);
  }
  return V03_SCREEN_HEIGHT;
}

function measureViewport(
  scaleMode: FunnelScaleMode,
  ignoreSafeArea: boolean
): FunnelViewportMetrics {
  const vv = typeof window !== 'undefined' ? window.visualViewport : null;
  const width = Math.max(vv?.width ?? 0, document.documentElement.clientWidth, window.innerWidth);
  const height = Math.max(vv?.height ?? 0, document.documentElement.clientHeight, window.innerHeight);

  const safeTop = ignoreSafeArea
    ? 0
    : parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--v03-safe-top') ||
          '0'
      );
  const safeBottom = ignoreSafeArea
    ? 0
    : parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--v03-safe-bottom'
        ) || '0'
      );
  const usableHeight = Math.max(height - safeTop - safeBottom, 1);

  const scaleX = width / V03_SCREEN_WIDTH;
  const scaleY = usableHeight / V03_SCREEN_HEIGHT;
  const scale = resolveScale(scaleMode, scaleX, scaleY);
  const designWidth = resolveDesignWidth(scaleMode, width, scale);
  const scaledW = designWidth * scale;
  const usableCanvasHeightPx = Math.min(
    V03_SCREEN_HEIGHT,
    Math.max(Math.floor(usableHeight / scale), 1)
  );
  const activeCanvasHeightPx = readActiveCanvasHeightPx();
  const scaledH = activeCanvasHeightPx * scale;

  return {
    scale,
    offsetX: resolveOffsetX(scaleMode, width, scaledW),
    offsetY: resolveOffsetY(
      scaleMode,
      ignoreSafeArea,
      safeTop,
      usableHeight,
      height,
      scaledH
    ),
    designWidth,
    viewportWidth: width,
    viewportHeight: height,
    usableCanvasHeightPx,
    canvasHeightPx: activeCanvasHeightPx,
    needsVerticalScroll:
      scaleMode === 'scroll' && scaledH > usableHeight + 1,
  };
}

function resolveDesignWidth(
  scaleMode: FunnelScaleMode,
  viewportWidth: number,
  scale: number
): number {
  if (scaleMode === 'width' || scaleMode === 'scroll') {
    return viewportWidth / scale;
  }
  return V03_SCREEN_WIDTH;
}

function resolveScale(
  scaleMode: FunnelScaleMode,
  scaleX: number,
  scaleY: number
): number {
  switch (scaleMode) {
    case 'contain':
      return Math.min(scaleX, scaleY);
    case 'width':
      return scaleY;
    case 'scroll':
      // Short viewport: width-fit at ≥1:1 on 375px-wide phones — scroll, don't height-shrink.
      // Tall viewport: when width-fit would overflow height, height-fit slightly to avoid bounce scroll.
      if (scaleY < scaleX) {
        if (scaleY < 1) {
          return scaleX >= 1 ? Math.max(scaleX, 1) : scaleX;
        }
        return scaleY;
      }
      return scaleX;
    default:
      return Math.max(scaleX, scaleY);
  }
}

function resolveOffsetX(
  scaleMode: FunnelScaleMode,
  width: number,
  scaledW: number
): number {
  if (scaleMode === 'width' || scaleMode === 'scroll') {
    return 0;
  }
  return (width - scaledW) / 2;
}

function resolveOffsetY(
  scaleMode: FunnelScaleMode,
  ignoreSafeArea: boolean,
  safeTop: number,
  usableHeight: number,
  height: number,
  scaledH: number
): number {
  if (ignoreSafeArea && scaleMode === 'cover') {
    return 0;
  }
  if (scaleMode === 'width' || scaleMode === 'scroll') {
    return safeTop;
  }
  if (ignoreSafeArea) {
    return (height - scaledH) / 2;
  }
  return safeTop + (usableHeight - scaledH) / 2;
}

/** Scales 375×812 children to cover the viewport (inside .v03-funnel-root). */
export function FunnelViewport({
  children,
  className = '',
  surface = 'dark',
  scaleMode = 'cover',
  ignoreSafeArea = false,
}: FunnelViewportProps) {
  const [layoutReady, setLayoutReady] = useState(false);
  const [layout, setLayout] = useState<FunnelLayout>({
    metrics: SSR_FUNNEL_METRICS,
    isDesktop: false,
  });
  const [isLightFunnel, setIsLightFunnel] = useState(false);

  useLayoutEffect(() => {
    const root = document.querySelector('[data-v03-funnel]');
    const sync = () => {
      setIsLightFunnel(root?.classList.contains('v03-funnel-light') ?? false);
    };
    sync();
    if (!root) return;
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const activeSurface: FunnelSurface = isLightFunnel ? 'light' : surface;
  const surfaceClass = funnelSurfaceClass(activeSurface);

  const applyLayout = useCallback(
    (metrics: FunnelViewportMetrics) => {
      const funnelRoot = document.querySelector('[data-v03-funnel]');

      if (funnelRoot instanceof HTMLElement) {
        funnelRoot.style.setProperty(
          '--v03-screen-width',
          `${metrics.designWidth}px`
        );
        funnelRoot.style.setProperty(
          '--v03-content-width',
          `${Math.max(metrics.designWidth - V03_CONTENT_GUTTER_TOTAL, 0)}px`
        );
      }

      setLayout({
        metrics,
        isDesktop: window.innerWidth >= V03_DESKTOP_MIN_WIDTH,
      });
    },
    []
  );

  const measureAndApply = useCallback(() => {
    applyLayout(measureViewport(scaleMode, ignoreSafeArea));
  }, [applyLayout, scaleMode, ignoreSafeArea]);

  useLayoutEffect(() => {
    measureAndApply();
    setLayoutReady(true);

    window.addEventListener('resize', measureAndApply);
    window.addEventListener('orientationchange', measureAndApply);
    window.visualViewport?.addEventListener('resize', measureAndApply);
    window.visualViewport?.addEventListener('scroll', measureAndApply);
    return () => {
      window.removeEventListener('resize', measureAndApply);
      window.removeEventListener('orientationchange', measureAndApply);
      window.visualViewport?.removeEventListener('resize', measureAndApply);
      window.visualViewport?.removeEventListener('scroll', measureAndApply);
    };
  }, [measureAndApply]);

  const { metrics, isDesktop } = layout;
  const isScrollMode = scaleMode === 'scroll';
  const viewportOverflowClass = isScrollMode
    ? metrics.needsVerticalScroll
      ? 'overflow-x-hidden overflow-y-auto v03-scroll-hidden'
      : 'overflow-x-hidden overflow-y-hidden'
    : 'overflow-visible';
  const scaledVisualWidth = metrics.designWidth * metrics.scale;
  const scaledVisualHeight = metrics.canvasHeightPx * metrics.scale;
  const scrollSafePadding = isScrollMode && !ignoreSafeArea
    ? {
        paddingTop: metrics.offsetY,
        paddingBottom: 'var(--v03-safe-bottom)',
      }
    : undefined;

  const canvasStyle = {
    width: metrics.designWidth,
    height: metrics.canvasHeightPx,
    transform: `scale(${metrics.scale})`,
    transformOrigin: 'top left',
  } as const;

  return (
    <FunnelViewportProvider
      isDesktop={isDesktop}
      metrics={metrics}
      layoutReady={layoutReady}
    >
      <div
        className={`relative h-full w-full ${viewportOverflowClass} ${className} ${
          layoutReady ? 'v03-funnel-viewport-ready' : 'v03-funnel-viewport-pending'
        }`}
        style={scrollSafePadding}
      >
        {isLightFunnel ? (
          <div
            className="pointer-events-none absolute inset-0 v03-funnel-surface-light"
            aria-hidden
          />
        ) : null}
        {layoutReady && !isDesktop ? (
          isScrollMode ? (
            <div
              className="relative shrink-0"
              style={{
                width: scaledVisualWidth,
                height: scaledVisualHeight,
              }}
            >
              <div
                className={`absolute left-0 top-0 overflow-visible ${
                  isLightFunnel ? surfaceClass : 'bg-transparent'
                }`}
                style={canvasStyle}
              >
                {children}
              </div>
            </div>
          ) : (
            <div
              className={`absolute overflow-visible ${
                isLightFunnel ? surfaceClass : 'bg-transparent'
              }`}
              style={{
                left: metrics.offsetX,
                top: metrics.offsetY,
                ...canvasStyle,
              }}
            >
              {children}
            </div>
          )
        ) : null}

        {isDesktop && layoutReady ? <FunnelDesktopOverlay /> : null}
      </div>
    </FunnelViewportProvider>
  );
}
