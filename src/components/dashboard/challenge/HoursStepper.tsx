'use client';

type HoursStepperProps = {
  valueHours: number;
  min?: number;
  max?: number;
  stepHours?: number;
  onChange: (hours: number) => void;
};

/** +/− for total challenge hours (default 0.5h steps). */
export function HoursStepper({
  valueHours,
  min = 0,
  max = 48,
  stepHours = 0.5,
  onChange,
}: HoursStepperProps) {
  const atMin = valueHours <= min;
  const atMax = valueHours >= max;
  const label =
    Number.isInteger(valueHours) || valueHours % 1 === 0
      ? String(valueHours)
      : valueHours.toFixed(1).replace(/\.0$/, '');

  return (
    <div
      dir="ltr"
      className="inline-flex flex-row items-center justify-center gap-[20px]"
      role="group"
      aria-label="שעות מסך"
    >
      <button
        type="button"
        aria-label="הוספה"
        disabled={atMax}
        onClick={() => onChange(Math.min(max, Math.round((valueHours + stepHours) * 10) / 10))}
        className={`flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10 outline outline-1 outline-[#EFEFEF] outline-offset-[-1px] ${
          atMax ? 'opacity-50' : ''
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <span
        className="min-w-[4ch] text-center font-simpler text-[40px] font-black leading-[44px] text-white"
        aria-live="polite"
      >
        {label}
      </span>

      <button
        type="button"
        aria-label="הפחתה"
        disabled={atMin}
        onClick={() => onChange(Math.max(min, Math.round((valueHours - stepHours) * 10) / 10))}
        className={`flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10 outline outline-1 outline-[#EFEFEF] outline-offset-[-1px] ${
          atMin ? 'opacity-50' : ''
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
