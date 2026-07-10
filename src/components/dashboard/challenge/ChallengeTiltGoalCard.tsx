'use client';

import { V03_CHALLENGE_GOAL_GLOW } from '@/constants/v03-challenge-goals-layout';

type ChallengeTiltGoalCardProps = {
  label: string;
  selected: boolean;
  rotateDeg: number;
  floatY: number;
  onSelect: () => void;
};

/** Floating tilt goal card — white border + turquoise ellipse when selected (onboarding castle style). */
export function ChallengeTiltGoalCard({
  label,
  selected,
  rotateDeg,
  floatY,
  onSelect,
}: ChallengeTiltGoalCardProps) {
  const glow = V03_CHALLENGE_GOAL_GLOW;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onSelect}
      className="relative w-full overflow-visible border border-white bg-white/5 px-3 py-2.5 text-center shadow-[0_5px_5px_rgba(0,0,0,0.25)] backdrop-blur-[11px] transition duration-200 hover:brightness-105"
      style={{
        borderRadius: 16,
        transform: `translateY(${floatY}px) rotate(${rotateDeg}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {selected ? (
        <div
          className="pointer-events-none absolute rounded-full"
          aria-hidden
          style={{
            width: glow.width,
            height: glow.height,
            left: '50%',
            bottom: glow.bottom,
            transform: 'translateX(-50%)',
            background: glow.color,
            filter: `blur(${glow.blur}px)`,
          }}
        />
      ) : null}

      <span className="relative z-[1] font-simpler text-[12px] font-bold leading-[14px] text-white">
        {label}
      </span>
    </button>
  );
}
