'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { LANDING_ASSETS } from '@/constants/landing-marketing';
import { getLandingNavLinks, getLandingUi } from '@/constants/landing-i18n';
import { MarketingCtaButton } from '@/components/landing/MarketingCtaButton';
import { LandingMenuGlow } from '@/components/landing/LandingDecor';
import { scrollLandingToSection } from '@/components/landing/landingStatsStory';
import {
  landingHomePath,
  landingPathForLocale,
  useLandingLocale,
} from '@/components/landing/LandingLocaleContext';
import { useMarketingLocaleSwitch } from '@/components/landing/useMarketingLocaleSwitch';
import { useEnglishAppGateIntercept } from '@/components/landing/EnglishAppGateContext';

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
function MobileNavLogo({ href = '/', onClick }: { href?: string; onClick?: () => void }) {
  return (
    <Link href={href} className="relative shrink-0" aria-label="Joystie" onClick={onClick}>
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
  const [langOpen, setLangOpen] = useState(false);
  const [showMobileSolidBar, setShowMobileSolidBar] = useState(false);
  const [langMenuPos, setLangMenuPos] = useState<{ top: number; left?: number; right?: number } | null>(
    null,
  );
  const router = useRouter();
  const locale = useLandingLocale();
  const pathname = usePathname();
  const ui = getLandingUi(locale);
  const navLinks = getLandingNavLinks(locale);
  const homePath = landingHomePath(locale);
  const isEn = locale === 'en';
  const heLocaleHref = landingPathForLocale('he', pathname);
  const enLocaleHref = landingPathForLocale('en', pathname);
  const switchLocale = useMarketingLocaleSwitch(locale);
  const joinGate = useEnglishAppGateIntercept('join');
  const loginGate = useEnglishAppGateIntercept('login');
  const onLight = chrome === 'onLight';
  /** Section id to scroll after mobile menu unlock (iOS jumps to hero if we scroll while locked). */
  const pendingSectionIdRef = useRef<string | null>(null);
  const menuScrollYRef = useRef(0);
  const langTriggerRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

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
      const prefix = homeHashPrefix ?? (locale === 'en' ? '/en' : undefined);
      if (!prefix) return href;
      const base = prefix.replace(/\/$/, '');
      return `${base}/${href}`;
    },
    [homeHashPrefix, locale],
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

      const path =
        typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') || '/' : '/';
      const onLanding = path === '/' || path === '/en';

      if (onLanding) {
        const base = path === '/en' ? '/en' : '';
        window.history.pushState(null, '', `${base}/#${id}`);
        if (open) {
          pendingSectionIdRef.current = id;
          setOpen(false);
          return;
        }
        scrollLandingToSection(id);
        return;
      }

      pendingSectionIdRef.current = null;
      setOpen(false);
      router.push(locale === 'en' ? `/en/#${id}` : `/#${id}`);
    },
    [locale, open, resolveHref, router],
  );

  useEffect(() => {
    if (!langOpen) return;
    try {
      router.prefetch(heLocaleHref);
      router.prefetch(enLocaleHref);
    } catch {
      /* ignore */
    }
  }, [langOpen, heLocaleHref, enLocaleHref, router]);

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

  useLayoutEffect(() => {
    if (!langOpen) {
      setLangMenuPos(null);
      return;
    }
    const sync = () => {
      const el = langTriggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      /* Match prior absolute top-[43px] from trigger top */
      setLangMenuPos(
        isEn
          ? { top: rect.top + 43, right: window.innerWidth - rect.right }
          : { top: rect.top + 43, left: rect.left },
      );
    };
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [langOpen, isEn]);

  useEffect(() => {
    if (!langOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (langTriggerRef.current?.contains(target)) return;
      if (langMenuRef.current?.contains(target)) return;
      setLangOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [langOpen]);

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
      dir={isEn ? 'ltr' : 'rtl'}
    >
      {!open ? (
        <nav
          className={`pointer-events-auto flex h-[58px] w-full items-center justify-between px-6 lg:hidden ${barGlass}`}
          aria-label={ui.mainNav}
        >
          <MobileNavLogo href={homePath} />

          <div className="flex items-center gap-4" dir="ltr">
            {isEn ? (
              <>
                <Link
                  href={loginGate.href}
                  onClick={loginGate.onClick}
                  className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.3)] backdrop-blur-[11.67px]"
                  style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}
                  aria-label={ui.login}
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
                <div className="h-3.5 w-px shrink-0 bg-[#518ED4]" aria-hidden />
                <button
                  type="button"
                  className="flex size-6 shrink-0 items-center justify-center text-white"
                  aria-label={ui.openMenu}
                  onClick={() => setOpen(true)}
                >
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
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="flex size-6 shrink-0 items-center justify-center text-white"
                  aria-label={ui.openMenu}
                  onClick={() => setOpen(true)}
                >
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
                <div className="h-3.5 w-px shrink-0 bg-[#518ED4]" aria-hidden />
                <Link
                  href={loginGate.href}
                  onClick={loginGate.onClick}
                  className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.3)] backdrop-blur-[11.67px]"
                  style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}
                  aria-label={ui.login}
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
              </>
            )}
          </div>
        </nav>
      ) : null}

      {/* Desktop: logo + links on the right (start), CTAs on the left (end) */}
      <nav
        className={`pointer-events-auto mx-auto hidden max-w-[1200px] items-center justify-between gap-3 rounded-[25px] px-6 py-3 lg:flex lg:pl-[15px] lg:pr-[25px] ${desktopGlass}`}
        aria-label={ui.mainNav}
        data-chrome-offset={DESKTOP_BROWSER_CHROME}
      >
        <div className="flex flex-1 items-center justify-start gap-10">
          <Link href={homePath} className="shrink-0" aria-label="Joystie">
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
            {navLinks.map((link) => {
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

        <div className="flex items-center gap-4">
          <div className="relative" ref={langTriggerRef}>
            <button
              type="button"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-white/90 transition-opacity hover:opacity-70"
              aria-label={ui.language}
              aria-expanded={langOpen}
              aria-haspopup="menu"
              onClick={() => setLangOpen((v) => !v)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LANDING_ASSETS.globeIconDesktop}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5"
                draggable={false}
              />
            </button>
          </div>
          {langOpen && langMenuPos && typeof document !== 'undefined'
            ? createPortal(
                <div
                  ref={langMenuRef}
                  role="menu"
                  aria-label={ui.language}
                  dir={isEn ? 'ltr' : 'rtl'}
                  style={{
                    position: 'fixed',
                    top: langMenuPos.top,
                    left: langMenuPos.left,
                    right: langMenuPos.right,
                    width: 153,
                    minWidth: 153,
                    maxWidth: 153,
                    borderRadius: 24,
                    border: '1px solid #FFF',
                    background: 'rgba(120, 175, 215, 0.28)',
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
                    zIndex: 80,
                    overflow: 'hidden',
                    pointerEvents: 'auto',
                  }}
                  className={`flex flex-col ${isEn ? 'marketing-en-sf' : ''}`}
                >
                  {(isEn
                    ? ([
                        {
                          href: enLocaleHref,
                          locale: 'en' as const,
                          label: ui.langEnglish,
                          font: 'font-sf',
                        },
                        {
                          href: heLocaleHref,
                          locale: 'he' as const,
                          label: ui.langHebrew,
                          font: 'font-rubik',
                        },
                      ] as const)
                    : ([
                        {
                          href: heLocaleHref,
                          locale: 'he' as const,
                          label: ui.langHebrew,
                          font: 'font-rubik',
                        },
                        {
                          href: enLocaleHref,
                          locale: 'en' as const,
                          label: ui.langEnglish,
                          font: 'font-sf',
                        },
                      ] as const)
                  ).map((opt, i, arr) => (
                    <Link
                      key={opt.locale}
                      href={opt.href}
                      role="menuitem"
                      prefetch
                      aria-current={locale === opt.locale ? 'true' : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        setLangOpen(false);
                        switchLocale(opt.href, opt.locale);
                      }}
                      onMouseEnter={() => {
                        try {
                          router.prefetch(opt.href);
                        } catch {
                          /* ignore */
                        }
                      }}
                      className={`flex w-full items-center px-4 py-3 text-[15px] font-bold leading-none tracking-[-0.3px] text-white transition-colors duration-200 ease-out hover:bg-white/15 ${
                        opt.font
                      } ${isEn ? 'justify-start text-left' : 'justify-start text-right'} ${
                        i < arr.length - 1 ? 'border-b border-white/35' : ''
                      } ${i === 0 ? 'rounded-t-[24px]' : ''} ${
                        i === arr.length - 1 ? 'rounded-b-[24px]' : ''
                      }`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>,
                document.body,
              )
            : null}
          <Link
            href={loginGate.href}
            onClick={loginGate.onClick}
            className="inline-flex h-[46px] items-center justify-center gap-3 rounded-[16px] border border-white px-[22px] py-[11px] font-rubik text-[16px] font-bold leading-[1.28] tracking-[-0.32px] text-white transition-colors duration-500 ease-out hover:bg-white/10"
          >
            {ui.login}
          </Link>
          <Link
            href={joinGate.href}
            onClick={joinGate.onClick}
            dir={isEn ? 'ltr' : 'rtl'}
            className="inline-flex h-[46px] flex-row items-center justify-center gap-3 rounded-[16px] bg-v03-turquoise-300 px-[22px] py-[11px] font-rubik text-[16px] font-bold leading-[1.28] tracking-[-0.32px] text-[#282828] transition-[filter,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:brightness-105 hover:-translate-y-0.5"
          >
            {ui.join}
            <span className="relative flex h-5 w-[15px] shrink-0 items-center justify-center" aria-hidden>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="20"
                viewBox="0 0 15 20"
                fill="none"
                className={`h-5 w-[15px] ${isEn ? 'rotate-180' : ''}`}
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
          aria-label={ui.menuDialog}
        >
          <LandingMenuGlow />

          <div className="relative z-10 flex h-[58px] w-full shrink-0 items-center justify-between px-6">
            <MobileNavLogo href={homePath} onClick={() => setOpen(false)} />
            <div className="flex items-center gap-4" dir="ltr">
              {isEn ? (
                <>
                  <Link
                    href={loginGate.href}
                    onClick={(event) => {
                      loginGate.onClick?.(event);
                      setOpen(false);
                    }}
                    className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.3)] backdrop-blur-[11.67px]"
                    style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}
                    aria-label={ui.login}
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
                  <div className="h-3.5 w-px shrink-0 bg-[#518ED4]" aria-hidden />
                  <button
                    type="button"
                    className="rounded-lg p-1 text-white"
                    aria-label={ui.closeMenu}
                    onClick={() => setOpen(false)}
                  >
                    <X size={24} strokeWidth={2} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="rounded-lg p-1 text-white"
                    aria-label={ui.closeMenu}
                    onClick={() => setOpen(false)}
                  >
                    <X size={24} strokeWidth={2} />
                  </button>
                  <div className="h-3.5 w-px shrink-0 bg-[#518ED4]" aria-hidden />
                  <Link
                    href={loginGate.href}
                    onClick={(event) => {
                      loginGate.onClick?.(event);
                      setOpen(false);
                    }}
                    className="relative z-10 flex shrink-0 items-center gap-2"
                    aria-label={ui.login}
                  >
                    <span
                      className="flex shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.3)] backdrop-blur-[11.67px]"
                      style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}
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
                    </span>
                    <span className="font-rubik text-sm font-bold leading-none tracking-[-0.28px] text-white">
                      {ui.login}
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col overflow-hidden px-6 pb-6 pt-2.5">
            <div className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col gap-5">
              {/* Select / nav links — fills leftover viewport; footer compresses on short screens */}
              <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[36px] border border-[#093427]">
                {navLinks.map((link) => {
                  const showChevron =
                    link.href === '#knowledge' ||
                    link.href === '/about' ||
                    link.href === '/en/about';
                  return (
                    <a
                      key={link.href}
                      href={resolveHref(link.href)}
                      onClick={(e) => {
                        e.preventDefault();
                        goTo(link.href);
                      }}
                      className={`relative flex min-h-0 flex-1 items-center justify-between border-b border-[#093427] bg-[rgba(7,30,35,0.7)] px-5 py-3 backdrop-blur-[10px] last:border-b-0 sm:py-6 ${
                        isEn ? 'text-left' : 'text-right'
                      }`}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <Image
                          src={LANDING_ASSETS.menuGlow}
                          alt=""
                          width={16}
                          height={16}
                          className="size-4 shrink-0"
                          unoptimized
                        />
                        <span
                          className={`font-rubik text-[18px] font-bold leading-[1.2] text-white ${
                            isEn ? 'tracking-[-0.72px]' : 'tracking-[-0.36px]'
                          }`}
                        >
                          {link.label}
                        </span>
                      </span>
                      {showChevron ? (
                        <Image
                          src={LANDING_ASSETS.menuChevron}
                          alt=""
                          width={6}
                          height={11}
                          className={`h-[11px] w-[6px] shrink-0 opacity-90 ${isEn ? 'rotate-180' : ''}`}
                          unoptimized
                        />
                      ) : (
                        <span className="w-[6px] shrink-0" aria-hidden />
                      )}
                    </a>
                  );
                })}
              </div>

              <div className="flex min-h-0 w-full shrink flex-col items-center gap-3 sm:gap-5">
                <div className="relative h-[194px] max-h-[min(194px,28dvh)] min-h-[96px] w-full shrink overflow-hidden rounded-[36px]">
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
                  <div
                    className={`absolute inset-x-0 top-1/2 z-10 flex w-full -translate-y-1/2 flex-col justify-center gap-3 px-[22.5px] sm:gap-5 ${
                      isEn ? 'items-start text-left' : 'items-start text-right'
                    }`}
                  >
                    <p
                      className={`w-full max-w-[282px] font-rubik font-bold leading-[1.15] text-white ${
                        isEn ? 'text-[28px] tracking-[-1.28px]' : 'text-[30px] tracking-[-0.9px]'
                      }`}
                    >
                      {ui.menuTagline}
                    </p>
                    <div className="inline-flex w-full items-start justify-start">
                      <MarketingCtaButton
                        href="/onboarding"
                        label={ui.joinRevolution}
                        size="compact"
                        onClick={() => setOpen(false)}
                      />
                    </div>
                  </div>
                </div>

                {/* Language toggle — Figma globe-02 in purple circle */}
                <div className="flex w-full shrink-0 items-center justify-between px-5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8c00ff]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={LANDING_ASSETS.globeIcon}
                        alt=""
                        width={16}
                        height={16}
                        className="h-4 w-4"
                        draggable={false}
                      />
                    </span>
                    <span className="font-rubik text-base tracking-[-0.64px] text-white">
                      {ui.language}
                    </span>
                  </div>
                  <div
                    className="flex items-center"
                    role="group"
                    aria-label={ui.language}
                    dir="ltr"
                  >
                    <Link
                      href={enLocaleHref}
                      prefetch
                      onClick={(event) => {
                        event.preventDefault();
                        setOpen(false);
                        switchLocale(enLocaleHref, 'en');
                      }}
                      aria-current={locale === 'en' ? 'true' : undefined}
                      className={`inline-flex items-center justify-center gap-2.5 rounded-[300px] px-2.5 py-1.5 font-rubik text-sm tracking-[-0.56px] transition-colors ${
                        locale === 'en'
                          ? 'bg-[rgba(255,255,255,0.10)] font-bold text-white'
                          : 'bg-[rgba(255,255,255,0)] font-normal text-[#abbec3]'
                      }`}
                    >
                      {ui.langEnglish}
                    </Link>
                    <Link
                      href={heLocaleHref}
                      prefetch
                      onClick={(event) => {
                        event.preventDefault();
                        setOpen(false);
                        switchLocale(heLocaleHref, 'he');
                      }}
                      aria-current={locale === 'he' ? 'true' : undefined}
                      className={`inline-flex items-center justify-center gap-2.5 rounded-[300px] px-2.5 py-1.5 font-rubik text-sm tracking-[-0.56px] transition-colors ${
                        locale === 'he'
                          ? 'bg-[rgba(255,255,255,0.10)] font-bold text-white'
                          : 'bg-[rgba(255,255,255,0)] font-normal text-[#abbec3]'
                      }`}
                    >
                      {ui.langHebrew}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
