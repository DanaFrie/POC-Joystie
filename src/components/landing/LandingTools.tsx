'use client';

import Image from 'next/image';

type LandingToolsProps = {
  titleRevealRef: (el: HTMLDivElement | null) => void;
  cardsRevealRef: (el: HTMLDivElement | null) => void;
};

const TOOLS = [
  {
    icon: '/time-balance-icon.png',
    alt: 'איזון זמן מסך',
    title: 'איזון זמן מסך',
    body: 'בלי הריב היומי! הופכים את המסכים לכלי של ניהול עצמי ואחריות אישית.',
  },
  {
    icon: '/digital-wallet-icon.png',
    alt: 'ארנק דיגיטלי',
    title: 'ארנק דיגיטלי',
    body: 'הבנק הראשון של הילד. המקום שבו הוא לומד לנהל כסף אמיתי, לחסוך ולהוציא בתבונה.',
  },
] as const;

export function LandingTools({ titleRevealRef, cardsRevealRef }: LandingToolsProps) {
  return (
    <section id="tools" className="relative z-10 overflow-hidden bg-white bg-grid py-16 md:py-32">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div ref={titleRevealRef} className="reveal mb-12 text-center md:mb-20">
          <h2 className="font-simpler text-[2rem] font-black leading-tight text-v03-text-on-light md:text-[2.75rem] lg:text-[3.5rem]">
            הכלים שיעזרו לכם להצליח
          </h2>
          <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-v03-accent" />
        </div>

        <div className="mx-auto max-w-5xl">
          <div
            ref={cardsRevealRef}
            className="reveal relative rounded-[2rem] border border-v03-green-100 bg-white/70 p-6 shadow-v03-button backdrop-blur-sm md:rounded-[2.5rem] md:p-10"
          >
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              {TOOLS.map((tool) => (
                <div
                  key={tool.title}
                  className="flex flex-col items-center rounded-[1.75rem] border border-v03-green-100 bg-v03-white p-6 text-center shadow-v03-button transition-transform hover:scale-[1.02] md:rounded-[2rem] md:p-10"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-v03-green-100 md:mb-8 md:h-20 md:w-20">
                    <Image
                      src={tool.icon}
                      alt={tool.alt}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <h3 className="mb-3 font-simpler text-xl font-black text-v03-text-on-light md:text-2xl">
                    {tool.title}
                  </h3>
                  <p className="font-simpler text-base leading-relaxed text-v03-green-700 md:text-lg">
                    {tool.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 translate-y-1/2 whitespace-nowrap rounded-v03-button border-2 border-v03-white bg-v03-accent px-6 py-3 font-simpler text-base font-black text-v03-accent-foreground shadow-v03-button md:px-8 md:text-lg">
              חינוך פיננסי מעשי
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
