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
};

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
}: BudgetStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

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
        onClick={() => onChange(Math.min(max, value + step))}
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
        {formatNumber(value, 0)}
      </span>

      <CircleButton
        label="הפחתה"
        disabled={atMin}
        onClick={() => onChange(Math.max(min, value - step))}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </CircleButton>
    </div>
  );
}
