'use client';

import { ONBOARDING_KINGDOM_SRC } from '@/constants/onboarding-figma';
import { useFunnelHeroBleed } from '@/components/ui/FunnelViewportContext';

const KINGDOM_HEIGHT_PX = 400;

const KINGDOM_GRADIENT =
  'linear-gradient(180deg, rgba(47, 47, 47, 0) 0%, rgba(47, 47, 47, 0.5) 57.98%)';

/**
 * Kingdom hero — Figma 12703:41505 (375×400).
 * Bleeds into letterbox when funnel uses contain scaling.
 */
export function OnboardingKingdom() {
  const bleedStyle = useFunnelHeroBleed(KINGDOM_HEIGHT_PX);

  return (
    <div
      className="pointer-events-none relative z-[2] overflow-hidden"
      style={bleedStyle}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ONBOARDING_KINGDOM_SRC}
        alt=""
        className="absolute left-1/2 top-0 min-h-full min-w-[115%] -translate-x-1/2 object-cover object-top"
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{ background: KINGDOM_GRADIENT }}
      />
    </div>
  );
}
