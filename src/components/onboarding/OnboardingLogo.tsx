import Image from 'next/image';

/**
 * Logo stack — Figma 12703:41507 (glow) + 12703:41508 (logo)
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

      {/* logo-joystie.png — 12822:3557 */}
      <div
        className="pointer-events-none absolute left-[calc(50%+8.51px)] top-[195px] z-[5] h-[79px] w-[164px] -translate-x-1/2"
        aria-hidden
      >
        <Image
          src="/brand/logo-joystie.png"
          alt="Joystie"
          width={164}
          height={79}
          className="h-full w-full object-contain mix-blend-screen"
          priority
        />
      </div>
    </>
  );
}
