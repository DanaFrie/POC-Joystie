'use client';

import { JoystieWordmarkLogo } from '@/components/brand/JoystieWordmarkLogo';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import {
  ONBOARDING_LANDING_LOGO_GLOW_TOP_PX,
  ONBOARDING_LANDING_LOGO_TOP_PX,
} from '@/constants/onboarding-figma';

type OnboardingLogoProps = {
  /** Flow layout inside `FunnelStepForeground` — no absolute canvas coords. */
  flow?: boolean;
};

/**
 * Logo stack — Figma 12703:41507 (glow) + 12703:41508 (wordmark SVG)
 */
export function OnboardingLogo({ flow = false }: OnboardingLogoProps) {
  const glowTopPx = useFunnelProportionalTopPx(ONBOARDING_LANDING_LOGO_GLOW_TOP_PX);
  const logoTopPx = useFunnelProportionalTopPx(ONBOARDING_LANDING_LOGO_TOP_PX);

  if (flow) {
    return (
      <div className="pointer-events-none relative flex w-full flex-col items-center pt-[clamp(48px,11vh,114px)]">
        <div
          className="relative z-[4] h-[166px] w-[177px] overflow-visible"
          aria-hidden
        >
          <div
            className="h-full w-full rounded-[50%] bg-v03-green-900 opacity-[0.15]"
            style={{ filter: 'blur(45px)' }}
          />
        </div>
        <div className="relative z-[5] -mt-[85px] h-[79.194px] w-[163.978px]">
          <JoystieWordmarkLogo className="h-full w-full" role="img" aria-label="Joystie" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="pointer-events-none absolute left-[109px] z-[4] h-[166px] w-[177px] overflow-visible"
        style={{ top: glowTopPx }}
        aria-hidden
      >
        <div
          className="h-full w-full rounded-[50%] bg-v03-green-900 opacity-[0.15]"
          style={{ filter: 'blur(45px)' }}
        />
      </div>

      <div
        className="pointer-events-none absolute left-[calc(50%+8.51px)] z-[5] h-[79.194px] w-[163.978px] -translate-x-1/2"
        style={{ top: logoTopPx }}
      >
        <JoystieWordmarkLogo className="h-full w-full" role="img" aria-label="Joystie" />
      </div>
    </>
  );
}
