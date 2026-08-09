'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { ChildMintFunnelBackground } from '@/components/onboarding/game/ChildMintFunnelBackground';
import { BallGameSliderCard } from '@/components/onboarding/game/BallGameSliderCard';
import { OnboardingFunnelStepSlot } from '@/components/onboarding/OnboardingFunnelStepSlot';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';

type ChildInvalidInviteStepProps = {
  title?: string;
  detail?: string;
};

const DEFAULT_TITLE = 'הקישור לא תקין';
const DEFAULT_DETAIL = 'בקשו מההורה לשלוח את הלינק פעם נוספת';

/** Invalid/expired child invite — full funnel height + bottom-left mint ellipse. */
export function ChildInvalidInviteStep({
  title = DEFAULT_TITLE,
  detail = DEFAULT_DETAIL,
}: ChildInvalidInviteStepProps) {
  return (
    <>
      <ChildMintFunnelBackground />
      <OnboardingFunnelStepSlot stepKey="invalidToken" clipOverflow={false}>
        <div
          dir="rtl"
          className="relative z-[10] flex h-full min-h-0 w-full flex-col items-center justify-center px-v03-gutter"
          role="alert"
          aria-labelledby="child-invalid-invite-title"
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
                id="child-invalid-invite-title"
                className="w-full shrink-0 text-center font-simpler text-[30px] font-black leading-[33px] tracking-[-0.6px] text-white"
              >
                {title}
              </p>
              <p className="w-full shrink-0 text-center font-simpler text-[16px] font-normal leading-[21.6px] tracking-[-0.24px] text-white/80">
                {detail}
              </p>
            </div>
          </BallGameSliderCard>
        </div>
      </OnboardingFunnelStepSlot>
    </>
  );
}
