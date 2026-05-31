import { ONBOARDING_KINGDOM_SRC } from '@/constants/onboarding-figma';

/**
 * Kingdom hero — Figma 12703:41505
 * Background stack from Dev Mode (gradient + image position/size).
 */
export function OnboardingKingdom() {
  return (
    <div
      className="pointer-events-none absolute left-[-12px] top-[42px] z-[2] h-[400px] w-[399px] overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(47, 47, 47, 0) 0%, rgba(47, 47, 47, 0.5) 57.98%), url(${ONBOARDING_KINGDOM_SRC})`,
        backgroundPosition: '0 0, -1.596px -2.852px',
        backgroundSize: '100% 100%, 100.8% 100.532%',
        backgroundRepeat: 'no-repeat, no-repeat',
      }}
      aria-hidden
    />
  );
}
