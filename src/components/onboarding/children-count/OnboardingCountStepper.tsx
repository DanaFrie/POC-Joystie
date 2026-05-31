'use client';

import type { ReactNode } from 'react';

type OnboardingCountStepperProps = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

function StepperCircleButton({
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

/**
 * Figma order: + (left) · count · − (right).
 * `dir="ltr"` required — parent is RTL; flex mirrors DOM order without it.
 */
export function OnboardingCountStepper({
  value,
  min,
  max,
  onChange,
}: OnboardingCountStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div
      dir="ltr"
      className="inline-flex flex-row items-center justify-center gap-[26px]"
      role="group"
      aria-label="מספר ילדים"
    >
      <StepperCircleButton
        label="הוספה"
        disabled={atMax}
        onClick={() => onChange(value + 1)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 5v14M5 12h14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </StepperCircleButton>

      <span
        className="min-w-[1ch] text-center font-simpler text-[40px] font-black leading-[44px] text-white"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>

      <StepperCircleButton
        label="הפחתה"
        disabled={atMin}
        onClick={() => onChange(value - 1)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12h14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </StepperCircleButton>
    </div>
  );
}
