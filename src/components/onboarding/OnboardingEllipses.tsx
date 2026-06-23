'use client';

import {
  ONBOARDING_ELLIPSE_387,
  ONBOARDING_ELLIPSE_388,
} from '@/constants/onboarding-figma';
import { GreenBlurEllipse } from '@/components/ui/GreenBlurEllipses387388';
import { FunnelRootPortal } from '@/components/ui/FunnelRootPortal';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';

const ELLIPSE_LAYER_HEIGHT_PX = Math.max(
  ONBOARDING_ELLIPSE_387.top + ONBOARDING_ELLIPSE_387.height,
  ONBOARDING_ELLIPSE_388.top + ONBOARDING_ELLIPSE_388.height
);

/**
 * Kingdom transition ellipses 387 + 388 — Figma 375×812.
 *
 * Portaled to `[data-v03-funnel]` so blur bleeds to viewport edges (not clipped by
 * the scaled canvas `overflow-hidden`). Same model as signup `SignupHeroFrame` ellipses.
 */
export function OnboardingEllipses() {
  const { scale, offsetX, offsetY, designWidth, viewportWidth } =
    useFunnelViewportMetrics();

  const layerTopPx = offsetY;
  const layerHeightPx = ELLIPSE_LAYER_HEIGHT_PX * scale;

  return (
    <FunnelRootPortal>
      <div
        className="pointer-events-none overflow-visible"
        style={{
          position: 'fixed',
          left: 0,
          top: layerTopPx,
          width: viewportWidth,
          height: layerHeightPx,
          zIndex: 3,
        }}
        aria-hidden
      >
        <div
          className="pointer-events-none overflow-visible"
          style={{
            position: 'absolute',
            left: offsetX,
            top: 0,
            width: designWidth * scale,
            height: layerHeightPx,
          }}
        >
          <div
            className="relative overflow-visible"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: designWidth,
              height: ELLIPSE_LAYER_HEIGHT_PX,
            }}
          >
            <div
              className="pointer-events-none absolute overflow-visible"
              style={{
                top: ONBOARDING_ELLIPSE_388.top,
                left: ONBOARDING_ELLIPSE_388.left,
                width: ONBOARDING_ELLIPSE_388.width,
                height: ONBOARDING_ELLIPSE_388.height,
                borderRadius: ONBOARDING_ELLIPSE_388.borderRadius,
                background: ONBOARDING_ELLIPSE_388.fill,
                filter: `blur(${ONBOARDING_ELLIPSE_388.blurPx}px)`,
              }}
            />

            <GreenBlurEllipse
              className="absolute overflow-visible"
              style={{
                top: ONBOARDING_ELLIPSE_387.top,
                left: ONBOARDING_ELLIPSE_387.left,
              }}
              width={ONBOARDING_ELLIPSE_387.width}
              height={ONBOARDING_ELLIPSE_387.height}
              blurPx={ONBOARDING_ELLIPSE_387.blurPx}
              fill={ONBOARDING_ELLIPSE_387.fill}
            />
          </div>
        </div>
      </div>
    </FunnelRootPortal>
  );
}
