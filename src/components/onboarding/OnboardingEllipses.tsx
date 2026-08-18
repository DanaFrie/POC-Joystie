'use client';

import {
  ONBOARDING_ELLIPSE_387,
  ONBOARDING_ELLIPSE_388,
} from '@/constants/onboarding-figma';
import { GreenBlurEllipse } from '@/components/ui/GreenBlurEllipses387388';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';

const ELLIPSE_LAYER_HEIGHT_PX = Math.max(
  ONBOARDING_ELLIPSE_387.top + ONBOARDING_ELLIPSE_387.height,
  ONBOARDING_ELLIPSE_388.top + ONBOARDING_ELLIPSE_388.height
);

const ELLIPSE_MIN_LEFT_PX = Math.min(
  ONBOARDING_ELLIPSE_387.left,
  ONBOARDING_ELLIPSE_388.left
);

const ELLIPSE_MAX_RIGHT_PX = Math.max(
  ONBOARDING_ELLIPSE_387.left + ONBOARDING_ELLIPSE_387.width,
  ONBOARDING_ELLIPSE_388.left + ONBOARDING_ELLIPSE_388.width
);

/**
 * Kingdom transition ellipses 387 + 388 — Figma 375×812.
 *
 * In-canvas at z-[3] (above kingdom z-[2], below logo) so glow shows over the hero.
 * Layer width extends past the artboard for Figma negative/right bleed on all viewports.
 */
export function OnboardingEllipses() {
  const { designWidth } = useFunnelViewportMetrics();

  const layerLeft = ELLIPSE_MIN_LEFT_PX;
  const layerWidth = Math.max(designWidth, ELLIPSE_MAX_RIGHT_PX) - layerLeft;

  return (
    <div
      className="pointer-events-none absolute top-0 z-[3] overflow-visible"
      style={{
        left: layerLeft,
        width: layerWidth,
        height: ELLIPSE_LAYER_HEIGHT_PX,
      }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute overflow-visible"
        style={{
          top: ONBOARDING_ELLIPSE_388.top,
          left: ONBOARDING_ELLIPSE_388.left - layerLeft,
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
          left: ONBOARDING_ELLIPSE_387.left - layerLeft,
        }}
        width={ONBOARDING_ELLIPSE_387.width}
        height={ONBOARDING_ELLIPSE_387.height}
        blurPx={ONBOARDING_ELLIPSE_387.blurPx}
        fill={ONBOARDING_ELLIPSE_387.fill}
      />
    </div>
  );
}
