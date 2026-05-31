import { ButtonLink } from '@/components/ui/Button';

/**
 * Onboarding step 1 — primary CTA (Figma 12822:3539 / 12703:41524).
 * Position: left 24px, top 661px, 327×55.
 */
export function OnboardingCta() {
  return (
    <div className="absolute left-v03-gutter top-[661px] z-[11] w-v03-content">
      <ButtonLink
        href="/onboarding/parent"
        size="lg"
        className="gap-2 text-[18px] font-bold leading-normal text-[#031D15]"
      >
        התחלה
      </ButtonLink>
    </div>
  );
}
