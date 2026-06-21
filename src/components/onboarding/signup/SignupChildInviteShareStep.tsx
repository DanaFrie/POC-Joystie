'use client';

import { useState } from 'react';
import { SignupChildInviteHeroBlock } from '@/components/onboarding/signup/SignupChildInviteHeroBlock';
import {
  SignupCopyLinkIcon,
  SignupWhatsAppIcon,
} from '@/components/onboarding/signup/SignupChildInviteIcons';
import {
  SIGNUP_CHILD_INVITE_BUTTONS_GAP_PX,
  SIGNUP_CHILD_INVITE_FOOTNOTE_MAX_W_PX,
  SIGNUP_CHILD_INVITE_SHARE_INNER_GAP_PX,
  SIGNUP_CHILD_INVITE_SHARE_OUTER_GAP_PX,
  SIGNUP_CHILD_INVITE_SHARE_W_PX,
} from '@/constants/signup-child-invite-layout';
import {
  prepareBondingInvite,
  shareBondingViaWhatsApp,
} from '@/lib/onboarding/bondingShare';
import { getBondingChildUrl } from '@/lib/onboarding/bondingInvite';
import { getOnboardingParentRole, parentRoleToGender } from '@/lib/onboarding/parentRole';
import { buildWhatsAppChildInviteMessage } from '@/lib/share/whatsapp';

function getParentGenderForMessage(): 'female' | 'male' {
  const role = getOnboardingParentRole();
  return role ? parentRoleToGender(role) : 'male';
}

type SignupChildInviteShareStepProps = {
  childName: string;
  onShared?: () => void;
};

const actionBtnClass =
  'inline-flex h-[55px] w-full items-center justify-center gap-2 rounded-[22px] px-[15px] py-2 font-simpler text-[18px] font-bold shadow-[2px_2px_20px_rgba(109,109,109,0.15)] transition';

/** Figma 12703:42221 — hero, WhatsApp / copy link, footnote (vertically centered). */
export function SignupChildInviteShareStep({
  childName,
  onShared,
}: SignupChildInviteShareStepProps) {
  const [copied, setCopied] = useState(false);
  const [childUrl, setChildUrl] = useState(() => getBondingChildUrl());
  const [shareError, setShareError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  const ensureInvite = async () => {
    if (childUrl && childUrl.includes('token=')) return childUrl;
    setPreparing(true);
    setShareError(null);
    try {
      const result = await prepareBondingInvite({
        childName,
      });
      setChildUrl(result.childUrl);
      return result.childUrl;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'לא הצלחנו להכין את הלינק';
      setShareError(message);
      throw error;
    } finally {
      setPreparing(false);
    }
  };

  const handleWhatsApp = async () => {
    try {
      const url = await ensureInvite();
      let advanced = false;
      const advanceAfterReturn = () => {
        if (advanced || document.visibilityState !== 'visible') return;
        advanced = true;
        document.removeEventListener('visibilitychange', advanceAfterReturn);
        onShared?.();
      };
      document.addEventListener('visibilitychange', advanceAfterReturn);
      await shareBondingViaWhatsApp({
        childName,
        childUrl: url,
        parentGender: getParentGenderForMessage(),
      });
    } catch {
      // error surfaced via shareError
    }
  };

  const handleCopy = async () => {
    try {
      const url = await ensureInvite();
      const message = buildWhatsAppChildInviteMessage({
        childUrl: url,
        parentGender: getParentGenderForMessage(),
      });
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      onShared?.();
    } catch {
      const url = childUrl || getBondingChildUrl();
      const message = buildWhatsAppChildInviteMessage({
        childUrl: url,
        parentGender: getParentGenderForMessage(),
      });
      window.prompt('העתיקו את ההודעה:', message);
      onShared?.();
    }
  };

  return (
    <div
      dir="rtl"
      className="absolute left-1/2 top-1/2 z-[10] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{
        width: SIGNUP_CHILD_INVITE_SHARE_W_PX,
        gap: SIGNUP_CHILD_INVITE_SHARE_OUTER_GAP_PX,
      }}
      aria-label="שיתוף הזמנה לילד"
    >
      <div
        className="flex w-full flex-col items-stretch"
        style={{ gap: SIGNUP_CHILD_INVITE_SHARE_INNER_GAP_PX }}
      >
        <SignupChildInviteHeroBlock childName={childName} />

        <div
          className="v03-funnel-enter-2 flex w-full flex-col"
          style={{ gap: SIGNUP_CHILD_INVITE_BUTTONS_GAP_PX }}
        >
          <button
            type="button"
            onClick={handleWhatsApp}
            disabled={preparing}
            className={`${actionBtnClass} bg-v03-turquoise-300 text-[#031d15] hover:brightness-105 disabled:opacity-60`}
          >
            <span className="whitespace-nowrap text-right">
              {preparing ? 'מכינים לינק...' : 'שיתוף בוואטסאפ'}
            </span>
            <SignupWhatsAppIcon />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={preparing}
            className={`${actionBtnClass} border border-solid border-white text-white hover:bg-white/5 disabled:opacity-60`}
          >
            <span className="whitespace-nowrap text-right">
              {copied ? 'הלינק הועתק' : 'העתקת לינק'}
            </span>
            <SignupCopyLinkIcon />
          </button>
        </div>
      </div>

      {shareError ? (
        <p className="text-center font-simpler text-sm text-red-300">{shareError}</p>
      ) : null}

      <p
        className="v03-funnel-enter-3 shrink-0 text-center font-simpler text-base font-normal leading-[1.35] tracking-[-0.24px] text-v03-green-200"
        style={{ maxWidth: SIGNUP_CHILD_INVITE_FOOTNOTE_MAX_W_PX }}
      >
        דרך הלינק שישותף עם {childName}, יתחיל התהליך המשותף שלכם
      </p>
    </div>
  );
}
