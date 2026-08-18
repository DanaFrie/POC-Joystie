'use client';

import Image from 'next/image';
import { formatNumber } from '@/utils/formatting';
import {
  CHILD_DASHBOARD_ASSETS,
  CHILD_DASHBOARD_LAYOUT,
} from '@/constants/child-dashboard-layout';

type DashboardConversionBarProps = {
  savedMinutes: number;
  balance: number;
  /** Override center money label (e.g. challenge deal rate). */
  moneyLabel?: string;
  /** Figma child before-payment — flame + קומבו instead of minutes. */
  mode?: 'minutes' | 'combo';
  comboEnabled?: boolean;
  onComboClick?: () => void;
};

/** Figma 13652:17670 — conversion time → money bar */
export function DashboardConversionBar({
  savedMinutes,
  balance,
  moneyLabel,
  mode = 'minutes',
  comboEnabled = false,
  onComboClick,
}: DashboardConversionBarProps) {
  const moneyText = moneyLabel ?? `המרה ל-₪${formatNumber(balance, 0)}`;
  const isCombo = mode === 'combo';
  const comboLive = isCombo && comboEnabled;
  return (
    <div
      className="relative h-14 w-full overflow-visible"
      dir="ltr"
      style={{
        borderRadius: 300,
        background: 'rgba(0, 0, 0, 0.00)',
        boxShadow:
          'inset 0 0 0 1px rgba(197, 237, 225, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Coins cluster — left */}
      <div
        className="pointer-events-none absolute left-[-3px] top-0 z-[1]"
        style={{ width: 54.364, height: 52 }}
        aria-hidden
      >
        <Image
          src={CHILD_DASHBOARD_ASSETS.conversionCoins}
          alt=""
          width={55}
          height={52}
          className="h-full w-full max-w-none object-contain"
          unoptimized
        />
      </div>

      {/* Label — centered between coins and toggle */}
      <p
        className="absolute left-1/2 top-1/2 w-[136px] -translate-x-[calc(50%+29px)] -translate-y-1/2 text-center font-simpler tracking-[-0.28px]"
        dir="rtl"
        style={{
          color: isCombo ? '#FFFFFF' : 'rgba(255, 255, 255, 0.40)',
          fontSize: 14,
          fontWeight: 700,
          lineHeight: '14px',
        }}
      >
        {moneyText}
      </p>

      {/* Minutes / combo toggle — inset from right */}
      <button
        type="button"
        disabled={isCombo && !comboLive}
        tabIndex={isCombo ? undefined : -1}
        onClick={isCombo ? onComboClick : undefined}
        className="absolute right-[6px] top-[6px] z-[1] flex h-[44px] w-[108px] items-center justify-center px-2"
        style={{
          borderRadius: 300,
          background: 'rgba(18, 57, 54, 0.50)',
          boxShadow: comboLive
            ? 'inset 0 0 0 1px rgba(0, 231, 162, 0.28)'
            : 'none',
          opacity: isCombo && !comboLive ? 0.4 : 1,
          cursor: isCombo ? (comboLive ? 'pointer' : 'not-allowed') : 'default',
        }}
        aria-label={isCombo ? 'קומבו' : undefined}
        aria-disabled={isCombo && !comboLive}
      >
        <div className="flex items-center">
          <span className="relative z-[1] -mr-[9.625px] size-[14px] shrink-0">
            <Image
              src={CHILD_DASHBOARD_ASSETS.conversionChevron}
              alt=""
              width={14}
              height={14}
              className="size-full"
              unoptimized
            />
          </span>
          <span className="size-[14px] shrink-0">
            <Image
              src={CHILD_DASHBOARD_ASSETS.conversionChevron}
              alt=""
              width={14}
              height={14}
              className="size-full"
              unoptimized
            />
          </span>
        </div>

        <div className="flex items-center gap-[6px]">
          <span
            className="whitespace-nowrap text-center font-simpler"
            dir="rtl"
            style={{
              color: isCombo ? '#C5EDE1' : 'rgba(197, 237, 225, 0.40)',
              fontSize: 14,
              fontWeight: 700,
              lineHeight: '14px',
            }}
          >
            {isCombo ? 'קומבו' : `${Math.round(savedMinutes)} דק׳`}
          </span>
          <Image
            src={
              isCombo
                ? CHILD_DASHBOARD_ASSETS.conversionFlame
                : CHILD_DASHBOARD_ASSETS.conversionClock
            }
            alt=""
            width={18}
            height={18}
            className="size-[18px] shrink-0"
            unoptimized
          />
        </div>
      </button>
    </div>
  );
}

type DashboardChildStartCtaProps = {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
  /** Caption under the CTA (clock + waiting copy). */
  waitingCaption?: string;
  waitingIcon?: boolean;
};

export function DashboardChildStartCta({
  onClick,
  label = 'הגדרת הדיל הראשון בארנק שלי',
  disabled = false,
  waitingCaption,
  waitingIcon = true,
}: DashboardChildStartCtaProps) {
  return (
    <div className="flex w-full flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex min-h-[55px] w-full items-center justify-center rounded-[22px] bg-[#00FFB3] px-[15px] py-2 text-right font-simpler text-[18px] font-bold leading-[1.2] tracking-[-0.36px] text-[#092125] shadow-[2px_2px_20px_rgba(109,109,109,0.15)] ${
          disabled ? 'cursor-not-allowed opacity-40' : ''
        }`}
      >
        {label}
      </button>
      {waitingCaption ? (
        <div className="flex items-center justify-center gap-1.5">
          <p className="text-center font-simpler text-[14px] font-normal leading-[1.25] tracking-[-0.28px] text-[#BCC8CB]">
            {waitingCaption}
          </p>
          {waitingIcon ? (
            <span className="relative size-[18px] shrink-0 overflow-hidden">
              <Image
                src={CHILD_DASHBOARD_ASSETS.timeCircle}
                alt=""
                width={18}
                height={18}
                className="size-full"
                unoptimized
              />
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type DashboardChildGreetingVariant =
  | 'beforePayment'
  | 'card'
  | 'running'
  | 'redeem'
  | 'earned';

type DashboardChildGreetingProps = {
  childName: string;
  /** Hide the pre-deal wallet teaser once the child confirmed the deal. */
  showWalletTeaser?: boolean;
  variant?: 'plain' | DashboardChildGreetingVariant;
  daysRemaining?: number;
  earnedAmount?: number;
};

export function DashboardChildGreeting({
  childName,
  showWalletTeaser = true,
  variant = 'plain',
  daysRemaining = 0,
  earnedAmount = 0,
}: DashboardChildGreetingProps) {
  if (variant === 'plain') {
    return (
      <div className="flex w-[197px] flex-col items-center gap-0.5 text-center text-[#F6F7F6]">
        <h1 className="w-full font-simpler text-[24px] font-black leading-[27.6px]">
          היי {childName}!
        </h1>
        {showWalletTeaser ? (
          <p className="w-[225px] font-simpler text-[16px] font-normal leading-[21.6px]">
            כשתיפתח הגישה לארנק, כאן יופיע החסכון שלנו בזמן מסך ובכסף!
          </p>
        ) : null}
      </div>
    );
  }

  const resolved = variant === 'card' ? 'beforePayment' : variant;
  const notebook = resolved === 'running' || resolved === 'redeem';
  const title =
    resolved === 'running'
      ? `קדימה ${childName}!`
      : resolved === 'redeem'
        ? 'הדיל הסתיים!'
        : resolved === 'earned'
          ? `הרווחת השבוע ₪${formatNumber(earnedAmount, 1)}`
          : `שלום ${childName}!`;
  const body =
    resolved === 'running'
      ? daysRemaining <= 0
        ? 'בקרוב מתעדים את זמן המסך, סומך עליך :)'
        : `עוד ${daysRemaining} ימים מתעדים את זמן המסך, סומך עליך :)`
      : resolved === 'redeem'
        ? 'הגיע הזמן לתעד את זמן המסך השבוע!'
        : resolved === 'earned'
          ? `כל הכבוד ${childName}!`
          : 'בקרוב מתחילים לחסוך זמן מסך וכסף!';

  /**
   * Same 100vw-safe pattern as parent `DashboardDailyAverageCard` (withDori):
   * Dori absolute on physical left (may overhang); text capped on RTL start
   * so copy squeezes on S9+ instead of overlapping the art.
   */
  if (notebook) {
    return (
      <div
        className="relative mt-10 flex min-h-[123px] w-full flex-col items-start justify-center overflow-visible rounded-[32px] px-5 py-5"
        style={{ background: 'rgba(255, 255, 255, 0.10)' }}
        dir="rtl"
      >
        <div
          className="pointer-events-none absolute z-[2] size-[180px] overflow-visible"
          style={{ left: -28, top: -75 }}
          aria-hidden
        >
          <Image
            src={CHILD_DASHBOARD_ASSETS.greetingDoriNotebook}
            alt=""
            width={180}
            height={180}
            className="size-[180px] max-w-none object-contain object-center"
            sizes="180px"
            priority
          />
        </div>
        <div className="relative z-[1] flex w-full max-w-[calc(100%-120px)] flex-col items-start justify-center gap-[5px] self-start text-right text-[#F6F7F6]">
          <p className="w-full font-simpler text-[clamp(18px,5.2vw,24px)] font-black leading-[1.1] tracking-[-0.72px]">
            {title}
          </p>
          <p className="w-full font-simpler text-[clamp(13px,3.6vw,16px)] font-normal leading-[1.28] tracking-[-0.32px]">
            {body}
          </p>
        </div>
      </div>
    );
  }

  const coinsSize = resolved === 'earned' ? 172 : 167;
  const coinsLeft = resolved === 'earned' ? -5 : 6;
  const coinsTop = resolved === 'earned' ? -2 : -4;

  return (
    <div
      className="relative flex min-h-[123px] w-full flex-col items-start justify-center overflow-hidden rounded-[32px] px-5 py-5"
      style={{ background: 'rgba(255, 255, 255, 0.10)' }}
      dir="rtl"
    >
      <div
        className="pointer-events-none absolute z-[2]"
        style={{
          left: coinsLeft,
          top: coinsTop,
          width: coinsSize,
          height: coinsSize,
        }}
        aria-hidden
      >
        <Image
          src={CHILD_DASHBOARD_ASSETS.greetingDori}
          alt=""
          width={coinsSize}
          height={coinsSize}
          className="size-full max-w-none object-contain object-bottom"
          sizes={`${coinsSize}px`}
          priority
        />
      </div>
      <div className="relative z-[1] flex w-full max-w-[calc(100%-140px)] flex-col items-start justify-center gap-[5px] self-start text-right text-[#F6F7F6]">
        <p className="w-full font-simpler text-[clamp(18px,5.2vw,24px)] font-black leading-[1.1] tracking-[-0.72px]">
          {title}
        </p>
        <p className="w-full font-simpler text-[clamp(13px,3.6vw,16px)] font-normal leading-[1.28] tracking-[-0.32px]">
          {body}
        </p>
      </div>
    </div>
  );
}

type DashboardChildDealCountdownProps = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function DashboardChildDealCountdown({
  days,
  hours,
  minutes,
  seconds,
}: DashboardChildDealCountdownProps) {
  const cells = [
    { value: days, label: 'ימים' },
    { value: hours, label: 'שעות' },
    { value: minutes, label: 'דקות' },
    { value: seconds, label: 'שניות' },
  ];

  return (
    <div className="flex w-full flex-col items-center gap-1.5">
      <p className="text-center font-simpler text-[14px] font-normal leading-[1.25] tracking-[-0.28px] text-[#97ABB1]">
        זמן לסיום הדיל:
      </p>
      <div className="flex w-[244px] items-center gap-2.5" dir="rtl">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="flex h-[52px] min-w-px flex-1 items-center justify-center rounded-[12px] border px-2 shadow-[0px_0px_6.7px_rgba(0,0,0,0.08)]"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: '#415152',
            }}
          >
            <div className="flex flex-col items-center justify-center text-center text-white">
              <p className="font-simpler text-[16px] font-bold leading-[1.28] tracking-[-0.32px]">
                {cell.value}
              </p>
              <p className="font-simpler text-[12px] font-normal uppercase leading-[1.25] tracking-[-0.18px]">
                {cell.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardChildDealEndedBanner() {
  return (
    <div
      className="flex h-9 w-full items-center justify-center gap-2 rounded-[26px] border pr-[5px] shadow-[0px_0px_6.7px_rgba(0,0,0,0.08)]"
      dir="ltr"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderColor: '#415152',
      }}
    >
      <p className="text-center font-simpler text-[14px] font-normal leading-[1.25] tracking-[-0.28px] text-white">
        הדיל הסתיים!
      </p>
      <span className="relative size-[18px] shrink-0 overflow-hidden">
        <Image
          src={CHILD_DASHBOARD_ASSETS.timeCircle}
          alt=""
          width={18}
          height={18}
          className="size-full"
          unoptimized
        />
      </span>
    </div>
  );
}

const SCREEN_DAY_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'] as const;

type DashboardChildWeeklyScreenTimeCardProps = {
  minutesBySundayIndex: number[];
  remaining: number;
  weeklyBudget: number;
};

export function DashboardChildWeeklyScreenTimeCard({
  minutesBySundayIndex,
  remaining,
  weeklyBudget,
}: DashboardChildWeeklyScreenTimeCardProps) {
  const budget = Math.max(0, weeklyBudget);
  const kept = Math.max(0, remaining);
  const fillPercent = budget > 0 ? Math.min(100, Math.max(0, (kept / budget) * 100)) : 0;

  return (
    <section
      className="flex w-full flex-col items-start gap-5 rounded-[32px] px-[18px] pb-[15px] pt-5"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        outline: '1px solid rgba(247, 248, 247, 0.20)',
        outlineOffset: -1,
      }}
    >
      <p className="w-full px-2 text-center font-simpler text-[20px] font-bold leading-[1.2] tracking-[-0.4px] text-white">
        זמן המסך שלי השבוע
      </p>
      <div className="h-0 w-full outline outline-1 outline-[#586D66] -outline-offset-[0.5px]" aria-hidden />
      <div className="flex w-full items-center justify-between" dir="rtl">
        {SCREEN_DAY_LETTERS.map((letter, index) => (
          <div key={letter} className="flex h-[73px] flex-col items-center justify-center gap-2">
            <div className="flex size-[19px] items-center justify-center rounded-full bg-[#8C00FF]">
              <span className="font-simpler text-[12px] font-bold tracking-[-0.24px] text-white">
                {letter}
              </span>
            </div>
            <p className="text-center font-simpler text-[12px] font-bold leading-normal tracking-[-0.24px] text-white">
              {Math.round(minutesBySundayIndex[index] ?? 0)}
              <br />
              דק׳
            </p>
          </div>
        ))}
      </div>
      <div className="h-0 w-full outline outline-1 outline-[#586D66] -outline-offset-[0.5px]" aria-hidden />
      <div className="flex w-full flex-col gap-1.5" dir="rtl">
        <div className="flex w-full items-start justify-between font-simpler text-[14px] font-normal leading-[1.25] tracking-[-0.28px] text-[#00E7A2]">
          <p>נותרו לי</p>
          <p>מתוך דמי כיס</p>
        </div>
        <div className="relative h-[5px] w-full overflow-hidden rounded-full bg-[#2C4B51]">
          <div
            className="absolute inset-y-0 right-0 rounded-full bg-[#00FFB3]"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <div className="flex w-full items-start justify-between font-simpler text-[16px] font-bold leading-[1.28] tracking-[-0.32px] text-white">
          <p>₪{formatNumber(kept, 1)}</p>
          <p>₪{formatNumber(budget, 1)}</p>
        </div>
      </div>
    </section>
  );
}

type DashboardChildCompanionProps = {
  src: string;
};

export function DashboardChildCompanion({ src }: DashboardChildCompanionProps) {
  const { width, height, top, right, rotateDeg } = CHILD_DASHBOARD_LAYOUT.companion;

  return (
    <div
      className="pointer-events-none absolute z-[1]"
      style={{
        top,
        right,
        width,
        height,
        aspectRatio: '1 / 1',
        transform: `rotate(${rotateDeg}deg)`,
      }}
    >
      <Image
        src={src}
        alt=""
        width={Math.round(width)}
        height={Math.round(height)}
        className="h-full w-full object-contain"
        unoptimized
      />
    </div>
  );
}
