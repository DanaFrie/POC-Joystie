'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { BallGameSliderCard } from '@/components/onboarding/game/BallGameSliderCard';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';

type ChildDashboardErrorStateProps = {
  /** Optional technical detail — not shown as primary copy. */
  detail?: string | null;
};

/** Token / load failure — disappointed Dori (same family as payment failure). */
export function ChildDashboardErrorState({ detail }: ChildDashboardErrorStateProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center px-v03-gutter"
      style={{
        background: '#061C1E',
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}
      role="alert"
      aria-labelledby="child-dashboard-error-title"
    >
      <BallGameSliderCard>
        <div className="aspect-square h-[291px] w-[291px] shrink-0">
          <OnboardingLazyImage
            src={CHILD_ONBOARDING_ASSETS.doriDisappointed}
            alt=""
            className="size-full object-contain"
            priority
          />
        </div>

        <div className="flex w-full shrink-0 flex-col items-center gap-[15px] self-stretch">
          <p
            id="child-dashboard-error-title"
            className="w-full shrink-0 text-center font-simpler text-[30px] font-black leading-[33px] tracking-[-0.6px] text-white"
          >
            משהו הלך לא טוב
          </p>
          <p className="w-full shrink-0 text-center font-simpler text-[16px] font-normal leading-[21.6px] tracking-[-0.24px] text-white/80">
            נקווה שיפתר בקרוב
          </p>
          {detail && detail !== 'CHILD_NOT_READY' ? (
            <p className="sr-only">{detail}</p>
          ) : null}
        </div>
      </BallGameSliderCard>
    </div>
  );
}
