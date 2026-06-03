'use client';

import { useState } from 'react';
import { SignupAlarmIcon, SignupChildInviteAlertIcon } from '@/components/onboarding/signup/SignupChildInviteIcons';
import {
  SIGNUP_CHILD_INVITE_ALERT_BOX_RADIUS_PX,
  SIGNUP_CHILD_INVITE_HERO_PX,
  SIGNUP_CHILD_INVITE_HOME_INDICATOR_H_PX,
  SIGNUP_CHILD_INVITE_INTRO_BUTTONS_GAP_PX,
  SIGNUP_CHILD_INVITE_INTRO_COLUMN_GAP_PX,
  SIGNUP_CHILD_INVITE_INTRO_TOP_PX,
} from '@/constants/signup-child-invite-layout';
import { SIGNUP_CHILD_INVITE_HERO_IMAGE } from '@/constants/onboarding-figma';

type SignupChildInviteIntroStepProps = {
  childName: string;
  onTogetherNow: () => void;
  onRemindLater: () => void;
};

const actionBtnClass =
  'inline-flex h-[55px] w-full items-center justify-center gap-2 rounded-[22px] px-[15px] py-2 font-simpler text-[18px] font-bold shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition';

/** Figma 12914:11767 — hero + «שנכניס את {child} לתמונה?» + together / remind. */
export function SignupChildInviteIntroStep({
  childName,
  onTogetherNow,
  onRemindLater,
}: SignupChildInviteIntroStepProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      dir="rtl"
      className="absolute right-v03-gutter top-0 z-[10] flex w-v03-content flex-col items-center"
      style={{
        top: SIGNUP_CHILD_INVITE_INTRO_TOP_PX,
        gap: SIGNUP_CHILD_INVITE_INTRO_COLUMN_GAP_PX,
      }}
      aria-label="הצטרפות ילד — התחלה"
    >
      <div className="flex w-full max-w-[332px] flex-col items-center">
        <div
          className="relative shrink-0 overflow-hidden"
          style={{
            width: SIGNUP_CHILD_INVITE_HERO_PX,
            height: SIGNUP_CHILD_INVITE_HERO_PX,
          }}
        >
          {!imageFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={SIGNUP_CHILD_INVITE_HERO_IMAGE}
              alt=""
              className="pointer-events-none size-full object-cover"
              onError={() => setImageFailed(true)}
            />
          )}
          <div
            className="pointer-events-none absolute left-0 top-[66px] h-[134px] w-[31px]"
            style={{
              backgroundImage:
                'linear-gradient(95.81deg, rgba(9, 33, 37, 0) 20.98%, rgb(9, 33, 37) 86.28%)',
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-0 top-[66px] h-[134px] w-[31px]"
            style={{
              backgroundImage:
                'linear-gradient(274.19deg, rgba(9, 33, 37, 0) 20.98%, rgb(9, 33, 37) 86.28%)',
            }}
            aria-hidden
          />
        </div>

        <h1 className="mt-0 w-full text-center font-simpler text-[40px] font-black leading-[1.1] tracking-[-0.8px] text-white">
          שנכניס את {childName} לתמונה?
        </h1>
      </div>

      <div
        className="flex w-full flex-col items-center rounded-[15px] bg-white/20"
        style={{ borderRadius: SIGNUP_CHILD_INVITE_ALERT_BOX_RADIUS_PX }}
      >
        <div className="flex w-full max-w-[294px] flex-col items-center gap-3 px-[19px] py-4">
          <SignupChildInviteAlertIcon />
          <p className="text-center font-simpler text-[20px] font-normal leading-[1.2] tracking-[-0.3px] text-white">
            יש לבצע את תהליך הצירוף של {childName} כשאתם נמצאים אחד ליד השני
          </p>
        </div>
      </div>

      <div
        className="flex w-full flex-col pt-5"
        style={{ gap: SIGNUP_CHILD_INVITE_INTRO_BUTTONS_GAP_PX }}
      >
        <button
          type="button"
          onClick={onTogetherNow}
          className={`${actionBtnClass} bg-white text-[#031D15] hover:brightness-95`}
        >
          {childName} לידי, בואו נתחיל
        </button>

        <button
          type="button"
          onClick={onRemindLater}
          className={`${actionBtnClass} border border-solid border-white text-white hover:bg-white/5`}
        >
          <span>תזכירו לי מאוחר יותר</span>
          <SignupAlarmIcon />
        </button>
      </div>

      <div
        className="relative mt-5 w-full shrink-0 overflow-hidden"
        style={{ height: SIGNUP_CHILD_INVITE_HOME_INDICATOR_H_PX }}
        aria-hidden
      >
        <div className="absolute left-[32.27%] right-[32%] top-[21px] h-[5px] rounded-[10px] bg-white" />
      </div>
    </div>
  );
}
