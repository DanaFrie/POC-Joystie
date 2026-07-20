'use client';

import type { ReactNode } from 'react';
import {
  ONBOARDING_CHILD_AGE_MAX,
  ONBOARDING_CHILD_AGE_MIN,
} from '@/lib/onboarding/childrenDetails';

type ChildAgeStepperProps = {
  value: number;
  onChange: (age: number) => void;
};

function MiniStepButton({
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
      className={`flex h-7 w-7 items-center justify-center rounded-full bg-white/5 p-2 outline outline-[0.75px] outline-offset-[-0.75px] transition ${
        disabled
          ? 'outline-v03-green-400 opacity-50'
          : 'outline-v03-green-100'
      }`}
    >
      {children}
    </button>
  );
}

/** Compact age stepper — 6–14; LTR + left / − right. */
export function ChildAgeStepper({ value, onChange }: ChildAgeStepperProps) {
  const atMin = value <= ONBOARDING_CHILD_AGE_MIN;
  const atMax = value >= ONBOARDING_CHILD_AGE_MAX;

  return (
    <div
      dir="ltr"
      className="inline-flex flex-row items-center justify-center gap-4 rounded-[68px] bg-white/5 p-1.5 outline outline-1 outline-white/25 outline-offset-[-1px]"
      role="group"
      aria-label="גיל"
    >
      <MiniStepButton
        label="הוספת גיל"
        disabled={atMax}
        onClick={() => onChange(value + 1)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M6 2v8M2 6h8"
            stroke="currentColor"
            className="text-v03-green-100"
            strokeWidth="1.08"
            strokeLinecap="round"
          />
        </svg>
      </MiniStepButton>

      <span className="min-w-[1ch] text-center font-simpler text-[20px] font-bold leading-none text-white">
        {value}
      </span>

      <MiniStepButton
        label="הפחתת גיל"
        disabled={atMin}
        onClick={() => onChange(value - 1)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2 6h8"
            stroke="currentColor"
            className={atMin ? 'text-v03-green-400' : 'text-v03-green-100'}
            strokeWidth="1.08"
            strokeLinecap="round"
          />
        </svg>
      </MiniStepButton>
    </div>
  );
}
