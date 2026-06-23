import { LandingHeroCta } from '@/components/landing/LandingHeroCta';
import { LandingHeroWalletScene } from '@/components/landing/LandingHeroWalletScene';

/** Ellipse 385 — mint glow, funnel bottom-left. */
function LandingHeroMintGlow() {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 z-[1] h-[180px] w-[180px] -translate-x-[38%] translate-y-[38%] rounded-full md:h-[220px] md:w-[220px]"
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

      <div className="relative z-[2] mx-auto flex h-full max-h-full w-full max-w-7xl flex-col px-4 pt-[4.25rem] md:grid md:grid-cols-2 md:items-center md:gap-8 md:px-8 md:pt-[5.5rem] lg:max-w-[90rem] lg:gap-10 lg:px-12">
        <div className="flex shrink-0 flex-col gap-1 text-center md:gap-3 md:text-right lg:gap-4">
          <p className="font-simpler text-[14px] font-normal leading-[22px] tracking-[2.5px] text-v03-green-200 sm:text-[16px] md:text-[18px] lg:text-[20px]">
            המהפכה מתחילה!
          </p>
          <h1 className="font-simpler text-[28px] font-black leading-[32px] text-white [text-shadow:0_0_15px_rgba(255,255,255,0.2)] sm:text-[34px] sm:leading-[38px] md:text-[42px] md:leading-[1.05] lg:text-[48px] xl:text-[52px]">
            Joystie Wallet
          </h1>
          <p className="mx-auto max-w-md font-simpler text-[16px] font-normal leading-[22px] text-white sm:text-[17px] sm:leading-[24px] md:mx-0 md:max-w-sm md:text-[18px] md:leading-[26px] lg:text-[20px]">
            הארנק שמחבר דמי כיס לזמן מסך!
            <br />
            הילדים שלכם לומדים לבחור, לחסוך ולהוביל.
          </p>
          <div className="mt-1 flex justify-center md:justify-end" id="register">
            <LandingHeroCta />
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden md:flex md:items-center md:justify-center">
          <LandingHeroWalletScene />
        </div>
      </div>
    </section>
  );
}
