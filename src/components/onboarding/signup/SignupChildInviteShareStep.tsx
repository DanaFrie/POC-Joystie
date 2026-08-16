'use client';

import { useEffect, useState } from 'react';
import { TrackAnalyticsEvent } from '@/components/analytics/TrackAnalyticsEvent';
import { SignupChildInviteHeroBlock } from '@/components/onboarding/signup/SignupChildInviteHeroBlock';
import {
  SignupCopyLinkIcon,
  SignupWhatsAppIcon,
} from '@/components/onboarding/signup/SignupChildInviteIcons';
import {
  SIGNUP_CHILD_INVITE_ACTION_BTN_CLASS,
  SIGNUP_CHILD_INVITE_BUTTONS_GAP_PX,
  SIGNUP_CHILD_INVITE_FOOTNOTE_MAX_W_PX,
  SIGNUP_CHILD_INVITE_SHARE_INNER_GAP_PX,
  SIGNUP_CHILD_INVITE_SHARE_OUTER_GAP_PX,
} from '@/constants/signup-child-invite-layout';
import {
  prepareBondingInvite,
  shareBondingViaWhatsApp,
} from '@/lib/onboarding/bondingShare';
import { getBondingChildUrl } from '@/lib/onboarding/bondingInvite';
import { getBondingInviteIdFromUrl } from '@/lib/onboarding/bondingInviteUrl';
import { resolveBondingInvite } from '@/lib/api/bonding';
import { getOnboardingParentRole, parentRoleToGender } from '@/lib/onboarding/parentRole';
import { AnalyticsEvents } from '@/utils/analytics';
import { parseBondingInviteQueryParams } from '@/utils/url-encoding';

function getParentGenderForMessage(): 'female' | 'male' {
  const role = getOnboardingParentRole();
  return role ? parentRoleToGender(role) : 'male';
}

/** True when cached invite URL already matches this child name/gender. */
function inviteMatchesChild(
  url: string,
  childName: string,
  childGender?: 'boy' | 'girl'
): boolean {
  if (!url.includes('invite=')) return false;
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://joystie.com');
    const meta = parseBondingInviteQueryParams(parsed.searchParams);
    if (meta.childName?.trim() !== childName.trim()) return false;
    if (childGender && meta.childGender && meta.childGender !== childGender) return false;
    if (childGender && !meta.childGender) return false;
    return true;
  } catch {
    return false;
  }
}

type SignupChildInviteShareStepProps = {
  childName: string;
  childGender?: 'boy' | 'girl';
  onShared?: () => void;
  /** 100vh funnel — centered column in foreground main. */
  flow?: boolean;
};

/** Figma 12703:42221 — hero, WhatsApp / copy link, footnote. */
export function SignupChildInviteShareStep({
  childName,
  childGender,
  onShared,
  flow = false,
}: SignupChildInviteShareStepProps) {
  const [copied, setCopied] = useState(false);
  const [childUrl, setChildUrl] = useState(() => {
    const cached = getBondingChildUrl();
    return inviteMatchesChild(cached, childName, childGender) ? cached : '';
  });
  const [shareError, setShareError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  const ensureInvite = async (): Promise<string> => {
    if (inviteMatchesChild(childUrl, childName, childGender)) {
      const inviteId = getBondingInviteIdFromUrl(childUrl);
      if (inviteId) {
        try {
          await resolveBondingInvite(inviteId);
          return childUrl;
        } catch {
          // Cached URL is consumed/expired — mint a new live invite below.
        }
      }
    }
    setPreparing(true);
    setShareError(null);
    try {
      const result = await prepareBondingInvite({
        childName,
        childGender,
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

  useEffect(() => {
    void ensureInvite().catch(() => {
      // shareError set inside ensureInvite
    });
    // Rebuild when name/gender change — never reuse a stale cn/cg invite.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ensureInvite closes over latest props
  }, [childName, childGender]);

  const inviteReady = inviteMatchesChild(childUrl, childName, childGender);

  const handleWhatsApp = () => {
    if (!inviteReady) return;

    // Advance immediately so session start precedes child opening the link.
    onShared?.();

    shareBondingViaWhatsApp({
      childName,
      childUrl,
      parentGender: getParentGenderForMessage(),
    });
  };

  const handleCopy = async () => {
    try {
      const url = await ensureInvite();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      onShared?.();
    } catch {
      const url = childUrl || getBondingChildUrl();
      window.prompt('העתיקו את הלינק:', url);
      onShared?.();
    }
  };

  const body = (
    <>
      <TrackAnalyticsEvent event={AnalyticsEvents.CHILD_INVITE_LINK} />
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
            disabled={preparing || !inviteReady}
            className={`${SIGNUP_CHILD_INVITE_ACTION_BTN_CLASS} bg-v03-turquoise-300 text-v03-green-900 hover:brightness-105 disabled:opacity-60`}
          >
            <span className="whitespace-nowrap text-right">
              {preparing
                ? 'מכינים לינק...'
                : !inviteReady
                  ? 'מכינים לינק...'
                  : 'שיתוף בוואטסאפ'}
            </span>
            <SignupWhatsAppIcon />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={preparing}
            className={`${SIGNUP_CHILD_INVITE_ACTION_BTN_CLASS} border border-solid border-white text-white hover:bg-white/5 disabled:opacity-60`}
          >
            <span className="whitespace-nowrap text-center">
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
    </>
  );

  if (flow) {
    return (
      <div
        dir="rtl"
        className="pointer-events-auto mx-auto flex w-full max-w-v03-content flex-col items-stretch self-stretch"
        style={{ gap: SIGNUP_CHILD_INVITE_SHARE_OUTER_GAP_PX }}
        aria-label="שיתוף הזמנה לילד"
      >
        {body}
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="absolute left-v03-gutter top-1/2 z-[10] flex w-v03-content -translate-y-1/2 flex-col items-stretch"
      style={{ gap: SIGNUP_CHILD_INVITE_SHARE_OUTER_GAP_PX }}
      aria-label="שיתוף הזמנה לילד"
    >
      {body}
    </div>
  );
}
