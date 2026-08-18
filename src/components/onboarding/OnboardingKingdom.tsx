'use client';

import Image from 'next/image';
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
      className="pointer-events-none relative z-[2] overflow-visible"
      style={bleedStyle}
      aria-hidden
    >
      <div className="absolute left-1/2 top-0 h-full w-[115%] -translate-x-1/2">
        <div className="relative h-full w-full">
          <Image
            src={ONBOARDING_KINGDOM_SRC}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top [filter:saturate(1.75)_contrast(1.08)]"
            draggable={false}
          />
        </div>
      </div>
      <div
        className="absolute inset-0"
        style={{ background: KINGDOM_GRADIENT }}
      />
    </div>
  );
}
