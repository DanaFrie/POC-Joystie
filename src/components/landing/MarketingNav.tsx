'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { LANDING_ASSETS, LANDING_NAV_LINKS } from '@/constants/landing-marketing';
import { MarketingCtaButton } from '@/components/landing/MarketingCtaButton';
import { LandingMenuGlow } from '@/components/landing/LandingDecor';

/** Figma chrome heights removed permanently; remaining Y keeps same relative spacing. */
const MOBILE_STATUS_BAR = 44;
const DESKTOP_BROWSER_CHROME = 79;

type MarketingNavProps = {
  /** Current route for active tab styling (e.g. `/about`) */
  activeHref?: string;
  /**
   * When set (e.g. `/`), hash links become `/#section` so they work from other pages.
   * On the home landing, leave unset so in-page smooth scroll still works.
   */
  homeHashPrefix?: string;
};

export function MarketingNav({ activeHref, homeHashPrefix }: MarketingNavProps = {}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const resolveHref = useCallback(
    (href: string) => {
      if (href.startsWith('/')) return href;
      if (!homeHashPrefix) return href;
      const base = homeHashPrefix.replace(/\/$/, '');
      // href is "#section" → "/#section"
      return `${base}/${href}`;
    },
    [homeHashPrefix],
  );

  const goTo = useCallback(
    (href: string) => {
      setOpen(false);
      const resolved = resolveHref(href);

      if (resolved.startsWith('/#')) {
        const id = resolved.slice(2);
        if (homeHashPrefix) {
          router.push(`/#${id}`);
          return;
        }
      }

      if (resolved.startsWith('/') && !resolved.startsWith('/#')) {
        router.push(resolved);
        return;
      }

      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: 'smooth' });
    },
    [homeHashPrefix, resolveHref, router],
  );

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-0 pt-[env(safe-area-inset-top)] lg:px-[var(--landing-gutter)] lg:pt-4"
      style={{ ['--landing-chrome-mobile' as string]: `${MOBILE_STATUS_BAR}px` }}
      dir="rtl"
    >
      {!open ? (
        <nav
          className="pointer-events-auto flex h-[58px] w-full items-center justify-between bg-white/[0.02] px-6 backdrop-blur-[10px] lg:hidden"
          aria-label="ניווט ראשי"
        >
          <Link href="/" className="shrink-0" aria-label="Joystie">
            <Image
              src={LANDING_ASSETS.logoWordmark}
              alt="Joystie"
              width={65}
              height={34}
              className="h-8 w-auto"
              priority
              unoptimized
            />
          </Link>
          <button
            type="button"
            className="rounded-lg p-1 text-white"
            aria-label="פתח תפריט"
            onClick={() => setOpen(true)}
          >
            <Menu size={24} />
          </button>
        </nav>
      ) : null}

      {/* Desktop: logo + links on the right (start), CTAs on the left (end) */}
      <nav
        className="pointer-events-auto mx-auto hidden max-w-[1200px] items-center justify-between gap-3 rounded-[25px] bg-white/[0.01] px-6 py-3 backdrop-blur-[10px] lg:flex lg:pl-[15px] lg:pr-[25px]"
        aria-label="ניווט ראשי"
        data-chrome-offset={DESKTOP_BROWSER_CHROME}
      >
        <div className="flex flex-1 items-center justify-start gap-10">
          <Link href="/" className="shrink-0" aria-label="Joystie">
            <Image
              src={LANDING_ASSETS.logoWordmark}
              alt="Joystie"
              width={79}
              height={39}
              className="h-10 w-auto"
              priority
              unoptimized
            />
          </Link>
          <div className="flex items-center gap-[30px] font-rubik text-base tracking-[-0.32px] text-[#f8f8f8]">
            {LANDING_NAV_LINKS.map((link) => {
              const isActive = activeHref === link.href;
              return (
                <a
                  key={link.href}
                  href={resolveHref(link.href)}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(link.href);
                  }}
                  className={`transition-colors duration-500 ease-out hover:text-v03-turquoise-300 ${
                    isActive ? 'font-bold text-[#f8f8f8]' : 'font-normal text-[#bcc8cb]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-2xl border border-white px-5 font-rubik text-base font-bold tracking-[-0.32px] text-white transition-colors duration-500 ease-out hover:bg-white/10"
          >
            התחברות
          </a>
          <a
            href="/onboarding"
            dir="rtl"
            className="inline-flex h-9 flex-row items-center justify-center gap-3 rounded-2xl bg-v03-turquoise-300 px-5 font-rubik text-base font-bold tracking-[-0.32px] text-[#282828] transition-[filter,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:brightness-105 hover:-translate-y-0.5"
          >
            להצטרפות
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="20"
              viewBox="0 0 15 20"
              fill="none"
              className="h-5 w-[15px] shrink-0"
              aria-hidden
            >
              <path
                d="M9.5 14.5L5.5 10.5L9.5 6.5"
                stroke="#282828"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </nav>

      {open ? (
        <div
          className="pointer-events-auto fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#05161a]"
          role="dialog"
          aria-modal="true"
          aria-label="תפריט"
        >
          <LandingMenuGlow />

          <div className="relative z-10 flex h-[58px] shrink-0 items-center justify-between px-6">
            <Link href="/" className="shrink-0" aria-label="Joystie" onClick={() => setOpen(false)}>
              <Image
                src={LANDING_ASSETS.logoWordmark}
                alt="Joystie"
                width={65}
                height={34}
                className="h-8 w-auto"
                unoptimized
              />
            </Link>
            <button
              type="button"
              className="rounded-lg p-1 text-white"
              aria-label="סגור תפריט"
              onClick={() => setOpen(false)}
            >
              <X size={24} strokeWidth={2} />
            </button>
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-[327px] flex-1 flex-col gap-10 pb-8 pt-2">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[36px] border border-[#093427]">
              {LANDING_NAV_LINKS.map((link) => {
                const showChevron =
                  link.href === '#knowledge' || link.href === '/about';
                return (
                  <a
                    key={link.href}
                    href={resolveHref(link.href)}
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(link.href);
                    }}
                    className="relative flex flex-1 items-center justify-start border-b border-[#093427] bg-[rgba(7,30,35,0.7)] px-5 py-6 text-right backdrop-blur-[10px] last:border-b-0"
                  >
                    {showChevron ? (
                      <Image
                        src={LANDING_ASSETS.menuChevron}
                        alt=""
                        width={6}
                        height={11}
                        className="absolute left-5 top-1/2 h-[11px] w-[6px] -translate-y-1/2 opacity-90"
                        unoptimized
                      />
                    ) : null}
                    <span className="flex items-center gap-3 pe-0">
                      <Image
                        src={LANDING_ASSETS.menuGlow}
                        alt=""
                        width={16}
                        height={16}
                        className="size-4 shrink-0"
                        unoptimized
                      />
                      <span className="font-rubik text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-white">
                        {link.label}
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>

            <div className="relative h-[194px] w-full shrink-0 overflow-hidden rounded-[36px]">
              <Image
                src={LANDING_ASSETS.footerMountainDesktop}
                alt=""
                fill
                className="object-cover object-bottom"
                sizes="327px"
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(42.73deg, rgba(0, 0, 0, 0) 26.66%, rgba(0, 0, 0, 0.4) 67.26%)',
                }}
                aria-hidden
              />
              <div
                className="absolute left-1/2 top-1/2 z-10 flex w-[282px] -translate-x-1/2 -translate-y-1/2 flex-col items-start justify-center gap-5 text-right"
                style={{ marginLeft: '-5.5px' }}
              >
                <p className="w-full font-rubik text-[30px] font-bold leading-[1.15] tracking-[-0.9px] text-white">
                  הדרך החדשה לנהל הרגלי מסך בריאים
                </p>
                <MarketingCtaButton
                  href="/onboarding"
                  label="הצטרפות לג׳ויסטי"
                  size="compact"
                  onClick={() => setOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
