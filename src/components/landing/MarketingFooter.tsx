import Image from 'next/image';
import { LANDING_ASSETS, LANDING_FOOTER_LINKS } from '@/constants/landing-marketing';
import { MarketingCtaButton } from '@/components/landing/MarketingCtaButton';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { JoystieWordmarkLogo } from '@/components/brand/JoystieWordmarkLogo';

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
        <LandingReveal>
          <div className="relative min-h-[479px] overflow-hidden rounded-t-[45px] md:min-h-[410px] md:rounded-[74px]">
            <Image
              src={LANDING_ASSETS.footerMountainMobile}
              alt=""
              fill
              className="object-cover object-bottom md:hidden"
              sizes="100vw"
            />
            <Image
              src={LANDING_ASSETS.footerMountainDesktop}
              alt=""
              fill
              className="hidden object-cover object-bottom md:block"
              sizes="1786px"
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(117deg, rgba(0,0,0,0) 33%, rgba(0,0,0,0.4) 77%)',
              }}
              aria-hidden
            />
            {/* Bottom seam (mobile about only): fade into white so no hard gray line */}
            {light ? (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[72px] md:hidden"
                aria-hidden
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white" />
                <div className="absolute inset-x-0 bottom-0 h-8 bg-white/90 blur-md" />
              </div>
            ) : (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[102px] md:h-[80px]"
                aria-hidden
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05161a]/55 to-[#05161a]" />
              </div>
            )}

            <JoystieWordmarkLogo
              tone="dark"
              className="absolute right-[38px] top-[29px] z-10 h-[58px] w-[117px] md:hidden"
              aria-label="Joystie"
            />

            {/* Mobile: items-start = visual right in RTL (Figma 15445:6252). Purple arrow CTA like hero. */}
            <div className="absolute inset-x-0 top-[185px] z-10 mx-auto flex w-[320px] flex-col items-start gap-10 text-right md:inset-0 md:top-0 md:mx-0 md:h-full md:w-full md:max-w-none md:items-start md:justify-center md:gap-8 md:px-12 lg:px-16 xl:px-20">
              <p className="w-full max-w-[320px] font-rubik text-[45px] font-bold leading-[1.05] tracking-[-1.35px] text-white md:max-w-[min(900px,70%)] md:text-[52px] md:tracking-[-1.56px] lg:text-[75px] lg:tracking-[-2.25px]">
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
        </LandingReveal>

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
