'use client';

import type { ChildCumulativeProjection } from '@/lib/onboarding/cumulativeScreenTime';
import { isLowCumulativeScreenTime } from '@/lib/onboarding/cumulativeScreenTime';

type CumulativeScreenTimeCardProps = {
  child: ChildCumulativeProjection;
  className?: string;
  /** Show side chevrons when more than one child. */
  showNav?: boolean;
  canPrev?: boolean;
  canNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
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

/** Figma 6×12 chevron outline inside 24×24 hit area. */
function CardChevron({
  direction,
  muted,
}: {
  direction: 'prev' | 'next';
  muted?: boolean;
}) {
  // Visual: prev = point right (RTL back), next = point left (RTL forward).
  const pointsRight = direction === 'prev';
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d={pointsRight ? 'M9 6L15 12L9 18' : 'M15 6L9 12L15 18'}
        stroke={muted ? 'rgba(9, 33, 37, 0.20)' : '#092125'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma Special Card — duration badge, or low-time encouraging copy. */
export function CumulativeScreenTimeCard({
  child,
  className = '',
  showNav = false,
  canPrev = false,
  canNext = false,
  onPrev,
  onNext,
}: CumulativeScreenTimeCardProps) {
  const lowTime = isLowCumulativeScreenTime(child.hoursPerDay);
  const spendVerb = child.gender === 'girl' ? 'תבלה' : 'יבלה';
  const allowClause =
    child.gender === 'girl'
      ? 'שיאפשר לה להתפתח ולרכוש מיומנויות'
      : 'שיאפשר לו להתפתח ולרכוש מיומנויות';

  return (
    <article
      className={`relative flex w-full flex-col items-center justify-center gap-[15px] overflow-visible rounded-[24px] border border-solid border-[#efefef] bg-[linear-gradient(227deg,#fff_0%,#f7f7f7_100%)] p-[18px] ${className}`}
    >
      {showNav ? (
        <>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            aria-label="הילד הבא"
            className="absolute left-[6px] top-[42px] z-10 inline-flex size-6 items-center justify-center disabled:pointer-events-none"
          >
            <CardChevron direction="next" muted={!canNext} />
          </button>
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            aria-label="הילד הקודם"
            className="absolute right-[6px] top-[42px] z-10 inline-flex size-6 items-center justify-center disabled:pointer-events-none"
          >
            <CardChevron direction="prev" muted={!canPrev} />
          </button>
        </>
      ) : null}

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
