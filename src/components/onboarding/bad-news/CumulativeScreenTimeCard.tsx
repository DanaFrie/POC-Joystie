'use client';

import type { ChildCumulativeProjection } from '@/lib/onboarding/cumulativeScreenTime';

type CumulativeScreenTimeCardProps = {
  child: ChildCumulativeProjection;
  className?: string;
};

const DURATION_STYLE = {
  color: '#292929',
  textAlign: 'center' as const,
  fontSize: 24,
  fontStyle: 'normal' as const,
  fontWeight: 800,
  lineHeight: '110%',
  letterSpacing: '-0.72px',
};

/** Figma Special Card — always show cumulative duration for given screen time. */
export function CumulativeScreenTimeCard({
  child,
  className = '',
}: CumulativeScreenTimeCardProps) {
  return (
    <article
      className={`relative flex w-full flex-col items-center justify-center gap-[15px] overflow-visible rounded-[24px] border border-solid border-[#efefef] bg-[linear-gradient(227deg,#fff_0%,#f7f7f7_100%)] p-[18px] ${className}`}
    >
      <p className="w-full text-center font-simpler text-[20px] font-normal leading-[1.2] tracking-[-0.4px] text-v03-text-on-light">
        <span>זמן המסך המצטבר של </span>
        <span className="font-bold">{child.name}</span>
        <span> יהיה:</span>
      </p>
      <div className="inline-flex items-center justify-center overflow-hidden rounded-[5px] bg-[#ececec] px-[5px] py-[3px]">
        <p className="font-simpler" style={DURATION_STYLE}>
          {child.durationLabel}
        </p>
      </div>
    </article>
  );
}
