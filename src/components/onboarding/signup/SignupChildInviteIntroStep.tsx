'use client';

import { SignupChildInviteHeroBlock } from '@/components/onboarding/signup/SignupChildInviteHeroBlock';
import { SignupAlarmIcon, SignupChildInviteAlertIcon } from '@/components/onboarding/signup/SignupChildInviteIcons';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import {
  SIGNUP_CHILD_INVITE_ACTION_BTN_CLASS,
  SIGNUP_CHILD_INVITE_ALERT_BOX_RADIUS_PX,
  SIGNUP_CHILD_INVITE_ALERT_INNER_GAP_PX,
  SIGNUP_CHILD_INVITE_ALERT_PAD_X_PX,
  SIGNUP_CHILD_INVITE_ALERT_PAD_Y_PX,
  SIGNUP_CHILD_INVITE_ALERT_TEXT_W_PX,
  SIGNUP_CHILD_INVITE_HERO_PX,
  SIGNUP_CHILD_INVITE_INTRO_FRAME_W_PX,
  SIGNUP_CHILD_INVITE_INTRO_BUTTONS_GAP_PX,
  SIGNUP_CHILD_INVITE_INTRO_COLUMN_GAP_PX,
  SIGNUP_CHILD_INVITE_INTRO_TOP_PX,
} from '@/constants/signup-child-invite-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

function useChildInviteIntroScale() {
  const { usableCanvasHeightPx } = useFunnelViewportMetrics();
  const vhScale = usableCanvasHeightPx / V03_SCREEN_HEIGHT;

  const scaledPx = (figmaPx: number) => Math.round(figmaPx * vhScale);

  return {
    topPx: scaledPx(SIGNUP_CHILD_INVITE_INTRO_TOP_PX),
    heroSizePx: scaledPx(SIGNUP_CHILD_INVITE_HERO_PX),
    buttonsGapPx: scaledPx(SIGNUP_CHILD_INVITE_INTRO_BUTTONS_GAP_PX),
  };
}

type SignupChildInviteIntroActionsProps = {
  childName: string;
  onTogetherNow: () => void;
  onRemindLater: () => void;
};

/** Bottom frame — Figma child frame: full 327px width, stacked CTAs. */
export function SignupChildInviteIntroActions({
  childName,
  onTogetherNow,
  onRemindLater,
}: SignupChildInviteIntroActionsProps) {
  const { buttonsGapPx } = useChildInviteIntroScale();

  return (
    <div className="v03-funnel-enter-3 flex w-full flex-col items-center">
      <div
        className="flex w-full flex-col items-stretch"
        style={{ gap: buttonsGapPx }}
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
  );
}

type SignupChildInviteIntroStepProps = {
  childName: string;
  onTogetherNow: () => void;
  onRemindLater: () => void;
  /** 100vh funnel — upper column only; actions render in foreground footer. */
  flow?: boolean;
};

/** Figma 12914:11767 — hero + «שנכניס את {child} לתמונה?» + alert + CTAs. */
export function SignupChildInviteIntroStep({
  childName,
  onTogetherNow,
  onRemindLater,
  flow = false,
}: SignupChildInviteIntroStepProps) {
  const { topPx, heroSizePx } = useChildInviteIntroScale();

  const alertBlock = (
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
  );

  const actionsBlock = (
    <SignupChildInviteIntroActions
      childName={childName}
      onTogetherNow={onTogetherNow}
      onRemindLater={onRemindLater}
    />
  );

  if (flow) {
    return (
      <div
        dir="rtl"
        className="pointer-events-auto flex h-full min-h-0 w-full flex-col items-center justify-between"
        aria-label="הצטרפות ילד — התחלה"
      >
        <div
          className="mx-auto flex w-full shrink-0 flex-col items-center"
          style={{
            width: SIGNUP_CHILD_INVITE_INTRO_FRAME_W_PX,
            paddingTop: topPx,
          }}
        >
          <SignupChildInviteHeroBlock childName={childName} heroSizePx={heroSizePx} />
        </div>

        <div
          className="mx-auto w-full shrink-0"
          style={{ width: SIGNUP_CHILD_INVITE_INTRO_FRAME_W_PX }}
        >
          {alertBlock}
        </div>

        <div
          className="mx-auto w-full shrink-0"
          style={{ width: SIGNUP_CHILD_INVITE_INTRO_FRAME_W_PX }}
        >
          {actionsBlock}
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="absolute left-v03-gutter z-[10] flex flex-col items-center"
      style={{
        top: SIGNUP_CHILD_INVITE_INTRO_TOP_PX,
        width: SIGNUP_CHILD_INVITE_INTRO_FRAME_W_PX,
        gap: SIGNUP_CHILD_INVITE_INTRO_COLUMN_GAP_PX,
      }}
      aria-label="הצטרפות ילד — התחלה"
    >
      <SignupChildInviteHeroBlock childName={childName} heroSizePx={heroSizePx} />
      {alertBlock}
      {actionsBlock}
    </div>
  );
}
