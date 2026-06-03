'use client';

import { useState } from 'react';
import {
  SignupCopyLinkIcon,
  SignupWhatsAppIcon,
} from '@/components/onboarding/signup/SignupChildInviteIcons';
import {
  SIGNUP_CHILD_INVITE_BUTTONS_GAP_PX,
  SIGNUP_CHILD_INVITE_CONTENT_W_PX,
  SIGNUP_CHILD_INVITE_FOOTNOTE_MAX_W_PX,
  SIGNUP_CHILD_INVITE_OUTER_GAP_PX,
  SIGNUP_CHILD_INVITE_SECTION_GAP_PX,
  SIGNUP_CHILD_INVITE_SHARE_TOP_PX,
} from '@/constants/signup-child-invite-layout';
import { getBondingChildUrl } from '@/lib/onboarding/bondingInvite';
import { openWhatsAppChildInvite } from '@/lib/share/whatsapp';

type SignupChildInviteShareStepProps = {
  childName: string;
};

const actionBtnClass =
  'inline-flex h-[55px] w-full items-center justify-center gap-2 rounded-[22px] px-[15px] py-2 font-simpler text-[18px] font-bold shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition';

/** Figma 12703:42221 — WhatsApp / copy link + footnote. */
export function SignupChildInviteShareStep({ childName }: SignupChildInviteShareStepProps) {
  const [copied, setCopied] = useState(false);

  const childUrl = getBondingChildUrl();

  const handleWhatsApp = () => {
    openWhatsAppChildInvite(childName, childUrl);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(childUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('העתיקו את הלינק:', childUrl);
    }
  };

  return (
    <div
      dir="rtl"
      className="absolute left-1/2 z-[10] flex -translate-x-1/2 flex-col items-center"
      style={{
        top: SIGNUP_CHILD_INVITE_SHARE_TOP_PX,
        width: SIGNUP_CHILD_INVITE_CONTENT_W_PX,
        gap: SIGNUP_CHILD_INVITE_OUTER_GAP_PX,
      }}
      aria-label="שיתוף הזמנה לילד"
    >
      <div
        className="flex w-full flex-col items-stretch"
        style={{ gap: SIGNUP_CHILD_INVITE_SECTION_GAP_PX }}
      >
        <p className="w-full text-center font-simpler text-[20px] font-normal leading-[1.2] tracking-[-0.3px] text-[#CADCD6]">
          *כדאי לבצע את תהליך הצירוף של {childName} כשאתם נמצאים אחד ליד השני
        </p>

        <div
          className="flex w-full flex-col"
          style={{ gap: SIGNUP_CHILD_INVITE_BUTTONS_GAP_PX }}
        >
          <button
            type="button"
            onClick={handleWhatsApp}
            className={`${actionBtnClass} bg-[#1BECAE] text-[#031D15] hover:brightness-105`}
          >
            <span>שיתוף בוואטסאפ</span>
            <SignupWhatsAppIcon />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`${actionBtnClass} border border-solid border-white text-white hover:bg-white/5`}
          >
            <span>{copied ? 'הלינק הועתק' : 'העתקת לינק'}</span>
            <SignupCopyLinkIcon />
          </button>
        </div>
      </div>

      <p
        className="shrink-0 text-center font-simpler text-base font-normal leading-[1.35] tracking-[-0.24px] text-[#B0C6BF]"
        style={{ maxWidth: SIGNUP_CHILD_INVITE_FOOTNOTE_MAX_W_PX }}
      >
        דרך הלינק שישותף עם {childName}, יתחיל התהליך המשותף שלכם
      </p>
    </div>
  );
}
