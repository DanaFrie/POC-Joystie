import Image from 'next/image';

type LandingFoundersProps = {
  titleRevealRef: (el: HTMLDivElement | null) => void;
  founderRevealRef: (index: number) => (el: HTMLDivElement | null) => void;
};

const FOUNDERS = [
  {
    name: 'מאיר ניצן',
    image: '/meir_img.jfif',
    lines: ['CEO & Co-founder', 'יזם חברתי, מרצה בכיר לאיזון דיגיטלי', 'עשור ביחידות העילית של הצבא וראש מכינה קדם צבאית'],
    rotate: 'rotate-1',
  },
  {
    name: 'דנה פרידמן',
    image: '/dana_img.jfif',
    lines: ['Head of product & Co-founder', 'יזמת טכנולוגית, Data Scientist', 'מנהלת מוצר וקצינה במילואים'],
    rotate: '-rotate-1',
  },
] as const;

const STORY = [
  'מצאתי את עצמי מתוסכל משעות של בזבוז - גלילה אינסופית שגרמה לי להרגיש חרדה ותסכול - והרגשתי שאני לא מרוכז דווקא בזמנים שהכי רציתי להיות נוכח: עם הילדים שלי.',
  'כשהבנות שלי התחילו לחקות אותי, הבנתי שאני בבעיה. יצאתי למסע של איזון דיגיטלי - בשביל המשפחה שלי ובשביל הנפש שלי. הבנתי שהילדים שלי משלמים מחיר בעסקה שאף אחד לא חתם איתם עליה: הן נותנות את תשומת הלב שלהן ומקבלות שירותים "בחינם".',
  'בדרך פגשתי את דנה, שחולקת איתי את האתגר הזה. יחד החלטנו ליצור עסקה אחרת - מנגנון שמצד אחד שם את העסקה המקורית על השולחן בשקיפות מלאה, ומצד שני עוזר למשפחות למצוא איזון אמיתי.',
  'ככה נולד Joystie - כלי שהופך את הקונפליקט הדיגיטלי להזדמנות מעשית ללמד את הילדים על ניהול משאבים, כסף ואחריות אישית.',
] as const;

export function LandingFounders({ titleRevealRef, founderRevealRef }: LandingFoundersProps) {
  return (
    <section id="behind-idea" className="relative overflow-hidden bg-white bg-grid py-16 md:py-32">
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <div ref={titleRevealRef} className="reveal mb-12 text-center md:mb-20">
          <h2 className="font-simpler text-[2rem] font-black leading-tight tracking-tight text-v03-text-on-light md:text-[2.75rem] lg:text-[3.5rem]">
            מאחורי הרעיון
          </h2>
          <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-v03-turquoise-300" />
        </div>

        <div className="grid items-center gap-10 md:gap-16 lg:grid-cols-2">
          <div className="order-2 space-y-4 text-right font-simpler text-base leading-relaxed text-v03-green-700 md:space-y-6 md:text-lg lg:order-1">
            {STORY.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
            <p className="mt-6 font-simpler text-sm font-bold text-v03-text-on-light md:text-base">
              מאיר, מייסד Joystie
            </p>
          </div>

          <div className="order-1 grid grid-cols-2 gap-4 md:gap-6 lg:order-2">
            {FOUNDERS.map((founder, index) => (
              <div
                key={founder.name}
                ref={founderRevealRef(index)}
                className={`reveal rounded-[1.75rem] border border-v03-green-100 bg-v03-green-100 p-5 text-center shadow-v03-button transition-transform hover:rotate-0 md:rounded-[2rem] md:p-8 ${founder.rotate}`}
              >
                <div
                  className={`mx-auto mb-3 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-v03-white shadow-sm md:mb-4 md:h-32 md:w-32 ${founder.rotate}`}
                >
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="font-simpler text-base font-black text-v03-text-on-light md:text-lg">
                  {founder.name}
                </div>
                <div className="mt-1 space-y-1 font-simpler text-[10px] leading-tight text-v03-green-700 md:mt-2 md:text-[11px]">
                  {founder.lines.map((line) => (
                    <p key={line} className={line.includes('&') ? 'font-bold' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
