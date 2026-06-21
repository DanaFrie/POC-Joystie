'use client';

import { ChevronDown } from 'lucide-react';

type LandingFaqProps = {
  titleRevealRef: (el: HTMLDivElement | null) => void;
  itemRevealRef: (index: number) => (el: HTMLDivElement | null) => void;
  activeQuestion: number | null;
  onToggleQuestion: (index: number) => void;
};

const FAQ_ITEMS = [
  {
    q: 'האם לא נוצרת כאן מוטיבציה שגויה שאינה חינוכית?',
    a: 'המוטיבציה השגויה קיימת במצב הנוכחי. כיום, הילד מקבל שירותי תוכן "בחינם" לכאורה, אך משלם עליהם במטבע יקר של קשב ובריאות נפשית.\nהמודל הקיים מעודד חוסר גבולות, חרדה וקושי בדחיית סיפוקים.\nהמוצר שלנו מחליף את "התשלום השקוף" וההרסני הזה במודל כלכלי גלוי, המלמד את הילד לנהל תקציב, לקבל החלטות מושכלות ולדחות סיפוקים - בדיוק כמו בעולם האמיתי',
  },
  {
    q: 'מה קורה עם ההגבלה שיש היום?',
    a: 'ההגבלות הטכניות - ScreenTime, Family Link - מציבות אותנו כשוטר מול הילד. ההגבלה שמה את הילד במקום בלתי אפשרי, בדיוק ברגע שהוא הכי רוצה להמשיך, המערכת זורקת אותו החוצה.\nדמיינו אתכם בשיא הדיאטה עם עוגת גבינה מול הפנים!\nJoystie יוצר בסיס לתקשורת משפחתית, במקום ריב על המסך נוצרת תקשורת.\nמשוטרים להורים - כמו פעם.',
  },
  {
    q: 'ומה אם אנחנו לא נותנים דמי כיס?',
    a: 'המערכת כיום היא אתגר של שבוע בלבד. כך גם אנחנו מציעים להסביר את זה לילד. אנחנו רוצים להצית את הניצוץ שיחל ליצור הרגלים מיטיבים.',
  },
] as const;

export function LandingFaq({
  titleRevealRef,
  itemRevealRef,
  activeQuestion,
  onToggleQuestion,
}: LandingFaqProps) {
  return (
    <section id="questions" className="relative z-10 overflow-hidden bg-v03-bg-light py-16 md:py-28">
      <div className="relative mx-auto max-w-4xl px-4 md:px-6">
        <div ref={titleRevealRef} className="reveal mb-12 text-center md:mb-20">
          <h2 className="font-simpler text-[2rem] font-black leading-tight text-v03-text-on-light md:text-[2.75rem] lg:text-[3.5rem]">
            שאלות חשובות
          </h2>
          <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-v03-accent" />
        </div>

        <div className="space-y-3 md:space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              ref={itemRevealRef(idx)}
              className="reveal overflow-hidden rounded-[1.25rem] border border-v03-green-100 bg-v03-white shadow-v03-button transition-shadow hover:shadow-[2px_4px_24px_rgba(109,109,109,0.18)] md:rounded-[1.5rem]"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 p-5 text-right font-simpler text-lg font-bold text-v03-text-on-light md:p-8 md:text-xl"
                onClick={() => onToggleQuestion(idx)}
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`shrink-0 text-v03-green-700 transition-transform duration-300 ${
                    activeQuestion === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {activeQuestion === idx ? (
                <div className="animate-fadeIn px-5 pb-5 font-simpler text-base leading-relaxed text-v03-green-700 md:px-8 md:pb-8 md:text-lg">
                  {item.a.split('\n').map((line, lineIdx) => (
                    <p key={lineIdx} className={lineIdx > 0 ? 'mt-3' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
