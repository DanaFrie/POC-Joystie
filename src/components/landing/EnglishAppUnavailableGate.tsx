'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { JoystieWordmark } from '@/components/brand/JoystieWordmark';
import { FunnelDesktopOverlay } from '@/components/ui/FunnelDesktopOverlay';
import { LANDING_ASSETS } from '@/constants/landing-marketing';
import { ENGLISH_WAITLIST as copy } from '@/constants/english-waitlist';
import { submitEnglishWaitlist } from '@/lib/api/englishWaitlist';
import {
  useEnglishAppGateOptional,
} from '@/components/landing/EnglishAppGateContext';

type GateStep = 'notice' | 'waitlist' | 'qr';

function CloseGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BackGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WaitlistChevron() {
  return (
    <svg
      width="15"
      height="20"
      viewBox="0 0 15 20"
      fill="none"
      aria-hidden
      className="h-5 w-[15px]"
    >
      <path
        d="M5.5 6.5L9.5 10.5L5.5 14.5"
        stroke="#282828"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma Hebrew “א” mark — turquoise strokes in the 145px circle. */
function HebrewOnlyGlobe() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="85"
      height="85"
      viewBox="0 0 85 85"
      fill="none"
      aria-hidden
      className="size-[85px]"
    >
      <path
        d="M12.3259 17.6214H28.1853M28.1853 17.6214H47.5688M28.1853 17.6214V12.335M17.6124 47.578C26.4232 40.5294 36.9959 26.4322 38.7581 17.6214M22.8988 26.4322C24.661 31.7186 31.7096 40.5294 35.2339 42.2916"
        stroke="#00FFB3"
        strokeWidth="5.28646"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.6128 47.5787C26.4236 40.5301 36.9963 26.4328 38.7585 17.6221"
        stroke="#00FFB3"
        strokeWidth="5.28646"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40.5198 72.2497L49.9004 50.3613C52.6705 43.8984 54.0552 40.667 56.3792 40.667C58.7031 40.667 60.0881 43.8984 62.8579 50.3613L72.2385 72.2497"
        stroke="#00FFB3"
        strokeWidth="5.28646"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M47.5686 58.1514H65.1901"
        stroke="#00FFB3"
        strokeWidth="5.28646"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HebrewSpeakerRow() {
  return (
    <div className="flex w-full items-center justify-center gap-5">
      <span className="h-px flex-1 bg-[#90A79F]" aria-hidden />
      <span className="shrink-0 text-center font-sf text-[14px] font-normal leading-[17.92px] text-[#90A79F]">
        {copy.hebrewSpeaker}
      </span>
      <span className="h-px flex-1 bg-[#90A79F]" aria-hidden />
    </div>
  );
}

function EmailField({
  value,
  onChange,
  error,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id: string;
}) {
  return (
    <label className="flex w-full flex-col items-start gap-0.5 text-left" htmlFor={id} dir="ltr">
      <span className="px-2.5 text-left font-sf text-[16px] font-normal leading-[20.48px] text-white">
        {copy.emailLabel}
      </span>
      <input
        id={id}
        type="email"
        inputMode="email"
        autoComplete="email"
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[48.5px] w-full rounded-[18px] bg-white/5 px-[15px] py-3.5 text-left font-sf text-[16px] font-normal leading-[20.48px] text-white outline outline-1 outline-white/20 focus:outline-white/40"
      />
      {error ? (
        <span className="px-2.5 font-sf text-[13px] text-[#ff8a8a]">{error}</span>
      ) : null}
    </label>
  );
}

function CardHeader({
  onClose,
  onBack,
}: {
  onClose: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-between self-stretch">
      <button
        type="button"
        onClick={onClose}
        aria-label={copy.close}
        className="flex h-6 w-6 shrink-0 items-center justify-center"
      >
        <CloseGlyph />
      </button>
      <JoystieWordmark width={49} height={24} className="h-[24.29px] w-[49px] shrink-0" />
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label={copy.back}
          className="flex h-6 w-6 shrink-0 items-center justify-center"
        >
          <BackGlyph />
        </button>
      ) : (
        <span className="h-6 w-6 shrink-0" aria-hidden />
      )}
    </div>
  );
}

function MobileCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[min(580px,calc(100dvh-96px))] w-[calc(100vw-48px)] max-w-[327px] shrink-0 flex-col items-center justify-between overflow-visible rounded-[18px] bg-[#0A232A] px-[18px] pb-[30px] pt-5 shadow-[2px_2px_15px_rgba(0,0,0,0.08)] outline outline-1 outline-[#093427] outline-offset-[-1px]">
      <div
        className="pointer-events-none absolute left-[107px] top-[587px] size-[113px] rounded-full bg-[rgba(0,255,179,0.6)] blur-[62px]"
        aria-hidden
      />
      {children}
    </div>
  );
}

function DoriPhoneAvatar() {
  return (
    <div className="relative z-10 h-[145px] w-[145px] shrink-0 overflow-visible">
      <div className="absolute inset-0 rounded-full bg-[#05161A]" aria-hidden />
      <Image
        src={LANDING_ASSETS.doriJoyApp}
        alt=""
        width={209}
        height={209}
        className="pointer-events-none absolute left-[-29px] top-[-42px] z-10 h-[209px] w-[209px] max-w-none object-contain"
        unoptimized
      />
    </div>
  );
}

export function EnglishAppUnavailableGate() {
  const gate = useEnglishAppGateOptional();
  const router = useRouter();
  const [step, setStep] = useState<GateStep>('notice');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!gate?.open) return;
    setStep('notice');
    setEmail('');
    setError('');
    setBusy(false);
    setDone(false);
  }, [gate?.open]);

  useEffect(() => {
    if (!gate?.open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') gate.hide();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [gate]);

  if (!gate?.open) return null;

  const hebrewHref = gate.intent === 'login' ? '/login' : '/onboarding';

  const goHebrew = () => {
    const desktop = window.matchMedia('(min-width: 1024px)').matches;
    if (desktop) {
      setStep('qr');
      return;
    }
    gate.closeForNavigate();
    router.push(hebrewHref);
  };

  const onWaitlist = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || done) return;
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(copy.emailInvalid);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await submitEnglishWaitlist(trimmed);
      setDone(true);
      window.setTimeout(() => {
        gate.hide();
        router.push('/en');
      }, 700);
    } catch {
      setError(copy.waitlistError);
      setBusy(false);
    }
  };

  if (step === 'qr') {
    return (
      <FunnelDesktopOverlay
        position="fixed"
        scanPath={hebrewHref}
        homeHref="/en"
      />
    );
  }

  return (
    <div
      data-marketing-overlay
      dir="ltr"
      lang="en"
      className="marketing-page-fade fixed inset-0 z-[80] w-[100vw] max-w-[100vw] text-left [direction:ltr] lg:isolate lg:overflow-hidden lg:bg-[#05161A]"
      role="dialog"
      aria-modal="true"
      aria-label={copy.titleDesktop.replace('\n', ' ')}
    >
      {/* Mobile — blurred hero behind the card */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LANDING_ASSETS.heroMobile}
          alt=""
          decoding="async"
          className="absolute inset-0 h-full w-full scale-110 object-cover object-[center_40%] blur-[15px]"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>
      <button
        type="button"
        className="absolute inset-0 bg-transparent lg:bg-transparent"
        aria-label={copy.close}
        onClick={gate.hide}
      />
      {/* Mint ellipse — same as QR / FunnelDesktopOverlay */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
        style={{
          width: 264,
          height: 264,
          borderRadius: 264,
          background: '#1BECAE',
          filter: 'blur(332.2404479980469px)',
        }}
        aria-hidden
      />

      {/* Mobile cards */}
      <div className="relative z-10 flex h-full items-center justify-center overflow-y-auto px-6 py-6 lg:hidden">
        {step === 'notice' ? (
          <div key="notice" className="marketing-page-fade">
            <MobileCard>
              <div className="flex w-full flex-col items-center self-stretch">
                <CardHeader onClose={gate.hide} />
              </div>
              <div className="relative flex h-[145px] w-[145px] shrink-0 items-center justify-center rounded-full bg-[#05161A]">
                <HebrewOnlyGlobe />
              </div>
              <div className="flex w-full flex-col items-center gap-[15px] self-stretch px-[15px]">
                <h2 className="w-full text-center font-sf text-[30px] font-bold leading-9 text-white">
                  {copy.titleLine1}
                  <br />
                  {copy.titleLine2} {copy.titleAccent}
                </h2>
              </div>
              <div className="flex w-full flex-col items-stretch gap-4 self-stretch">
                <button
                  type="button"
                  onClick={() => setStep('waitlist')}
                  className="inline-flex h-[55px] items-center justify-center rounded-[22px] bg-[#00FFB3] px-[15px] py-2 font-sf text-[18px] font-bold leading-[23.94px] text-[#092125] shadow-[2px_2px_20px_rgba(109,109,109,0.15)]"
                >
                  {copy.joinWaitlist}
                </button>
                <HebrewSpeakerRow />
                <button
                  type="button"
                  onClick={goHebrew}
                  lang="he"
                  className="inline-flex h-[55px] items-center justify-center rounded-[22px] px-[15px] py-2 font-he-rubik text-[18px] font-bold leading-[21.6px] text-white outline outline-1 outline-white outline-offset-[-1px] shadow-[2px_2px_20px_rgba(109,109,109,0.15)]"
                >
                  {copy.iSpeakHebrew}
                </button>
              </div>
            </MobileCard>
          </div>
        ) : (
          <div key="waitlist" className="marketing-page-fade">
            <MobileCard>
              <div className="flex w-full flex-col items-start gap-[67px] self-stretch">
                <CardHeader onClose={gate.hide} onBack={() => setStep('notice')} />
                <div className="flex w-full flex-col items-center justify-center gap-[35px] self-stretch">
                  <DoriPhoneAvatar />
                  <div className="flex w-full flex-col items-center gap-2">
                    <h2 className="w-full text-center font-sf text-[32px] font-bold leading-[36.8px] text-white">
                      {copy.waitlistTitle}
                    </h2>
                    <p className="w-full text-center font-sf text-[16px] font-normal leading-[20.48px] text-white">
                      {copy.waitlistBody}
                    </p>
                  </div>
                </div>
              </div>
              <form className="flex w-full flex-col gap-5 self-stretch" onSubmit={onWaitlist}>
                <EmailField
                  id="en-waitlist-email-mobile"
                  value={email}
                  onChange={(v) => {
                    setEmail(v);
                    setError('');
                  }}
                  error={error}
                />
                <button
                  type="submit"
                  disabled={busy || done}
                  className="inline-flex h-[55px] items-center justify-center rounded-[22px] bg-[#00FFB3] px-[15px] py-2 font-sf text-[18px] font-bold leading-[23.94px] text-[#092125] shadow-[2px_2px_20px_rgba(109,109,109,0.15)] disabled:opacity-70"
                >
                  {done ? copy.waitlistSuccess : copy.joinWaitlist}
                </button>
              </form>
            </MobileCard>
          </div>
        )}
      </div>

      {/* Desktop — message left, waitlist form right (LTR) */}
      <div className="relative z-10 hidden h-full w-full max-w-[100vw] items-center justify-center overflow-y-auto px-8 py-12 lg:flex">
        <div className="flex w-full flex-row items-stretch justify-center gap-10" dir="ltr">
          <div className="flex min-w-0 w-full max-w-[563px] flex-1 flex-col items-start justify-center gap-10 text-left">
            <JoystieWordmark width={140} height={69} className="h-auto w-[140px] shrink-0" />
            <h2 className="w-full whitespace-pre-line text-left font-sf text-[45px] font-bold leading-[54px] text-white">
              {copy.titleDesktop}
            </h2>
          </div>
          <form
            className="flex w-[337px] shrink-0 flex-col items-start justify-between self-stretch text-left"
            onSubmit={onWaitlist}
            dir="ltr"
          >
            <div className="flex w-full flex-col gap-[19px]">
              <EmailField
                id="en-waitlist-email-desktop"
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  setError('');
                }}
                error={error}
              />
              <button
                type="submit"
                disabled={busy || done}
                dir="ltr"
                className="inline-flex h-[46px] flex-row items-center justify-center gap-3 self-stretch rounded-2xl bg-[#00FFB3] px-[22px] py-[11px] disabled:opacity-70"
              >
                <span className="font-sf text-[18px] font-bold leading-[23.94px] text-[#282828]">
                  {done ? copy.waitlistSuccess : copy.joinWaitlist}
                </span>
                {done ? null : <WaitlistChevron />}
              </button>
            </div>
            <HebrewSpeakerRow />
            <button
              type="button"
              onClick={goHebrew}
              lang="he"
              className="inline-flex h-[46px] items-center justify-center self-stretch rounded-2xl px-[22px] py-[11px] outline outline-1 outline-white outline-offset-[-1px]"
            >
              <span className="font-he-rubik text-[16px] font-bold leading-[20.48px] text-white">
                {copy.iSpeakHebrew}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
