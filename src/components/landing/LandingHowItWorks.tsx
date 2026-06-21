'use client';

import { Button } from '@/components/ui/Button';

type LandingHowItWorksProps = {
  titleRevealRef: (el: HTMLDivElement | null) => void;
  ctaRevealRef: (el: HTMLDivElement | null) => void;
  onSignup: () => void;
};

const STEPS = [
  {
    num: '1',
    title: 'דמי כיס דרך Joystie Wallet',
    body: 'אתם טוענים סכום כסף שבועי. שווי הכסף עבור הילד הוא כסף וזמן מסך יחדיו.',
    badgeClass: 'bg-v03-accent text-v03-accent-foreground',
  },
  {
    num: '2',
    title: 'הילד מקבל החלטות',
    body: 'כל שעת מסך שווה כסף שניתן לממש ב-Joystie. בסוף השבוע הילד פודה את הכסף שהצליח לחסוך ולומד שיש מחיר לזמן.',
    badgeClass: 'bg-v03-green-200 text-v03-green-900',
  },
  {
    num: '3',
    title: 'Joystie והילד מוצאים\nאת האיזון',
    body: 'מגיעים יחד לנוסחה שמתאימה למשפחה שלכם.',
    badgeClass: 'bg-v03-white text-v03-green-900',
  },
] as const;

export function LandingHowItWorks({ titleRevealRef, ctaRevealRef, onSignup }: LandingHowItWorksProps) {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-v03-green-900 py-16 text-v03-text-on-dark md:py-24">
      <div className="relative z-[2] mx-auto max-w-6xl px-4 md:px-6">
        <div ref={titleRevealRef} className="reveal mb-12 text-center md:mb-16">
          <h2 className="font-simpler text-[2rem] font-black leading-tight md:text-[2.75rem] lg:text-[3.25rem]">
            איך זה עובד?
          </h2>
          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-v03-accent/60" />
        </div>

        <div className="relative flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="absolute top-8 right-10 left-10 hidden h-px bg-white/10 md:block" aria-hidden />

          {STEPS.map((step) => (
            <div
              key={step.num}
              className="group relative z-10 flex max-w-[280px] flex-1 flex-col items-center text-center"
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full text-xl font-black shadow-v03-display transition-transform group-hover:scale-105 md:mb-6 md:h-[4.25rem] md:w-[4.25rem] md:text-[1.4rem] ${step.badgeClass}`}
              >
                {step.num}
              </div>
              <h3 className="mb-3 whitespace-pre-line font-simpler text-lg font-black md:text-2xl">
                {step.title}
              </h3>
              <p className="font-simpler text-sm leading-relaxed text-v03-text-muted-on-dark md:text-base">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <div ref={ctaRevealRef} className="reveal mt-12 flex justify-center md:mt-16">
          <Button
            type="button"
            onClick={onSignup}
            variant="secondary"
            size="lg"
            className="w-auto min-w-[200px] px-10"
          >
            הצטרפו עכשיו
          </Button>
        </div>
      </div>
    </section>
  );
}
