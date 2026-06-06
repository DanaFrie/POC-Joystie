'use client';

import { SIGNUP_CHILD_INVITE_WAITING_LOGO } from '@/constants/onboarding-figma';
import {
  SIGNUP_CHILD_INVITE_WAITING_CONTENT_TOP_PX,
  SIGNUP_CHILD_INVITE_WAITING_LOGO_PX,
  SIGNUP_CHILD_INVITE_WAITING_TEXT_GIF_GAP_PX,
  SIGNUP_CHILD_INVITE_WAITING_TEXT_W_PX,
  type SignupChildInviteWaitingVariant,
} from '@/constants/signup-child-invite-layout';

type SignupChildInviteWaitingStepProps = {
  childName: string;
  childGender?: 'boy' | 'girl';
  variant: SignupChildInviteWaitingVariant;
};

function waitingHeadline(
  childName: string,
  variant: SignupChildInviteWaitingVariant,
  gender: 'boy' | 'girl'
) {
  const isGirl = gender === 'girl';
  if (variant === 'companionPick') {
    return isGirl
      ? `מחכים ש${childName} תבחר חבר למסע...`
      : `מחכים ש${childName} יבחר חבר למסע...`;
  }
  return isGirl
    ? `מחכים ש${childName} תפתח את הלינק...`
    : `מחכים ש${childName} יפתח את הלינק...`;
}

function waitingAriaLabel(variant: SignupChildInviteWaitingVariant) {
  return variant === 'companionPick'
    ? 'ממתינים לבחירת חבר למסע'
    : 'ממתינים לפתיחת הלינק';
}

/** Waiting screens — headline + gif only (wordmark marquee lives in page shell). */
export function SignupChildInviteWaitingStep({
  childName,
  childGender = 'boy',
  variant,
}: SignupChildInviteWaitingStepProps) {
  return (
    <div
      dir="rtl"
      className="absolute inset-0 z-[10] overflow-hidden"
      aria-label={waitingAriaLabel(variant)}
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
          className="v03-funnel-enter-0 w-full text-center font-simpler text-2xl font-black leading-[30px] text-white"
          style={{
            letterSpacing: '-0.36px',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
          }}
        >
          {waitingHeadline(childName, variant, childGender)}
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SIGNUP_CHILD_INVITE_WAITING_LOGO}
          alt=""
          className="v03-funnel-enter-1 shrink-0 object-cover"
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
