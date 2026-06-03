import { ONBOARDING_KINGDOM_SRC } from '@/constants/onboarding-figma';

/**
 * Kingdom hero — Figma 12703:41505 (375×400 export).
 * Full-bleed from y=0; image anchored to top so sky is not cropped.
 */
export function OnboardingKingdom() {
  return (
    <div
      className="pointer-events-none absolute left-[-12px] top-0 z-[2] h-[400px] w-[399px] overflow-hidden"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ONBOARDING_KINGDOM_SRC}
        alt=""
        className="h-full w-[100.8%] max-w-none object-cover object-top"
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(47, 47, 47, 0) 0%, rgba(47, 47, 47, 0.5) 57.98%)',
        }}
      />
    </div>
  );
}
