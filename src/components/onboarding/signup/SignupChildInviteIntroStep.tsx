'use client';

import { SignupChildInviteHeroBlock } from '@/components/onboarding/signup/SignupChildInviteHeroBlock';
import { SignupAlarmIcon, SignupChildInviteAlertIcon } from '@/components/onboarding/signup/SignupChildInviteIcons';
import {
  SIGNUP_CHILD_INVITE_ACTION_BTN_CLASS,
  SIGNUP_CHILD_INVITE_ALERT_BOX_RADIUS_PX,
  SIGNUP_CHILD_INVITE_ALERT_INNER_GAP_PX,
  SIGNUP_CHILD_INVITE_ALERT_PAD_X_PX,
  SIGNUP_CHILD_INVITE_ALERT_PAD_Y_PX,
  SIGNUP_CHILD_INVITE_ALERT_TEXT_W_PX,
  SIGNUP_CHILD_INVITE_INTRO_ACTIONS_GAP_PX,
  SIGNUP_CHILD_INVITE_INTRO_ACTIONS_PT_PX,
  SIGNUP_CHILD_INVITE_INTRO_BUTTONS_GAP_PX,
  SIGNUP_CHILD_INVITE_INTRO_COLUMN_GAP_PX,
  SIGNUP_CHILD_INVITE_INTRO_TOP_PX,
} from '@/constants/signup-child-invite-layout';

type SignupChildInviteIntroStepProps = {
  childName: string;
  onTogetherNow: () => void;
  onRemindLater: () => void;
};

/** Figma 12914:11767 — hero + «שנכניס את {child} לתמונה?» + together / remind. */
export function SignupChildInviteIntroStep({
  childName,
  onTogetherNow,
  onRemindLater,
}: SignupChildInviteIntroStepProps) {
  return (
    <div
      dir="rtl"
      className="absolute left-v03-gutter z-[10] flex w-v03-content flex-col items-stretch"
      style={{
        top: SIGNUP_CHILD_INVITE_INTRO_TOP_PX,
        gap: SIGNUP_CHILD_INVITE_INTRO_COLUMN_GAP_PX,
      }}
      aria-label="הצטרפות ילד — התחלה"
    >
      <SignupChildInviteHeroBlock childName={childName} />

      <div
        className="v03-funnel-enter-2 flex w-full flex-col items-center justify-center rounded-[15px] bg-white/20"
        style={{ borderRadius: SIGNUP_CHILD_INVITE_ALERT_BOX_RADIUS_PX }}
      >
        <div
          className="flex w-full flex-col items-center justify-center"
          style={{
            gap: SIGNUP_CHILD_INVITE_ALERT_INNER_GAP_PX,
            paddingLeft: SIGNUP_CHILD_INVITE_ALERT_PAD_X_PX,
            paddingRight: SIGNUP_CHILD_INVITE_ALERT_PAD_X_PX,
            paddingTop: SIGNUP_CHILD_INVITE_ALERT_PAD_Y_PX,
            paddingBottom: SIGNUP_CHILD_INVITE_ALERT_PAD_Y_PX,
          }}
        >
          <SignupChildInviteAlertIcon />
          <p
            className="text-center font-simpler text-[20px] font-normal leading-[1.2] tracking-[-0.3px] text-white"
            style={{ maxWidth: SIGNUP_CHILD_INVITE_ALERT_TEXT_W_PX }}
          >
            <span>יש לבצע את תהליך הצירוף של {childName} כשאתם </span>
            <span>נמצאים אחד ליד השני</span>
          </p>
        </div>
      </div>

      <div
        className="v03-funnel-enter-3 flex w-full flex-col items-stretch justify-end"
        style={{
          paddingTop: SIGNUP_CHILD_INVITE_INTRO_ACTIONS_PT_PX,
          gap: SIGNUP_CHILD_INVITE_INTRO_ACTIONS_GAP_PX,
        }}
      >
        <div
          className="flex w-full flex-col"
          style={{ gap: SIGNUP_CHILD_INVITE_INTRO_BUTTONS_GAP_PX }}
        >
          <button
            type="button"
            onClick={onTogetherNow}
            className={`${SIGNUP_CHILD_INVITE_ACTION_BTN_CLASS} bg-white text-v03-turquoise-950 hover:brightness-95`}
          >
            <span className="whitespace-nowrap text-center">
              {childName} לידי, בואו נתחיל
            </span>
          </button>

          <button
            type="button"
            onClick={onRemindLater}
            className={`${SIGNUP_CHILD_INVITE_ACTION_BTN_CLASS} border border-solid border-white text-white hover:bg-white/5`}
          >
            <span className="whitespace-nowrap text-center">תזכירו לי מאוחר יותר</span>
            <SignupAlarmIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
