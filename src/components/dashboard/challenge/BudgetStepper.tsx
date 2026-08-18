'use client';

import type { ReactNode } from 'react';
import { formatNumber } from '@/utils/formatting';

type BudgetStepperProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Prefix shown before the value (default ₪). */
  prefix?: string;
  /** Decimal places for display and step rounding (default 0). */
  decimals?: number;
};

function roundToStep(value: number, step: number, decimals: number): number {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  const stepped = Math.round(rounded / step) * step;
  return Math.round(stepped * factor) / factor;
}

function CircleButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10 px-[15px] py-[14px] outline outline-1 outline-[#EFEFEF] outline-offset-[-1px] transition ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      {children}
    </button>
  );
}

/** + / − stepper with custom step size (e.g. ₪10 budget jumps). */
export function BudgetStepper({
  value,
  min,
  max,
  step,
  onChange,
  prefix = '₪',
  decimals = 0,
}: BudgetStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  const bump = (delta: number) => {
    onChange(roundToStep(Math.min(max, Math.max(min, value + delta)), step, decimals));
  };

  return (
    <div
      dir="ltr"
      className="inline-flex flex-row items-center justify-center gap-[20px]"
      role="group"
      aria-label="תקציב"
    >
      <CircleButton
        label="הוספה"
        disabled={atMax}
        onClick={() => bump(step)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 5v14M5 12h14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </CircleButton>

      <span
        className="min-w-[4ch] text-center font-simpler text-[40px] font-black leading-[44px] text-white"
        aria-live="polite"
        aria-atomic="true"
      >
        {prefix}
        {formatNumber(value, decimals)}
      </span>

      <CircleButton
        label="הפחתה"
        disabled={atMin}
        onClick={() => bump(-step)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </CircleButton>
    </div>
  );
}
