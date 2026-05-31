'use client';

const SIZE = 252;
const STROKE = 20.99;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

type ScreenTimeProgressRingProps = {
  percent: number;
};

/** Figma 252×252 gauge — turquoise ring tracks `percent`, frosted inner disc. */
export function ScreenTimeProgressRing({ percent }: ScreenTimeProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div
      className="relative h-[252px] w-[252px] shrink-0"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="מחשבים זמן מסך"
    >
      <svg
        className="pointer-events-none absolute -left-[6.3px] -top-[6.3px]"
        width={264.6}
        height={264.6}
        viewBox="0 0 264.6 264.6"
        aria-hidden
      >
        <circle
          cx={132.3}
          cy={132.3}
          r={R}
          fill="none"
          stroke="var(--v03-turquoise-300)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 132.3 132.3)"
        />
      </svg>

      <div
        className="absolute left-[11.03px] top-[11.03px] h-[229.95px] w-[229.95px] rounded-full bg-white/30 shadow-[inset_5.23px_5.23px_13.07px_rgba(39,11,83,0.2)] backdrop-blur-[13.07px]"
        aria-hidden
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-center text-white" dir="ltr">
          <span className="font-simpler text-[60px] font-bold leading-[65.95px]">
            {clamped}
          </span>
          <span className="font-simpler text-[30.11px] font-normal leading-[65.95px]">
            %
          </span>
        </p>
      </div>
    </div>
  );
}
