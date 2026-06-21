'use client';

import { Button } from '@/components/ui/Button';
import { ONBOARDING_FUNNEL_CTA_TOP_PX } from '@/constants/onboarding-figma';
import { resetOnboardingParentFlowStart } from '@/lib/onboarding/parentFlowSession';

type OnboardingCtaProps = {
  onStart?: () => void;
};

/**
 * Onboarding step 1 — primary CTA (Figma 12822:3539 / 12703:41524).
 * Position: left 24px, top 661px, 327×55.
 */
export function OnboardingCta({ onStart }: OnboardingCtaProps) {
  const handleStart = () => {
    resetOnboardingParentFlowStart();
    onStart?.();
  };

  return (
    <div
      className="absolute left-v03-gutter z-[11] w-v03-content"
      style={{ top: ONBOARDING_FUNNEL_CTA_TOP_PX }}
    >
      <Button
        type="button"
        size="lg"
        className="w-full gap-2 text-[18px] font-bold leading-normal text-[#031D15]"
        onClick={handleStart}
      >
        התחלה
      </Button>
    </div>
  );
}
