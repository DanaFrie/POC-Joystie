'use client';

import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import { SIGNUP_CHILD_INVITE_WAITING_LOGO } from '@/constants/onboarding-figma';
import {
  SIGNUP_CHILD_INVITE_WAITING_CONTENT_TOP_PX,
  SIGNUP_CHILD_INVITE_WAITING_LOGO_PX,
  SIGNUP_CHILD_INVITE_WAITING_TEXT_GIF_GAP_PX,
  SIGNUP_CHILD_INVITE_WAITING_TEXT_W_PX,
} from '@/constants/signup-child-invite-layout';

/** Shared waiting headline — 24 ExtraBold, white glow. */
export const ONBOARDING_WAITING_HEADLINE_CLASS =
  'w-full whitespace-pre-line text-center font-simpler text-[24px] font-extrabold leading-[1.1] tracking-[-0.72px] text-white [text-shadow:0_0_20px_rgba(255,255,255,0.5)]';

type OnboardingWaitingCenterContentProps = {
  headline: string;
  ariaLabel: string;
  showLogo?: boolean;
};

/** Center column — headline + optional waiting GIF (Figma 13196:2952). */
export function OnboardingWaitingCenterContent({
  headline,
  ariaLabel,
  showLogo = true,
}: OnboardingWaitingCenterContentProps) {
  const contentTopPx = useFunnelProportionalTopPx(SIGNUP_CHILD_INVITE_WAITING_CONTENT_TOP_PX);

  return (
    <div
      dir="rtl"
      className="absolute inset-0 z-[10] overflow-hidden"
      aria-label={ariaLabel}
    >
      <div
        className="absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center"
        style={{
          top: contentTopPx,
          width: SIGNUP_CHILD_INVITE_WAITING_TEXT_W_PX,
          gap: SIGNUP_CHILD_INVITE_WAITING_TEXT_GIF_GAP_PX,
        }}
      >
        {headline ? (
          <p className={`${ONBOARDING_WAITING_HEADLINE_CLASS} transition-opacity duration-300`}>
            {headline}
          </p>
        ) : null}

        {showLogo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={SIGNUP_CHILD_INVITE_WAITING_LOGO}
            alt=""
            className="shrink-0 object-cover"
            style={{
              width: SIGNUP_CHILD_INVITE_WAITING_LOGO_PX,
              height: SIGNUP_CHILD_INVITE_WAITING_LOGO_PX,
              background: 'transparent',
            }}
            decoding="async"
          />
        ) : null}
      </div>
    </div>
  );
}
