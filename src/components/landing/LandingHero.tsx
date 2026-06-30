import { LandingHeroCta } from '@/components/landing/LandingHeroCta';
import { LandingHeroWalletScene } from '@/components/landing/LandingHeroWalletScene';

/** Ellipse 385 — mint glow, funnel bottom-left. */
function LandingHeroMintGlow() {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 z-[1] h-[min(40vw,220px)] w-[min(40vw,220px)] -translate-x-[38%] translate-y-[38%] rounded-full md:h-[280px] md:w-[280px]"
      aria-hidden
      style={{
        background: 'var(--v03-ellipse-385)',
        filter: 'blur(120px)',
      }}
    />
  );
}

export function LandingHero() {
  return (
    <section
      id="hero"
      className="v03-landing-hero relative box-border h-[100dvh] max-h-[100dvh] overflow-hidden bg-v03-green-900"
    >
      <LandingHeroMintGlow />

      <div className="relative z-[2] mx-auto flex h-full max-h-full w-full max-w-7xl flex-col px-4 pt-[4.25rem] md:grid md:grid-cols-2 md:items-center md:gap-6 md:px-8 md:pt-[5.25rem] lg:max-w-[90rem] lg:gap-10 lg:px-12">
        {/* Copy + CTA */}
        <div className="flex shrink-0 flex-col items-center md:order-1 md:justify-center md:px-2 lg:px-6">
          <div className="flex w-full max-w-xl flex-col gap-2 text-center md:max-w-2xl md:gap-4 lg:max-w-3xl lg:gap-5">
            <p className="font-simpler text-[17px] font-normal leading-[28px] tracking-[2.5px] text-v03-green-200 sm:text-[20px] sm:leading-[30px] md:text-[25px] md:leading-[34px] lg:text-[28px]">
              המהפכה מתחילה!
            </p>
            <h1 className="font-simpler text-[39px] font-black leading-[44px] text-white [text-shadow:0_0_15px_rgba(255,255,255,0.2)] sm:text-[46px] sm:leading-[50px] md:text-[64px] md:leading-[1.08] lg:text-[74px] xl:text-[83px]">
              Joystie Wallet
            </h1>
            <p className="mx-auto max-w-lg font-simpler text-[20px] font-normal leading-[29px] text-white sm:text-[21px] sm:leading-[30px] md:max-w-xl md:text-[25px] md:leading-[37px] lg:text-[30px] lg:leading-[41px]">
              הארנק שמחבר דמי כיס לזמן מסך!
              <br />
              הילדים שלכם לומדים לבחור, לחסוך ולהוביל.
            </p>
          </div>

          <div className="mt-3 flex w-full justify-center sm:mt-4 md:mt-8" id="register">
            <LandingHeroCta className="min-w-[13rem] px-10 md:min-w-[14rem]" />
          </div>
        </div>

        {/* Wallet + companions */}
        <div className="relative mt-0 min-h-0 flex-1 overflow-visible sm:mt-1 md:order-2 md:mt-0 md:flex md:items-center md:justify-center">
          <LandingHeroWalletScene />
        </div>
      </div>
    </section>
  );
}
