'use client';

import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import { ONBOARDING_WAITING_HEADLINE_CLASS } from '@/components/onboarding/signup/OnboardingWaitingCenterContent';
import { SIGNUP_CHILD_INVITE_WAITING_LOGO } from '@/constants/onboarding-figma';
import {
  SIGNUP_CHILD_INVITE_WAITING_CONTENT_TOP_PX,
  SIGNUP_CHILD_INVITE_WAITING_LOGO_PX,
  SIGNUP_CHILD_INVITE_WAITING_TEXT_GIF_GAP_PX,
  SIGNUP_CHILD_INVITE_WAITING_TEXT_W_PX,
} from '@/constants/signup-child-invite-layout';

type OnboardingWaitingOverlayProps = {
  headline: string;
  className?: string;
};

/** Center headline + waiting GIF — same placement as child-invite waiting screens. */
export function OnboardingWaitingOverlay({
  headline,
  className = '',
}: OnboardingWaitingOverlayProps) {
  const contentTopPx = useFunnelProportionalTopPx(SIGNUP_CHILD_INVITE_WAITING_CONTENT_TOP_PX);

  return (
    <div
      dir="rtl"
      className={`pointer-events-none absolute inset-0 z-[35] ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className="absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center"
        style={{
          top: contentTopPx,
          width: SIGNUP_CHILD_INVITE_WAITING_TEXT_W_PX,
          gap: SIGNUP_CHILD_INVITE_WAITING_TEXT_GIF_GAP_PX,
        }}
      >
        <p className={ONBOARDING_WAITING_HEADLINE_CLASS}>{headline}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
      </div>
    </div>
  );
}
