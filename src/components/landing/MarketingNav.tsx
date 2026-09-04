'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { LANDING_ASSETS, LANDING_NAV_LINKS } from '@/constants/landing-marketing';
import { MarketingCtaButton } from '@/components/landing/MarketingCtaButton';
import { LandingMenuGlow } from '@/components/landing/LandingDecor';
import { scrollLandingToSection } from '@/components/landing/landingStatsStory';

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
  /**
   * `onDark` — landing (near-clear glass on dark hero).
   * `onLight` — about (darker frosted glass so the bar reads on white).
   */
  chrome?: 'onDark' | 'onLight';
};

/** Mobile logo — Figma 15461:4448 Joystie wordmark + turquoise swoosh */
function MobileNavLogo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="relative shrink-0" aria-label="Joystie" onClick={onClick}>
      <span className="relative block h-[32px] w-[65px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LANDING_ASSETS.navLogoWord}
          alt=""
          className="absolute left-[0.6px] top-[3.5px] h-[18.5px] w-[64px]"
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LANDING_ASSETS.navLogoUnderline}
          alt=""
          className="absolute left-[4px] top-[24.5px] h-[6.5px] w-[24px] origin-center rotate-[4.6deg]"
          draggable={false}
        />
      </span>
    </Link>
  );
}

