'use client';

import { JoystieWordmarkLogo } from '@/components/brand/JoystieWordmarkLogo';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_LOGO } from '@/constants/child-onboarding-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

type ChildOnboardingLogoProps = {
  /** Flow layout inside `FunnelStepForeground` — proportional top @ 120px. */
  flow?: boolean;
};

/** Joystie wordmark SVG — child screens 3–4 (161×78, centered on 375 canvas). */
export function ChildOnboardingLogo({ flow = false }: ChildOnboardingLogoProps) {
  const logo = CHILD_ONBOARDING_LOGO;
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const canvasScale = usableCanvasHeightPx / V03_SCREEN_HEIGHT;
  const logoWidth = logo.width * canvasScale;
  const logoHeight = logo.height * canvasScale;
  const flowTopPx = (logo.top / V03_SCREEN_HEIGHT) * usableCanvasHeightPx;

  if (flow) {
    return (
      <div
        className="pointer-events-none flex w-full justify-center"
        style={{ paddingTop: flowTopPx }}
      >
        <JoystieWordmarkLogo
          className="relative z-[5] shrink-0"
          style={{ width: logoWidth, height: logoHeight }}
          role="img"
          aria-label="Joystie"
        />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute left-1/2 z-[5] -translate-x-1/2"
      style={{
        top: logo.top,
        width: logo.width,
        height: logo.height,
      }}
      aria-hidden
    >
      <JoystieWordmarkLogo className="h-full w-full" role="img" aria-label="Joystie" />
    </div>
  );
}
