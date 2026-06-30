import { JoystieWordmarkLogo } from '@/components/brand/JoystieWordmarkLogo';

/**
 * Logo stack — Figma 12703:41507 (glow) + 12703:41508 (wordmark SVG)
 * 375×812 coordinates; scales via FunnelViewport.
 */
export function OnboardingLogo() {
  return (
    <>
      {/* Ellipse 389 — logo glow (12822:3541 / 12703:41507) */}
      <div
        className="pointer-events-none absolute left-[109px] top-[114px] z-[4] h-[166px] w-[177px] overflow-visible"
        aria-hidden
      >
        <div
          className="h-full w-full rounded-[50%] bg-v03-green-900 opacity-[0.15]"
          style={{ filter: 'blur(45px)' }}
        />
      </div>

      {/* Joystie wordmark — 12822:3557 (161×78) */}
      <div
        className="pointer-events-none absolute left-[calc(50%+8.51px)] top-[195px] z-[5] h-[78px] w-[161px] -translate-x-1/2"
      >
        <JoystieWordmarkLogo className="h-full w-full" role="img" aria-label="Joystie" />
      </div>
    </>
  );
}
