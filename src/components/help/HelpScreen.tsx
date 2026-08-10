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
    question: 'איך הילד שלי מעלה את צילום המסך?',
    answer:
      'הילד נכנס לקישור שהעברתם לו ומעלה צילום מסך של זמן המסך. המערכת קוראת את הצילום ומעדכנת את הסטטוס.',
  },
  {
    question: 'מה קורה אם הילד לא מעלה צילום מסך?',
    answer:
      'אם לא הועלה צילום עד סוף היום, היום יסומן כ"חסר". רק ימים שהועלו ואושרו על ידכם נספרים לתקציב השבועי.',
  },
  {
    question: 'איך מאשרים או דוחים צילום מסך?',
    answer:
      'בלוח הבקרה תראו צילומים בסטטוס "ממתין לאישור", עם זמן המסך שזוהה והכסף שהילד הרוויח או הפסיד.',
  },
  {
    question: 'מה קורה בסוף השבוע?',
    answer:
      'אם הילד עמד ביעדים, הוא יוכל לבחור מה לעשות עם הכסף: מזומן, מתנה, פעילות משותפת או חיסכון.',
  },
] as const;

const contentTopPadPx =
  ONBOARDING_BACK_TOP_PX + ONBOARDING_BACK_HEIGHT_PX + ONBOARDING_BACK_SCROLL_GAP_PX;

const meetingLink = LANDING_FOOTER_LINKS.find((link) => link.label === 'שיחה איתנו');
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

        <p className="w-full px-2.5 text-center font-simpler text-[14px] font-normal leading-[17.5px] text-v03-green-100 v03-funnel-enter-2">
          שאלות נפוצות ודרכי יצירת קשר
        </p>

        <div className="flex w-full flex-col gap-3 rounded-[18px] border border-white/20 bg-v03-green-900/40 px-4 py-4 text-center backdrop-blur-[2px] v03-funnel-enter-3">
          <h2 className="font-simpler text-[16px] font-bold leading-[21.6px] text-white">
            צור קשר
          </h2>
          {meetingLink ? (
            <a
              href={meetingLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className={contactLinkClass}
            >
              {meetingLink.label}
            </a>
          ) : null}
          <a href="mailto:info@joystie.com" className={contactLinkClass}>
            info@joystie.com
          </a>
          <a
            href="https://www.linkedin.com/company/joystie"
            target="_blank"
            rel="noopener noreferrer"
            className={contactLinkClass}
          >
            Linkedin
          </a>
        </div>

        <div className="flex w-full flex-col gap-4 v03-funnel-enter-4">
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
      </div>
    </div>
  );
}
