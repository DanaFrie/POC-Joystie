'use client';

import type { ReactNode } from 'react';
import { useCallback, useLayoutEffect, useState } from 'react';
import { FunnelViewportProvider } from '@/components/ui/FunnelViewportContext';
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

function measureViewport(scaleMode: FunnelScaleMode): ViewportMetrics {
  const width = Math.max(
    window.innerWidth,
    document.documentElement.clientWidth
  );
  const height = Math.max(
    window.innerHeight,
    document.documentElement.clientHeight
  );

  const scaleX = width / V03_SCREEN_WIDTH;
  const scaleY = height / V03_SCREEN_HEIGHT;
  const scale =
    scaleMode === 'contain' ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);
  const scaledW = V03_SCREEN_WIDTH * scale;
  const scaledH = V03_SCREEN_HEIGHT * scale;

  return {
    scale,
    offsetX: (width - scaledW) / 2,
    offsetY: (height - scaledH) / 2,
  };
}

/** Scales 375×812 children to cover the viewport (inside .v03-funnel-root). */
export function FunnelViewport({
  children,
  className = '',
  surface = 'dark',
  scaleMode = 'cover',
}: FunnelViewportProps) {
  const surfaceClass = funnelSurfaceClass(surface);
  const [layout, setLayout] = useState<FunnelLayout | null>(null);

  const updateLayout = useCallback(() => {
    setLayout({
      metrics: measureViewport(scaleMode),
      isDesktop: window.innerWidth >= V03_DESKTOP_MIN_WIDTH,
    });
  }, [scaleMode]);

  useLayoutEffect(() => {
    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);
    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, [updateLayout]);

  if (!layout) {
    return (
      <FunnelViewportProvider isDesktop={false}>
        <div
          className={`relative h-full w-full ${surfaceClass} ${className}`}
          suppressHydrationWarning
        />
      </FunnelViewportProvider>
    );
  }

  const { metrics, isDesktop } = layout;

  return (
    <FunnelViewportProvider isDesktop={isDesktop}>
      <div className={`relative h-full w-full ${className}`}>
        <div
          className={`absolute overflow-visible ${surfaceClass}`}
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

        {isDesktop && (
          <div
            className="pointer-events-none absolute inset-0 z-50 flex items-start justify-center px-6 pt-10"
            role="alert"
          >
            <p className="max-w-md rounded-[12px] bg-v03-green-900/80 px-5 py-4 text-center font-simpler text-[18px] font-bold leading-snug text-v03-text-on-dark shadow-lg">
              זמין במובייל בלבד
            </p>
          </div>
        )}
      </div>
    </FunnelViewportProvider>
  );
}
