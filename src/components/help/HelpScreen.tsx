'use client';

import { useRef } from 'react';
import { JoystieCompactMark } from '@/components/brand/JoystieCompactMark';
import { FunnelMintEllipse } from '@/components/onboarding/game/FunnelMintEllipse';
import { OnboardingBackButton } from '@/components/onboarding/OnboardingBackButton';
import { LANDING_FOOTER_LINKS } from '@/constants/landing-marketing';
import {
  ONBOARDING_BACK_HEIGHT_PX,
  ONBOARDING_BACK_SCROLL_GAP_PX,
  ONBOARDING_BACK_TOP_PX,
} from '@/constants/onboarding-funnel-motion';
import { useGrowFunnelCanvasHeight } from '@/hooks/useGrowFunnelCanvasHeight';

const FAQ_ITEMS = [
  {
    question: 'איך מתחילים דיל?',
    answer:
      'בלוח הבקרה בוחרים יצירת דיל או טעינת ארנק. מגדירים דמי כיס לארנק ומחיר לשעת מסך, ושולחים לילד/ה. הארנק נטען רק אחרי שהילד/ה מאשרים - והשבוע מתחיל למחרת.',
  },
  {
    question: 'מה הילד/ה צריכים לעשות במהלך השבוע?',
    answer:
      'אין העלאות יומיות. הארנק כבר טעון, וכל שעת מסך מורידה מהתקציב לפי המחיר שהגדרתם. בסוף 6 הימים מעלים צילום מסך אחד של זמן המסך (Screen Time / Family Link).',
  },
  {
    question: 'מה מעלים בסוף השבוע?',
    answer:
      'צילום של סיכום זמן המסך לשבוע. המערכת קוראת את הצילום ומציגה כמה נשאר בארנק - ואז מאשרים ב«אישור השבוע».',
  },
  {
    question: 'מה קורה אחרי אישור השבוע?',
    answer:
      'זה הרגע המשותף שלכם - מפגש סיום קצר של הורה וילד/ה: עוברים יחד על השבוע, סוגרים את הדיל, ואם נשאר כסף בארנק הילד/ה מסמנים מה לעשות איתו: מזומן, פעילות משותפת, תרומה או חיסכון.',
  },
  {
    question: 'איך מחשבים כמה נשאר בארנק?',
    answer:
      'דמי הכיס שהטענתם פחות (שעות מסך × מחיר לשעה). ככל שפחות שעות מסך - נשאר יותר בארנק.',
  },
  {
    question: 'הילד/ה לא רואים דילים או שהארנק סגור',
    answer:
      'לרוב חסרה גישה מצד ההורה (מנוי), או שהילד/ה עדיין לא אישרו את הדיל שנשלח. בדקו שהגישה לדילים פתוחה ושנשלח דיל פעיל.',
  },
  {
    question: 'הילד/ה לא מוצאים את הקישור לארנק',
    answer:
      'בלוח הבקרה שלכם אפשר להעתיק את הלינק לארנק של הילד/ה (פעולה מהירה: «העתקת לינק לארנק») ולשלוח אותו בהודעה או בוואטסאפ - כך הם נכנסים ישירות לארנק שלהם.',
  },
] as const;

const contentTopPadPx =
  ONBOARDING_BACK_TOP_PX + ONBOARDING_BACK_HEIGHT_PX + ONBOARDING_BACK_SCROLL_GAP_PX;

const linkedinLink = LANDING_FOOTER_LINKS.find((link) => link.label === 'לינקדאין');
const facebookLink = LANDING_FOOTER_LINKS.find((link) => link.label === 'פייסבוק');
const contactLinkClass =
  'font-simpler text-[16px] text-white underline decoration-solid underline-offset-2';

export function HelpScreen() {
  const rootRef = useRef<HTMLDivElement>(null);
  useGrowFunnelCanvasHeight(rootRef);

  return (
    <div
      ref={rootRef}
      dir="rtl"
      className="relative z-[10] w-full bg-v03-green-900 px-v03-gutter pb-8 v03-funnel-screen"
      style={{ paddingTop: contentTopPadPx, minHeight: '100%' }}
    >
      <FunnelMintEllipse />
      <OnboardingBackButton href="/dashboard" />

      <div className="relative z-[20] mx-auto flex w-v03-content flex-col items-center gap-5">
        <JoystieCompactMark className="v03-funnel-enter-0" width={45.47} height={45.04} />
        <h1 className="w-full text-center font-simpler text-[30px] font-black leading-[33px] text-white v03-funnel-enter-1">
          עזרה
        </h1>

        <div className="flex w-full flex-col gap-4 v03-funnel-enter-3">
          {FAQ_ITEMS.map((item) => (
            <section
              key={item.question}
              className="w-full rounded-[18px] border border-white/20 bg-v03-green-900/40 px-4 py-4 text-right backdrop-blur-[2px]"
            >
              <h2 className="mb-2 font-simpler text-[16px] font-bold leading-[21.6px] text-white">
                {item.question}
              </h2>
              <p className="font-simpler text-[14px] font-normal leading-[17.5px] text-[#E3EDEA]">
                {item.answer}
              </p>
            </section>
          ))}
        </div>

        <div className="flex w-full flex-col gap-3 rounded-[18px] border border-white/20 bg-v03-green-900/40 px-4 py-4 text-center backdrop-blur-[2px] v03-funnel-enter-4">
          <h2 className="font-simpler text-[16px] font-bold leading-[21.6px] text-white">
            עדיין לא מצאתם?
          </h2>
          <p className="font-simpler text-[14px] font-normal leading-[17.5px] text-[#E3EDEA]">
            מוזמנים ליצור איתנו קשר באחת מהדרכים:
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-2 font-simpler text-[16px] text-white">
            {linkedinLink ? (
              <a
                href={linkedinLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className={contactLinkClass}
              >
                לינקדין
              </a>
            ) : null}
            {linkedinLink && facebookLink ? <span aria-hidden>·</span> : null}
            {facebookLink ? (
              <a
                href={facebookLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className={contactLinkClass}
              >
                פייסבוק
              </a>
            ) : null}
            {(linkedinLink || facebookLink) ? <span aria-hidden>·</span> : null}
            <a href="mailto:info@joystie.com" className={contactLinkClass}>
              מייל
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
