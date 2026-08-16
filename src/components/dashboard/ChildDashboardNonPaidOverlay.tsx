'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { BallGameSliderCard } from '@/components/onboarding/game/BallGameSliderCard';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';

type ChildDashboardNonPaidOverlayProps = {
  visible: boolean;
  headline: string;
  onDismiss: () => void;
};

/**
 * Child dashboard — mock non-paid / wallet-locked gate.
 * Backend subscription flag is not wired yet; UI-only for now.
 */
export function ChildDashboardNonPaidOverlay({
  visible,
  headline,
  onDismiss,
}: ChildDashboardNonPaidOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="v03-scroll-hidden absolute inset-0 z-[50] isolate flex items-center justify-center overflow-x-hidden overflow-y-auto px-v03-gutter"
      style={{
        background: 'rgba(0, 0, 0, 0.20)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="child-dashboard-non-paid-title"
    >
      <BallGameSliderCard
        footer={
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex h-[55px] w-full shrink-0 items-center justify-center gap-2 self-stretch rounded-[22px] bg-white px-[15px] py-2 font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95"
          >
            הבנתי
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
            הגישה לדילים עדיין לא פתוחה
          </p>
          <p
            id="child-dashboard-non-paid-title"
            className="w-full shrink-0 text-center font-simpler text-[30px] font-black leading-[33px] tracking-[-0.6px] text-white"
          >
            {headline}
          </p>
        </div>
      </BallGameSliderCard>
    </div>
  );
}
