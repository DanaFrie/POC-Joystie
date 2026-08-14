import Image from 'next/image';
import { LANDING_ASSETS, LANDING_FOOTER_LINKS } from '@/constants/landing-marketing';
import { MarketingCtaButton } from '@/components/landing/MarketingCtaButton';
import { JoystieWordmarkLogo } from '@/components/brand/JoystieWordmarkLogo';
import { LandingLazyBackground } from '@/components/landing/LandingLazyBackground';

type MarketingFooterProps = {
  /**
   * `dark` — landing (dark strip, white type).
   * `light` — about (white strip, dark type + dark logo). Same layout either way.
   */
  surface?: 'dark' | 'light';
};

/**
 * Mobile — Figma 15445:6248 (375, rounded-t 45).
 * Desktop — Screen 1786×410 / radius 74; link bar 1580.
 * All copy stays RTL on mobile and desktop.
 */
export function MarketingFooter({ surface = 'dark' }: MarketingFooterProps) {
  const light = surface === 'light';

  return (
    <footer
      className={`relative px-0 pb-8 pt-0 md:pb-12 md:pt-6 ${light ? 'bg-white' : 'bg-[#05161a]'}`}
      dir="rtl"
    >
      <div className="mx-auto flex w-full max-w-[1786px] flex-col gap-3 md:gap-10 md:px-[var(--landing-gutter)] lg:px-[67px]">
          <div className="relative min-h-[479px] overflow-hidden rounded-t-[45px] md:min-h-[410px] md:rounded-[74px]">
            {/* Mobile — bottom of mountains-mobile.webp + same saturation as desktop */}
            <Image
              src={LANDING_ASSETS.footerMountainMobile}
              alt=""
              fill
              loading="lazy"
              decoding="async"
              className="object-cover object-bottom [filter:saturate(1.75)_contrast(1.08)] md:hidden"
              sizes="100vw"
            />
            {/*
              Desktop — Figma Screen crop + high saturation (image), then soft gradient.
              lightgray 0px -428.426px / 100% 435.61% no-repeat
              Lazy: 2.6MB mountain must not load with the hero.
            */}
            <LandingLazyBackground
              imageUrl={LANDING_ASSETS.footerMountainMobile}
              className="pointer-events-none absolute inset-0 hidden md:block"
              style={{
                backgroundColor: 'lightgray',
                backgroundPosition: '0px -428.426px',
                backgroundSize: '100% 435.61%',
                backgroundRepeat: 'no-repeat',
                filter: 'saturate(1.75) contrast(1.08)',
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 hidden md:block"
              style={{
                backgroundImage:
                  'linear-gradient(92deg, rgba(0, 0, 0, 0.00) 3.04%, rgba(0, 0, 0, 0.20) 74.27%)',
              }}
              aria-hidden
            />
            {/* Softening overlays — mobile only */}
            <div
              className="absolute inset-0 md:hidden"
              style={{
                backgroundImage: light
                  ? 'linear-gradient(117deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.22) 72%)'
                  : 'linear-gradient(117deg, rgba(0,0,0,0) 33%, rgba(0,0,0,0.4) 77%)',
              }}
              aria-hidden
            />
            {/* Bottom seam into page chrome — mobile only (no hard edge / black line) */}
            {light ? (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[96px] bg-gradient-to-b from-transparent from-0% via-white/80 via-[55%] to-white to-100% md:hidden"
                aria-hidden
              />
            ) : (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[80px] bg-gradient-to-b from-transparent to-[#05161a] md:hidden"
                aria-hidden
              />
            )}

            <JoystieWordmarkLogo
              tone="dark"
              className="absolute right-6 top-[29px] z-10 h-[58px] w-[117px] md:hidden"
              aria-label="Joystie"
            />

            {/*
              Mobile gutters: 24px sides (px-6) so SE/320 never flush to the edge.
              Absolute inset + padding — not fixed 320px width (that fills 320 screens).
            */}
            <div className="absolute inset-x-0 top-[min(185px,38%)] z-10 flex flex-col items-start gap-8 px-6 text-right sm:gap-10 md:inset-0 md:top-0 md:h-full md:w-full md:max-w-none md:items-start md:justify-center md:gap-8 md:px-12 lg:px-16 xl:px-20">
              <p className="w-full max-w-[327px] font-rubik text-[40px] font-bold leading-[1.05] tracking-[-1.2px] text-white sm:text-[45px] sm:tracking-[-1.35px] md:max-w-[min(900px,70%)] md:text-[52px] md:tracking-[-1.56px] lg:text-[75px] lg:tracking-[-2.25px]">
                <span className="block md:hidden">בונים יחד עם</span>
                <span className="block md:hidden">הילדים הרגלי</span>
                <span className="block md:hidden">מסך בריאים</span>
                <span className="hidden md:block md:whitespace-nowrap">בונים יחד עם הילדים</span>
                <span className="hidden md:block md:whitespace-nowrap">הרגלי מסך בריאים</span>
              </p>
              <MarketingCtaButton
                href="/onboarding"
                label="הצטרפות לג׳ויסטי"
                size="mobile"
                className="md:hidden"
              />
              <MarketingCtaButton
                href="/onboarding"
                label="הצטרפות לג׳ויסטי"
                className="hidden md:inline-flex"
              />
            </div>
          </div>

        <div className="flex w-full flex-col items-center gap-3 px-6 md:mx-auto md:max-w-[1580px] md:flex-row md:items-center md:justify-between md:gap-6 md:px-0">
          <div className="flex items-center gap-[50px] md:gap-[74px]">
            {light ? (
              <JoystieWordmarkLogo
                tone="dark"
                className="hidden h-[58px] w-[117px] md:block"
                aria-label="Joystie"
              />
            ) : (
              <Image
                src={LANDING_ASSETS.logoFooter}
                alt="Joystie"
                width={117}
                height={58}
                className="hidden h-[58px] w-auto md:block"
                unoptimized
              />
            )}
            <div
              className={`flex w-full items-center justify-between gap-2 font-simpler text-base leading-[1.25] tracking-[-0.24px] underline md:w-auto md:justify-center md:gap-[35px] md:font-rubik md:tracking-[-0.32px] md:no-underline ${
                light ? 'text-[#092125]' : 'text-white'
              }`}
            >
              {LANDING_FOOTER_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`shrink-0 whitespace-nowrap transition-colors duration-500 ease-out ${
                    light ? 'hover:text-[#092125]/70' : 'hover:text-v03-turquoise-300'
                  }`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <p
            className={`font-simpler text-base leading-[1.25] tracking-[-0.24px] md:font-rubik md:tracking-[-0.32px] ${
              light ? 'text-[#092125]' : 'text-white'
            }`}
          >
            כל הזכויות שמורות ל- Joystie בע&quot;מ ©
          </p>
        </div>
      </div>
    </footer>
  );
}
