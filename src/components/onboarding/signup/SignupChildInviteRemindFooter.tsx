'use client';

import { SignupAlarmIcon } from '@/components/onboarding/signup/SignupChildInviteIcons';
import {
  SIGNUP_CHILD_INVITE_HOME_INDICATOR_H_PX,
  SIGNUP_CHILD_INVITE_REMIND_BOTTOM_PT_PX,
  SIGNUP_CHILD_INVITE_REMIND_H_PX,
} from '@/constants/signup-child-invite-layout';

type SignupChildInviteRemindFooterProps = {
  onRemindLater: () => void;
};

/** Figma 12703:42221 — bottom «להזכיר לך מאוחר יותר?» */
export function SignupChildInviteRemindFooter({
  onRemindLater,
}: SignupChildInviteRemindFooterProps) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-[11] flex flex-col items-center gap-[15px]"
      style={{ paddingTop: SIGNUP_CHILD_INVITE_REMIND_BOTTOM_PT_PX }}
    >
      <button
        type="button"
        onClick={onRemindLater}
        className="inline-flex w-v03-content items-center justify-center gap-2 rounded-[18px] border border-solid border-white px-[15px] py-2 font-simpler text-base font-bold leading-[1.35] tracking-[-0.24px] text-white shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition hover:bg-white/5"
        style={{ height: SIGNUP_CHILD_INVITE_REMIND_H_PX }}
      >
        <span>להזכיר לך מאוחר יותר?</span>
        <SignupAlarmIcon />
      </button>
      <div
        className="relative w-full shrink-0 overflow-hidden"
        style={{ height: SIGNUP_CHILD_INVITE_HOME_INDICATOR_H_PX }}
        aria-hidden
      >
        <div className="absolute left-[32.27%] right-[32%] top-[21px] h-[5px] rounded-[10px] bg-white" />
      </div>
    </div>
  );
}
