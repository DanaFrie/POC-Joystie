'use client';

import { FunnelMintEllipse } from '@/components/onboarding/game/FunnelMintEllipse';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import {
  useFunnelBleedBarStyle,
  useFunnelFullBleed,
} from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';

/** Ball-game artboard bg + mint ellipse — full viewport bleed (child + parent). */
export function BallGameFunnelBackground() {
  const coverStyle = useFunnelBleedBarStyle(0);
  const baseBleedStyle = useFunnelFullBleed();

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-visible" aria-hidden>
      <div className="bg-v03-green-900" style={coverStyle} />
      <div style={coverStyle}>
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.ballGameBg}
          alt=""
          className="size-full object-cover"
          style={{ objectPosition: 'center bottom' }}
          priority
        />
      </div>
      {/* Clip mint glow to canvas — blur must not form a bottom band on the viewport. */}
      <div className="absolute inset-0 overflow-hidden" style={baseBleedStyle}>
        <FunnelMintEllipse />
      </div>
    </div>
  );
}
