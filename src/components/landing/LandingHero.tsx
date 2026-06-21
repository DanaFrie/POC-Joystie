'use client';

import { LandingHeroCta } from '@/components/landing/LandingHeroCta';
import { LandingHeroWalletScene } from '@/components/landing/LandingHeroWalletScene';

type LandingHeroProps = {
  revealRef: (el: HTMLDivElement | null) => void;
  companionRevealRef: (el: HTMLDivElement | null) => void;
};

export function LandingHero({ revealRef, companionRevealRef }: LandingHeroProps) {
  return (
    <section className="v03-landing-hero relative box-border flex h-[100dvh] max-h-[100dvh] shrink-0 flex-col overflow-hidden bg-v03-green-900 pt-20 pb-4 md:pt-28 md:pb-6 lg:pt-32">
      <div
        className="pointer-events-none absolute bottom-[-120px] left-1/2 z-[1] h-[272px] w-[272px] -translate-x-1/2 rounded-[50%] opacity-80 md:bottom-[-80px] md:h-[360px] md:w-[360px] lg:h-[420px] lg:w-[420px]"
        style={{
          background: 'var(--v03-ellipse-385)',
          filter: 'blur(150px)',
        }}
        aria-hidden
      />

      <div className="relative z-[2] mx-auto grid h-full min-h-0 w-full max-w-7xl flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] items-center gap-4 overflow-hidden px-4 md:grid-cols-2 md:grid-rows-1 md:gap-14 md:px-8 lg:max-w-[90rem] lg:gap-20 lg:px-12 xl:gap-24">
        <div
          ref={revealRef}
          className="reveal active order-1 flex shrink-0 flex-col gap-2 text-center md:order-1 md:gap-6 md:text-right lg:gap-8"
        >
          <p className="font-simpler text-[18px] font-normal leading-[30px] tracking-[3.78px] text-v03-green-200 md:text-[22px] md:leading-[34px] lg:text-[24px] lg:leading-[36px]">
            המהפכה מתחילה!
          </p>
          <h1 className="font-simpler text-[40px] font-black leading-[44px] text-white [text-shadow:0_0_15px_rgba(255,255,255,0.2)] md:text-[56px] md:leading-[1.05] lg:text-[72px] xl:text-[80px]">
            Joystie Wallet
          </h1>
          <p className="mx-auto max-w-xl font-simpler text-[24px] font-normal leading-[30px] tracking-[-0.36px] text-white md:mx-0 md:max-w-2xl md:text-[28px] md:leading-[36px] lg:text-[32px] lg:leading-[40px]">
            הארנק שמחבר דמי כיס לזמן מסך!
            <br />
            הילדים שלכם לומדים לבחור, לחסוך ולהוביל.
          </p>
          <div className="flex justify-center" id="register">
            <LandingHeroCta />
          </div>
        </div>

        <div
          ref={companionRevealRef}
          className="reveal active order-2 flex min-h-0 w-full items-center justify-center overflow-hidden md:order-2"
          style={{ transitionDelay: '0.15s' }}
        >
          <LandingHeroWalletScene />
        </div>
      </div>
    </section>
  );
}
