'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PARENT_DASHBOARD_ASSETS,
  PARENT_DASHBOARD_COLORS,
} from '@/constants/parent-dashboard-layout';
import { formatCountdown } from '@/components/dashboard/DashboardScreenTimeRing';
import { DashboardConversionBar } from '@/components/dashboard/DashboardChildSections';
import { formatNumber } from '@/utils/formatting';

type DashboardChallengeBannerProps = {
  childName: string;
  reductionPercent?: number | null;
  headline?: string;
  onClick?: () => void;
  /** Active deal — show countdown until redemption, disable tap. */
  dealActive?: boolean;
  countdownTarget?: Date | null;
  countdownStart?: Date | null;
  /** Countdown finished — summary CTA that copies child URL. */
  summaryMode?: boolean;
  onCopyChildUrl?: () => void;
  disabled?: boolean;
};

function pad2(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

export function DashboardChallengeBanner({
  childName,
  reductionPercent = 55,
  headline,
  onClick,
  dealActive = false,
  countdownTarget = null,
  countdownStart = null,
  summaryMode = false,
  onCopyChildUrl,
  disabled = false,
}: DashboardChallengeBannerProps) {
  const [now, setNow] = useState(() => Date.now());
  const endedRef = useRef(false);

  useEffect(() => {
    if (!dealActive || !countdownTarget || summaryMode) return;
    endedRef.current = false;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= countdownTarget.getTime() && !endedRef.current) {
        endedRef.current = true;
      }
    };
    tick();
    // Single interval — no Firestore reads.
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [dealActive, countdownTarget, summaryMode]);

  const remainingMs = countdownTarget ? countdownTarget.getTime() - now : 0;
  const countdownDone = summaryMode || (dealActive && remainingMs <= 0);
  const showingTimer = dealActive && !countdownDone;
  /** Pre-deal CTA — Figma default chip includes 55%. */
  const showingTeaserLabel = !showingTimer && !countdownDone;

  const tagText = showingTeaserLabel
    ? 'לצמצום זמן מסך ב-55%'
    : reductionPercent != null && reductionPercent > 0
      ? `לצמצום זמן מסך ב-${reductionPercent}%`
      : 'לצמצום זמן מסך';

  const countdown = formatCountdown(remainingMs);

  let resolvedHeadline = headline;
  if (!resolvedHeadline) {
    if (countdownDone && childName) {
      resolvedHeadline = `לסיכום השבוע של ${childName} >>`;
    } else if (dealActive && childName) {
      resolvedHeadline = `לטעינת ארנק מסך שבועי ל${childName}`;
    } else if (childName) {
      resolvedHeadline = `לטעינת ארנק מסך שבועי ל${childName} >>`;
    } else {
      resolvedHeadline = 'לטעינת ארנק מסך שבועי >>';
    }
  }

  const isDisabled = disabled || showingTimer;
  const handleClick = () => {
    if (isDisabled) return;
    if (countdownDone && onCopyChildUrl) {
      onCopyChildUrl();
      return;
    }
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`relative flex min-h-[145px] w-full flex-col items-stretch justify-end overflow-hidden rounded-[32px] px-4 py-5 text-right ${
        isDisabled ? 'cursor-default opacity-95' : ''
      }`}
      style={{
        backgroundImage: `url(${PARENT_DASHBOARD_ASSETS.challengeBanner})`,
        backgroundColor: '#0a2a2c',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: '72% 78%',
        border: `1px solid ${PARENT_DASHBOARD_COLORS.cardOutline}`,
        outline: 'none',
      }}
      dir="rtl"
    >
      {/* Soft scrim so long headlines stay readable over the art. */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px]"
        style={{
          background:
            'linear-gradient(90deg, rgba(6, 28, 30, 0) 0%, rgba(6, 28, 30, 0.2) 40%, rgba(6, 28, 30, 0.55) 100%)',
        }}
        aria-hidden
      />

      <div className="relative z-[1] flex w-full max-w-[calc(100%-38%)] flex-col items-stretch gap-1.5 self-stretch pe-1 ps-0 sm:max-w-[calc(100%-120px)]">
        <span className="inline-flex max-w-full self-start items-center justify-center rounded-[300px] bg-black/35 px-2 py-1 font-simpler text-[12px] font-normal leading-[15px] text-white backdrop-blur-[2px]">
          {tagText}
        </span>

        {showingTimer ? (
          <p
            className="w-full max-w-full break-words text-right font-simpler text-[clamp(16px,4.8vw,20px)] font-black leading-[1.2] tracking-[-0.3px] text-white [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)]"
            dir="ltr"
          >
            {countdown.days}:{pad2(countdown.hours)}:{pad2(countdown.minutes)}:
            {pad2(countdown.seconds)}
          </p>
        ) : (
          <p className="w-full max-w-full break-words text-right font-simpler text-[clamp(15px,4.6vw,19px)] font-black leading-[1.2] tracking-[-0.3px] text-white [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)]">
            {resolvedHeadline}
          </p>
        )}
      </div>
    </button>
  );
}

type ParentDealExtrasProps = {
  hourlyRate: number;
  visible: boolean;
};

/** Conversion under the challenge CTA when a deal is running. */
export function ParentDealExtras({ hourlyRate, visible }: ParentDealExtrasProps) {
  const moneyLabel = useMemo(
    () => `${formatNumber(hourlyRate, 1)} ש"ח לשעה`,
    [hourlyRate]
  );

  if (!visible) return null;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <DashboardConversionBar
        savedMinutes={60}
        balance={hourlyRate}
        moneyLabel={moneyLabel}
      />
    </div>
  );
}
