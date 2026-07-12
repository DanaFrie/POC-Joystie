'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import {
  BALL_GAME_SLIDER_CTA_CLASS,
  BallGameSliderCard,
} from '@/components/onboarding/game/BallGameSliderCard';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';

type PaymentCheckoutFailureScreenProps = {
  onRetry: () => void;
  busy?: boolean;
  eyebrow?: string;
  titleLines?: [string, string];
  subtitle?: string;
  ctaLabel?: string;
};

/** Cardcom checkout failure / verify timeout — disappointed Dori slider card. */
export function PaymentCheckoutFailureScreen({
  onRetry,
  busy,
  eyebrow = 'התשלום לא הושלם',
  titleLines = ['לא הצלחנו לאמת', 'את פרטי הכרטיס'],
  subtitle = 'אפשר לנסות שוב או לבחור אמצעי תשלום אחר',
  ctaLabel = 'נסו שוב',
}: PaymentCheckoutFailureScreenProps) {
  return (
    <div
      className="v03-scroll-hidden absolute inset-0 z-[55] isolate flex items-center justify-center overflow-x-hidden overflow-y-auto px-v03-gutter"
      style={{
        background: 'rgba(0, 0, 0, 0.20)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-checkout-failure-title"
    >
      <BallGameSliderCard
        footer={
          <button
            type="button"
            disabled={busy}
            onClick={onRetry}
            className={BALL_GAME_SLIDER_CTA_CLASS}
          >
            {ctaLabel}
          </button>
        }
      >
        <div className="aspect-square h-[291px] w-[291px] shrink-0">
          <OnboardingLazyImage
            src={CHILD_ONBOARDING_ASSETS.doriDisappointed}
            alt=""
            className="size-full object-contain"
            priority
          />
        </div>

        <div className="flex w-full shrink-0 flex-col items-center gap-[15px] self-stretch">
          <p className="w-full shrink-0 text-center font-simpler text-[16px] font-normal leading-[21.6px] tracking-[-0.24px] text-white">
            {eyebrow}
          </p>
          <div
            id="payment-checkout-failure-title"
            className="flex w-full shrink-0 flex-col items-center gap-0 self-stretch px-[15px]"
          >
            <p className="w-full shrink-0 text-center font-simpler text-[30px] font-black leading-[33px] tracking-[-0.6px] text-white">
              {titleLines[0]}
            </p>
            <p className="w-full shrink-0 text-center font-simpler text-[30px] font-black leading-[33px] tracking-[-0.6px] text-white">
              {titleLines[1]}
            </p>
          </div>
          <p className="w-full shrink-0 text-center font-simpler text-[16px] font-normal leading-[21.6px] tracking-[-0.24px] text-white/80">
            {subtitle}
          </p>
        </div>
      </BallGameSliderCard>
    </div>
  );
}
