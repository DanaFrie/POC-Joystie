'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Link2, Check } from 'lucide-react';
import type { WeeklyUpload } from '@/types/firestore';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('NotificationsPanel');

interface NotificationsPanelProps {
  variant?: 'light' | 'dark';
  challengeNotStarted?: boolean;
  challengeStartDate?: string;
  childName?: string;
  childGender?: 'boy' | 'girl';
  parentName?: string;
  parentGender?: 'male' | 'female';
  setupUrl?: string;
  uploadUrl?: string;
  redemptionUrl?: string;
  weeklyUpload?: WeeklyUpload | null;
  onOpenWeeklyReview?: () => void;
  childSetupCompleted?: boolean;
  noChallengeExists?: boolean;
}

function useNotificationStyles(variant: 'light' | 'dark') {
  if (variant === 'dark') {
    return {
      panel: '',
      title: 'mb-2 font-simpler text-[11px] font-black uppercase tracking-[0.12em] text-v03-green-200',
      card: 'rounded-[16px] border border-white/15 bg-white/5 p-3.5 backdrop-blur-sm',
      cardAccent: 'rounded-[16px] border border-[#1BECAE]/35 bg-[#1BECAE]/10 p-3.5',
      heading: 'mb-1.5 text-right font-simpler text-[14px] font-bold text-white',
      body: 'text-right font-simpler text-[13px] leading-relaxed text-v03-green-100',
      primaryBtn:
        'flex w-full items-center justify-center gap-2 rounded-[18px] bg-white px-4 py-3 font-simpler text-[14px] font-bold text-v03-green-900 transition hover:brightness-95',
      copiedBtn:
        'flex w-full items-center justify-center gap-2 rounded-[18px] border border-[#1BECAE] bg-[#1BECAE]/15 px-4 py-3 font-simpler text-[14px] font-bold text-white',
      empty: 'py-1 text-right font-simpler text-[13px] text-v03-green-200',
      subtitle: 'mt-2 text-right font-simpler text-[12px] leading-relaxed text-v03-green-200',
    };
  }

  return {
    panel: 'rounded-[22px] border border-v03-green-100 bg-v03-white p-4 shadow-sm',
    title: 'mb-3 font-simpler text-[16px] font-bold text-v03-text-on-light',
    card: 'rounded-[18px] border border-v03-green-200 bg-v03-green-200/20 p-4',
    cardAccent: 'rounded-[18px] border border-v03-turquoise-300 bg-v03-turquoise-300/10 p-4',
    heading: 'mb-2 text-center font-simpler text-[14px] font-bold text-v03-text-on-light',
    body: 'text-center font-simpler text-[13px] leading-relaxed text-v03-green-700',
    primaryBtn:
      'flex w-full items-center justify-center gap-2 rounded-[18px] bg-v03-green-900 px-4 py-3 font-simpler text-[14px] font-bold text-white transition hover:brightness-95',
    copiedBtn:
      'flex w-full items-center justify-center gap-2 rounded-[18px] border-2 border-v03-green-200 bg-v03-green-200/30 px-4 py-3 font-simpler text-[14px] font-bold text-v03-text-on-light',
    empty: 'py-2 text-center font-simpler text-[14px] text-v03-green-700',
    subtitle: 'mt-2 px-2 text-center font-simpler text-[12px] leading-relaxed text-v03-green-700',
  };
}

