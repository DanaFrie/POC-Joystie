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

export type FunnelSurface = 'dark' | 'light';

export type FunnelScaleMode = 'cover' | 'contain';

type FunnelViewportProps = {
  children: ReactNode;
  className?: string;
  surface?: FunnelSurface;
  /** `contain` keeps full 812px visible (fixes footer clip on Galaxy S8+). */
  scaleMode?: FunnelScaleMode;
  /** Skip safe-area inset math — full-bleed funnel (e.g. `/onboarding/child`). */
  ignoreSafeArea?: boolean;
};

function funnelSurfaceClass(surface: FunnelSurface): string {
  return surface === 'light' ? 'v03-funnel-surface-light' : 'bg-v03-green-900';
}

type ViewportMetrics = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

type FunnelLayout = {
  metrics: ViewportMetrics;
  isDesktop: boolean;
};

function measureViewport(
  scaleMode: FunnelScaleMode,
  ignoreSafeArea: boolean
): ViewportMetrics {
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
  const scale =
    scaleMode === 'contain' ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);
  const scaledW = V03_SCREEN_WIDTH * scale;
  const scaledH = V03_SCREEN_HEIGHT * scale;

  const anchorTop = ignoreSafeArea && scaleMode === 'cover';

  return {
    scale,
    offsetX: (width - scaledW) / 2,
    offsetY: anchorTop
      ? 0
      : ignoreSafeArea
        ? (height - scaledH) / 2
        : safeTop + (usableHeight - scaledH) / 2,
  };
}

/** Scales 375×812 children to cover the viewport (inside .v03-funnel-root). */
export function FunnelViewport({
  children,
  className = '',
  surface = 'dark',
  scaleMode = 'cover',
  ignoreSafeArea = false,
}: FunnelViewportProps) {
  const [layout, setLayout] = useState<FunnelLayout | null>(null);
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

  const updateLayout = useCallback(() => {
    setLayout({
      metrics: measureViewport(scaleMode, ignoreSafeArea),
      isDesktop: window.innerWidth >= V03_DESKTOP_MIN_WIDTH,
    });
  }, [scaleMode, ignoreSafeArea]);

  useLayoutEffect(() => {
    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);
    window.visualViewport?.addEventListener('resize', updateLayout);
    window.visualViewport?.addEventListener('scroll', updateLayout);
    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
      window.visualViewport?.removeEventListener('resize', updateLayout);
      window.visualViewport?.removeEventListener('scroll', updateLayout);
    };
  }, [updateLayout]);

  if (!layout) {
    return (
      <FunnelViewportProvider isDesktop={false}>
        <div
          className={`relative h-full w-full ${className}`}
          suppressHydrationWarning
        />
      </FunnelViewportProvider>
    );
  }

  const { metrics, isDesktop } = layout;
  const viewportWidth =
    typeof window !== 'undefined'
      ? Math.max(
          window.visualViewport?.width ?? 0,
          document.documentElement.clientWidth,
          window.innerWidth
        )
      : V03_SCREEN_WIDTH;
  const viewportHeight =
    typeof window !== 'undefined'
      ? Math.max(
          window.visualViewport?.height ?? 0,
          document.documentElement.clientHeight,
          window.innerHeight
        )
      : V03_SCREEN_HEIGHT;

  const viewportMetrics: FunnelViewportMetrics = {
    scale: metrics.scale,
    offsetX: metrics.offsetX,
    offsetY: metrics.offsetY,
    viewportWidth,
    viewportHeight,
  };

  return (
    <FunnelViewportProvider isDesktop={isDesktop} metrics={viewportMetrics}>
      <div className={`relative h-full w-full ${className}`}>
        {isLightFunnel ? (
          <div
            className="pointer-events-none absolute inset-0 v03-funnel-surface-light"
            aria-hidden
          />
        ) : null}
        <div
          className={`absolute overflow-visible ${
            isLightFunnel ? surfaceClass : 'bg-transparent'
          }`}
          style={{
            left: metrics.offsetX,
            top: metrics.offsetY,
            width: V03_SCREEN_WIDTH,
            height: V03_SCREEN_HEIGHT,
            transform: `scale(${metrics.scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>

        {isDesktop ? <FunnelDesktopOverlay /> : null}
      </div>
    </FunnelViewportProvider>
  );
}
