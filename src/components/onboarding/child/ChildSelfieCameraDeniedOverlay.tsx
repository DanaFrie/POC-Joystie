'use client';

import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { BallGameSliderCard } from '@/components/onboarding/game/BallGameSliderCard';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import {
  CHILD_SELFIE_CAMERA_DENIED_DISCLAIMER,
  CHILD_SELFIE_CAMERA_DECLINE_LABEL,
  CHILD_SELFIE_CAMERA_DENIED_HEADLINE,
  CHILD_SELFIE_CAMERA_DENIED_TITLE,
  CHILD_SELFIE_CAMERA_RETRY_LABEL,
} from '@/lib/onboarding/childPostGameCopy';

type ChildSelfieCameraDeniedOverlayProps = {
  onRetry: () => void;
  onDecline?: () => void;
  busy?: boolean;
};

/** Mission 3 — camera permission denied (ball-game failure card pattern). */
export function ChildSelfieCameraDeniedOverlay({
  onRetry,
  onDecline,
  busy,
}: ChildSelfieCameraDeniedOverlayProps) {
  return (
    <div
      className="v03-scroll-hidden absolute inset-0 z-[45] isolate flex items-center justify-center overflow-x-hidden overflow-y-auto bg-[rgba(0,0,0,0.20)] px-v03-gutter backdrop-blur-[15px]"
      style={{
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        WebkitBackdropFilter: 'blur(15px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="selfie-camera-denied-title"
    >
      <BallGameSliderCard
        footer={
          <div className="flex w-full flex-col items-start gap-[15px] self-stretch">
            <button
              type="button"
              onClick={onDecline}
              className="inline-flex h-[55px] w-full shrink-0 items-center justify-center gap-2 self-stretch rounded-[22px] bg-white px-[15px] py-2 font-simpler text-[18px] font-bold leading-[21.6px] text-v03-green-900 shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:brightness-95"
            >
              {CHILD_SELFIE_CAMERA_DECLINE_LABEL}
            </button>

            <div className="flex w-full flex-col items-start gap-[6px] self-stretch">
              <button
                type="button"
                disabled={busy}
                onClick={onRetry}
                className="inline-flex h-[55px] w-full shrink-0 items-center justify-center gap-2 self-stretch rounded-[22px] border border-white bg-transparent px-[15px] py-2 font-simpler text-[18px] font-bold leading-[21.6px] text-white shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:bg-white/5 disabled:opacity-60"
              >
                {CHILD_SELFIE_CAMERA_RETRY_LABEL}
              </button>
              <p className="w-full self-stretch text-center font-simpler text-[14px] font-normal leading-[17.5px] tracking-[-0.21px] text-white/60">
                {CHILD_SELFIE_CAMERA_DENIED_DISCLAIMER}
              </p>
            </div>
          </div>
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
          <p className="w-full shrink-0 text-center font-assistant text-[16px] font-normal leading-[135%] tracking-[-0.24px] text-white">
            {CHILD_SELFIE_CAMERA_DENIED_HEADLINE}
          </p>
          <p
            id="selfie-camera-denied-title"
            className="w-full shrink-0 text-center font-assistant text-[30px] font-black leading-[33px] tracking-[-0.6px] text-white"
          >
            {CHILD_SELFIE_CAMERA_DENIED_TITLE}
          </p>
        </div>
      </BallGameSliderCard>
    </div>
  );
}
