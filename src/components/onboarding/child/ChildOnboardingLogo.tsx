import { ChildJoystieLogoMark } from '@/components/onboarding/child/ChildJoystieLogoMark';
import { CHILD_ONBOARDING_LOGO } from '@/constants/child-onboarding-layout';

/** Joystie SVG logo — child screens 3–4, centered on 375 canvas. */
export function ChildOnboardingLogo() {
  const logo = CHILD_ONBOARDING_LOGO;

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
      <ChildJoystieLogoMark className="h-full w-full" />
    </div>
  );
}
