'use client';

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
          top: SIGNUP_CHILD_INVITE_WAITING_CONTENT_TOP_PX,
          width: SIGNUP_CHILD_INVITE_WAITING_TEXT_W_PX,
          gap: SIGNUP_CHILD_INVITE_WAITING_TEXT_GIF_GAP_PX,
        }}
      >
        <p
          className="w-full text-center font-simpler text-[22px] font-black leading-[1.25] tracking-[-0.36px] text-white"
          style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}
        >
          {headline}
        </p>
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