export function MarketingNav({
  activeHref,
  homeHashPrefix,
  chrome = 'onDark',
}: MarketingNavProps = {}) {
  const [open, setOpen] = useState(false);
  const [showMobileSolidBar, setShowMobileSolidBar] = useState(false);
  const router = useRouter();
  const onLight = chrome === 'onLight';
  /** Section id to scroll after mobile menu unlock (iOS jumps to hero if we scroll while locked). */
  const pendingSectionIdRef = useRef<string | null>(null);
  const menuScrollYRef = useRef(0);

  /* Mobile: transparent on the hero, then dark/translucent from stats onward. */
  const barGlass = showMobileSolidBar
    ? onLight
      ? 'bg-[rgba(5,22,26,0.88)]'
      : 'bg-[rgba(5,22,26,0.55)]'
    : 'bg-transparent';
  const desktopGlass = onLight
    ? 'bg-[rgba(5,22,26,0.72)] backdrop-blur-[16px]'
    : 'bg-white/[0.01] backdrop-blur-[10px]';

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
      const resolved = resolveHref(href);

      // Absolute page (e.g. /about)
      if (resolved.startsWith('/') && !resolved.includes('#')) {
        pendingSectionIdRef.current = null;
        setOpen(false);
        router.push(resolved);
        return;
      }

      const id = resolved.includes('#')
        ? resolved.slice(resolved.indexOf('#') + 1)
        : href.replace(/^#/, '');

      if (!id) {
        setOpen(false);
        return;
      }

      const onLanding =
        typeof window !== 'undefined' &&
        (window.location.pathname === '/' || window.location.pathname === '');

      if (onLanding) {
        window.history.pushState(null, '', `/#${id}`);
        if (open) {
          // Scroll only after menu unlock restores scrollY (mobile / iOS).
          pendingSectionIdRef.current = id;
          setOpen(false);
          return;
        }
        scrollLandingToSection(id);
        return;
      }

      // From /about, /knowledge/*, etc.
      pendingSectionIdRef.current = null;
      setOpen(false);
      router.push(`/#${id}`);
    },
    [open, resolveHref, router],
  );

  /*
   * Mobile menu scroll lock — position:fixed + restore scrollY.
   * Plain overflow:hidden on iOS jumps to top (hero) when unlocking.
   */
  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    menuScrollYRef.current = scrollY;

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
    };

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;

      window.scrollTo(0, menuScrollYRef.current);

      const pending = pendingSectionIdRef.current;
      if (!pending) return;
      pendingSectionIdRef.current = null;

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.setTimeout(() => scrollLandingToSection(pending), 16);
        });
      });
    };
  }, [open]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const statsSection = document.getElementById('landing-stats');
    if (!statsSection) {
      setShowMobileSolidBar(onLight);
      return;
    }

    const sync = () => {
      const mobile = window.innerWidth < 1024;
      if (!mobile) {
        setShowMobileSolidBar(false);
        return;
      }

      const rect = statsSection.getBoundingClientRect();
      const headerBottom = MOBILE_STATUS_BAR + 20;
      setShowMobileSolidBar(rect.top <= headerBottom);
    };

    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [onLight]);

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-0 pt-[env(safe-area-inset-top)] lg:px-[var(--landing-gutter)] lg:pt-4"
      style={{ ['--landing-chrome-mobile' as string]: `${MOBILE_STATUS_BAR}px` }}
      dir="rtl"
    >
      {!open ? (
        <nav
          className={`pointer-events-auto flex h-[58px] w-full items-center justify-between px-6 lg:hidden ${barGlass}`}
          aria-label="ניווט ראשי"
        >
          {/* RTL: logo on the right (start) — Figma 15461:4447 */}
          <MobileNavLogo />

          {/* RTL: actions on the left (end) — Figma 15461:4442 menu | sep | user */}
          <div className="flex items-center gap-4" dir="ltr">
            <button
              type="button"
              className="flex size-6 shrink-0 items-center justify-center text-white"
              aria-label="פתח תפריט"
              onClick={() => setOpen(true)}
            >
              {/* Inline strokes — Figma menu-01.svg as <img> often fails to paint */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="size-6"
                aria-hidden
              >
                <path
                  d="M4 5H20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 12H20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 19H20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div
              className="h-3.5 w-px shrink-0 bg-[#518ED4]"
              aria-hidden
            />
            <Link
              href="/login"
              className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.3)]"
              style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}
              aria-label="התחברות"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LANDING_ASSETS.navUserIcon}
                alt=""
                width={17.5}
                height={17.5}
                className="block h-[17.5px] w-[17.5px] max-w-none"
                draggable={false}
              />
            </Link>
          </div>
        </nav>
      ) : null}

      {/* Desktop: logo + links on the right (start), CTAs on the left (end) */}
      <nav
        className={`pointer-events-auto mx-auto hidden max-w-[1200px] items-center justify-between gap-3 rounded-[25px] px-6 py-3 lg:flex lg:pl-[15px] lg:pr-[25px] ${desktopGlass}`}
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

        {/* Figma 15329:17364 — CTA pair: gap 8px, h 46, rounded 16, px 22 py 11 */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="inline-flex h-[46px] w-[135px] items-center justify-center rounded-[16px] border border-white px-[22px] py-[11px] font-rubik text-[16px] font-bold leading-[1.28] tracking-[-0.32px] text-white transition-colors duration-500 ease-out hover:bg-white/10"
          >
            התחברות
          </Link>
          <Link
            href="/onboarding"
            dir="rtl"
            className="inline-flex h-[46px] flex-row items-center justify-center gap-3 rounded-[16px] bg-v03-turquoise-300 px-[22px] py-[11px] font-rubik text-[16px] font-bold leading-[1.28] tracking-[-0.32px] text-[#282828] transition-[filter,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:brightness-105 hover:-translate-y-0.5"
          >
            להצטרפות
            <span className="relative flex h-5 w-[15px] shrink-0 items-center justify-center" aria-hidden>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="20"
                viewBox="0 0 15 20"
                fill="none"
                className="h-5 w-[15px]"
              >
                <path
                  d="M9.5 14.5L5.5 10.5L9.5 6.5"
                  stroke="#282828"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </nav>

      {open ? (
        <div
          className="pointer-events-auto fixed inset-0 z-[60] flex h-[100dvh] w-[100vw] max-h-[100dvh] max-w-[100vw] flex-col overflow-hidden bg-[#05161a] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          role="dialog"
          aria-modal="true"
          aria-label="תפריט"
        >
          <LandingMenuGlow />

          {/* Figma 15461:5021 — 58px bar, px 24 */}
          <div className="relative z-10 flex h-[58px] w-full shrink-0 items-center justify-between px-6">
            <MobileNavLogo onClick={() => setOpen(false)} />
            <button
              type="button"
              className="rounded-lg p-1 text-white"
              aria-label="סגור תפריט"
              onClick={() => setOpen(false)}
            >
              <X size={24} strokeWidth={2} />
            </button>
          </div>

          {/*
            Figma 15462:5511 — 24px side gutters + 327 content column.
            Do NOT put px-6 on the 327 max-width itself (that made it ~279px / “narrow”).
          */}
          <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col overflow-y-auto px-6 pb-6 pt-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto flex min-h-0 w-full max-w-[327px] flex-1 flex-col gap-[30px]">
              {/* Menu list — flex-1 so rows share height; py 24 / px 20 */}
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
                      className="relative flex min-h-0 flex-1 items-center justify-between border-b border-[#093427] bg-[rgba(7,30,35,0.7)] px-5 py-6 text-right backdrop-blur-[10px] last:border-b-0"
                    >
                      {/* RTL: first = right (label + glow), second = left (chevron) */}
                      <span className="flex min-w-0 flex-1 items-center gap-3">
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
                      {showChevron ? (
                        <Image
                          src={LANDING_ASSETS.menuChevron}
                          alt=""
                          width={6}
                          height={11}
                          className="h-[11px] w-[6px] shrink-0 opacity-90"
                          unoptimized
                        />
                      ) : (
                        <span className="w-[6px] shrink-0" aria-hidden />
                      )}
                    </a>
                  );
                })}
              </div>

              {/* Figma 15765:7029 — mountain CTA (upper crop) + login row */}
              <div className="flex w-full shrink-0 flex-col items-center gap-5">
                <div className="relative h-[194px] w-full overflow-hidden rounded-[36px]">
                  <Image
                    src={LANDING_ASSETS.footerMountainMobile}
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="327px"
                  />
                  <div
                    className="absolute inset-0 rounded-[36px]"
                    style={{
                      backgroundImage:
                        'linear-gradient(42.73deg, rgba(0, 0, 0, 0) 26.66%, rgba(0, 0, 0, 0.4) 67.26%)',
                    }}
                    aria-hidden
                  />
                  <div className="absolute inset-x-0 top-1/2 z-10 flex w-full -translate-y-1/2 flex-col items-start justify-center gap-5 px-[22.5px] text-right">
                    <p className="w-full max-w-[282px] font-rubik text-[30px] font-bold leading-[1.15] tracking-[-0.9px] text-white">
                      הדרך החדשה לנהל הרגלי מסך בריאים
                    </p>
                    {/* RTL: justify/items-start → visual right (Figma CTA on the right) */}
                    <div className="inline-flex w-full items-start justify-start">
                      <MarketingCtaButton
                        href="/onboarding"
                        label="הצטרפות לג׳ויסטי"
                        size="compact"
                        onClick={() => setOpen(false)}
                      />
                    </div>
                  </div>
                </div>

                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-between ps-5 pe-[35px]"
                  aria-label="התחברות לחשבון"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="flex shrink-0 items-center justify-center rounded-full bg-[#8c00ff]"
                      style={{ width: 26, height: 26, minWidth: 26, minHeight: 26 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={LANDING_ASSETS.navUserWhite}
                        alt=""
                        width={16.25}
                        height={16.25}
                        className="block h-[16.25px] w-[16.25px] max-w-none"
                        draggable={false}
                      />
                    </span>
                    <span className="font-rubik text-base font-bold leading-[1.28] tracking-[-0.32px] text-white">
                      התחברות לחשבון
                    </span>
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={LANDING_ASSETS.navLoginChevron}
                    alt=""
                    className="h-[9px] w-[4.5px] shrink-0"
                    draggable={false}
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
