'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AuthFunnelScreenShell,
  authFunnelFooterButtonClass,
} from '@/components/login/AuthFunnelScreenShell';

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

export function HelpScreen() {
  const router = useRouter();

  return (
    <AuthFunnelScreenShell
      title="עזרה"
      footer={
        <>
          <button
            type="button"
            onClick={() => router.back()}
            className={authFunnelFooterButtonClass}
          >
            חזרה
          </button>
          <p className="w-full text-center font-simpler text-[16px] font-normal leading-[21.6px] text-white">
            <Link
              href="/dashboard"
              className="font-normal text-white underline decoration-solid underline-offset-2"
            >
              ללוח הבקרה
            </Link>
          </p>
        </>
      }
    >
      <div className="flex w-full flex-col gap-5">
        <p className="w-full px-2.5 text-center font-simpler text-[14px] font-normal leading-[17.5px] text-v03-green-100">
          שאלות נפוצות ודרכי יצירת קשר
        </p>

        <div className="flex w-full flex-col gap-4">
          {FAQ_ITEMS.map((item) => (
            <section
              key={item.question}
              className="w-full rounded-[18px] border border-white/20 bg-white/5 px-4 py-4 text-right"
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

        <div className="flex w-full flex-col gap-3 rounded-[18px] border border-white/20 bg-white/5 px-4 py-4 text-center">
          <h2 className="font-simpler text-[16px] font-bold leading-[21.6px] text-white">
            צור קשר
          </h2>
          <a
            href="mailto:info@joystie.com"
            className="font-simpler text-[16px] text-white underline decoration-solid underline-offset-2"
          >
            info@joystie.com
          </a>
          <a
            href="https://www.linkedin.com/company/joystie"
            target="_blank"
            rel="noopener noreferrer"
            className="font-simpler text-[16px] text-white underline decoration-solid underline-offset-2"
          >
            Joystie ב-LinkedIn
          </a>
        </div>
      </div>
    </AuthFunnelScreenShell>
  );
}
