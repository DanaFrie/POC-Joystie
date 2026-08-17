'use client';

import type { ChildCumulativeProjection } from '@/lib/onboarding/cumulativeScreenTime';
import { isLowCumulativeScreenTime } from '@/lib/onboarding/cumulativeScreenTime';

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

/** Figma Special Card — duration badge, or low-time encouraging copy. */
export function CumulativeScreenTimeCard({
  child,
  className = '',
}: CumulativeScreenTimeCardProps) {
  const lowTime = isLowCumulativeScreenTime(child.hoursPerDay);
  const spendVerb = child.gender === 'girl' ? 'תבלה' : 'יבלה';
  const allowClause =
    child.gender === 'girl'
      ? 'שתאפשר לה להתפתח ולרכוש מיומנויות'
      : 'שיאפשר לו להתפתח ולרכוש מיומנויות';

  return (
    <article
      className={`flex w-full flex-col items-center justify-center gap-[15px] overflow-hidden rounded-[24px] border border-solid border-[#efefef] bg-[linear-gradient(233deg,#fff_2.39%,#f7f7f7_96.48%)] p-[18px] ${className}`}
    >
      {lowTime ? (
        <p className="w-full font-simpler" style={DURATION_STYLE}>
          <span>{child.name}</span>
          {` ${spendVerb} במסך זמן סביר, ${allowClause}`}
        </p>
      ) : (
        <>
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
        </>
      )}
    </article>
  );
}
