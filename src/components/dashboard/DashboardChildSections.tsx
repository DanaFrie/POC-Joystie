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
};

/** Figma 13652:17670 — conversion time → money bar */
export function DashboardConversionBar({
  savedMinutes,
  balance,
  moneyLabel,
}: DashboardConversionBarProps) {
  const moneyText = moneyLabel ?? `המרה ל-${formatNumber(balance, 0)} ₪`;
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
        className="absolute left-1/2 top-1/2 w-[136px] -translate-x-[calc(50%+29px)] -translate-y-1/2 text-center font-simpler tracking-[-0.21px]"
        dir="rtl"
        style={{
          color: 'rgba(255, 255, 255, 0.40)',
          fontSize: 14,
          fontWeight: 700,
          lineHeight: '14px',
        }}
      >
        {moneyText}
      </p>

      {/* Minutes toggle — inset from right */}
      <div
        className="absolute right-[6px] top-[6px] z-[1] flex h-[44px] w-[108px] items-center justify-center px-2"
        style={{
          borderRadius: 300,
          background: 'rgba(18, 57, 54, 0.50)',
          boxShadow: 'inset 0 0 0 1px rgba(0, 231, 162, 0.28)',
        }}
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
              color: 'rgba(197, 237, 225, 0.40)',
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '14px',
            }}
          >
            {`${Math.round(savedMinutes)} דק׳`}
          </span>
          <Image
            src={CHILD_DASHBOARD_ASSETS.conversionClock}
            alt=""
            width={18}
            height={18}
            className="size-[18px] shrink-0"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}

type DashboardChildStartCtaProps = {
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
};

export function DashboardChildStartCta({
  onClick,
  label = 'הגדרת הדיל הראשון בארנק שלי',
  disabled = false,
}: DashboardChildStartCtaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-[55px] w-full items-center justify-center rounded-[22px] bg-[#00FFB3] px-[15px] py-2 text-center font-simpler text-[18px] font-bold leading-[21.6px] text-[#092125] shadow-[2px_2px_20px_rgba(109,109,109,0.15)] ${
        disabled ? 'cursor-not-allowed opacity-45' : ''
      }`}
    >
      {label}
    </button>
  );
}

type DashboardChildGreetingProps = {
  childName: string;
  /** Hide the pre-deal wallet teaser once the child confirmed the deal. */
  showWalletTeaser?: boolean;
};

export function DashboardChildGreeting({
  childName,
  showWalletTeaser = true,
}: DashboardChildGreetingProps) {
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