export default function NotificationsPanel({
  variant = 'dark',
  challengeNotStarted,
  challengeStartDate,
  childName,
  parentGender,
  setupUrl,
  redemptionUrl,
  weeklyUpload,
  childSetupCompleted,
  noChallengeExists,
}: NotificationsPanelProps) {
  const [copied, setCopied] = useState(false);
  const s = useNotificationStyles(variant);

  const getRelativeDayText = (dateStr?: string): string => {
    if (!dateStr) return '';

    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const targetDayName = dayNames[targetDate.getDay()];

    if (diffDays === 0) return 'היום';
    if (diffDays === 1) return 'מחר';
    if (diffDays >= 2 && diffDays <= 6) {
      const suffix = targetDate.getDay() === 6 ? 'הקרובה' : 'הקרוב';
      return `${targetDayName} ${suffix}`;
    }
    if (diffDays >= 7 && diffDays <= 13) return `${targetDayName} הבא`;
    if (diffDays >= 14 && diffDays <= 20) return `${targetDayName} בעוד שבועיים`;
    return `בעוד ${diffDays} ימים`;
  };

  const parentGenderValue = parentGender || 'female';
  const sendVerb = parentGenderValue === 'female' ? 'שלחי' : 'שלח';

  const hasNotifications =
    noChallengeExists || Boolean(challengeNotStarted && challengeStartDate);

  const handleCopyUrl = async (url: string) => {
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('Failed to copy URL:', error);
    }
  };

  let urlToCopy: string | undefined;
  if (!childSetupCompleted && setupUrl) {
    urlToCopy = setupUrl;
  } else if (redemptionUrl) {
    urlToCopy = redemptionUrl;
  }

  const showCopyButton = !!childName && !!urlToCopy;
  const buttonText = `קישור לעמוד של ${childName}`;
  const subtitleText = `${sendVerb} את הקישור ל${childName} דרך וואטסאפ או הודעה`;
  const copiedSubtitleText = `הקישור הועתק! הדבקי אותו בהודעה ל${childName}`;

  const content = (
    <>
      <h2 className={s.title}>עדכונים</h2>

      {noChallengeExists && (
        <div className={`${s.card} mb-2`}>
          <h3 className={s.heading}>ברוכים הבאים! 👋</h3>
          <p className={`${s.body} mb-3`}>
            כדי להתחיל, יש להגדיר אתגר ראשון עבור הילד שלכם.
          </p>
          <Link href="/onboarding" className={s.primaryBtn}>
            התחל אתגר
          </Link>
        </div>
      )}

      {challengeNotStarted && challengeStartDate && (
        <div className={`${s.cardAccent} mb-2`}>
          <h3 className={s.heading}>{getRelativeDayText(challengeStartDate)} האתגר מתחיל! 🎉</h3>
          <p className={s.body}>התכוננו להתחלה מרגשת!</p>
        </div>
      )}

      {weeklyUpload?.status === 'approved' && !challengeNotStarted && (
        <div className={`${s.card} mb-2`}>
          <h3 className={s.heading}>מוכנים לאתגר הבא?</h3>
          <p className={`${s.body} mb-3`}>
            הגדירו אתגר חדש עבור {childName} כדי להמשיך.
          </p>
          <Link href="/onboarding" className={s.primaryBtn}>
            בניית אתגר חדש
          </Link>
        </div>
      )}

      {showCopyButton && urlToCopy && !challengeNotStarted && weeklyUpload?.status !== 'approved' && (
        <div className={`${s.card} mb-2`}>
          <button
            type="button"
            onClick={() => urlToCopy && handleCopyUrl(urlToCopy)}
            className={copied ? s.copiedBtn : s.primaryBtn}
          >
            {copied ? (
              <>
                <Check size={18} className="shrink-0" />
                <span>הועתק!</span>
              </>
            ) : (
              <>
                <Link2 size={18} className="shrink-0" />
                <span>{buttonText}</span>
              </>
            )}
          </button>
          <p className={s.subtitle}>{copied ? copiedSubtitleText : subtitleText}</p>
        </div>
      )}

      {!hasNotifications && !showCopyButton && weeklyUpload?.status !== 'approved' && (
        <p className={s.empty}>אין עדכונים חדשים</p>
      )}
    </>
  );

  if (variant === 'dark') {
    return <section className="w-full">{content}</section>;
  }

  return <section className={s.panel}>{content}</section>;
}
