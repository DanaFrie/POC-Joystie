'use client';

import { GAME_WIN_SCORE } from '@/constants/game';
import {
  BALL_GAME_SCORE_RING_ARC_CIRCUMFERENCE,
  BALL_GAME_SCORE_RING_ARC_RADIUS,
  BALL_GAME_SCORE_RING_DISC,
  BALL_GAME_SCORE_RING_DISC_OFFSET,
  BALL_GAME_SCORE_RING_OUTER_SIZE,
  BALL_GAME_SCORE_RING_PROGRESS,
  BALL_GAME_SCORE_RING_TEXT,
} from '@/constants/ball-game-score-ring-layout';

const OUTER = BALL_GAME_SCORE_RING_OUTER_SIZE;
const OUTER_CENTER = OUTER / 2;
const DISC = BALL_GAME_SCORE_RING_DISC.size;

type BallGameScoreRingProps = {
  score: number;
  className?: string;
  /** Scaled outer diameter — defaults to Figma @ 375. */
  sizePx?: number;
};

/** Figma 13656:7722 / Frame 1430108694 — charcoal disc, muted score, emerald arc. */
export function BallGameScoreRing({
  score,
  className = '',
  sizePx = OUTER,
}: BallGameScoreRingProps) {
  const clamped = Math.min(GAME_WIN_SCORE, Math.max(0, score));
  const progress = clamped / GAME_WIN_SCORE;
  const offset = BALL_GAME_SCORE_RING_ARC_CIRCUMFERENCE * (1 - progress);
  const scale = sizePx / OUTER;
  const discOffset = BALL_GAME_SCORE_RING_DISC_OFFSET * scale;
  const discSize = DISC * scale;
  const scoreFontSize = DISC * BALL_GAME_SCORE_RING_TEXT.scoreFontRatio * scale;
  const labelFontSize = DISC * BALL_GAME_SCORE_RING_TEXT.labelFontRatio * scale;
  const labelGap = DISC * BALL_GAME_SCORE_RING_TEXT.labelGapRatio * scale;

  return (
    <div
      className={`pointer-events-none relative font-simpler ${className}`}
      style={{ width: sizePx, height: sizePx }}
      aria-live="polite"
      aria-label={`${clamped} מתוך ${GAME_WIN_SCORE} נקודות`}
    >
      <div
        className="absolute rounded-full"
        style={{
          left: discOffset,
          top: discOffset,
          width: discSize,
          height: discSize,
          background: BALL_GAME_SCORE_RING_DISC.fill,
        }}
        aria-hidden
      />

      {progress > 0 ? (
        <svg
          className="pointer-events-none absolute inset-0"
          width={sizePx}
          height={sizePx}
          viewBox={`0 0 ${OUTER} ${OUTER}`}
          aria-hidden
        >
          <circle
            cx={OUTER_CENTER}
            cy={OUTER_CENTER}
            r={BALL_GAME_SCORE_RING_ARC_RADIUS}
            fill="none"
            stroke={BALL_GAME_SCORE_RING_PROGRESS.color}
            strokeWidth={BALL_GAME_SCORE_RING_PROGRESS.stroke}
            strokeLinecap="round"
            strokeDasharray={BALL_GAME_SCORE_RING_ARC_CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${OUTER_CENTER} ${OUTER_CENTER})`}
          />
        </svg>
      ) : null}

      <div
        className="absolute z-[1] flex flex-col items-center justify-center text-center"
        style={{
          left: discOffset,
          top: discOffset,
          width: discSize,
          height: discSize,
          color: BALL_GAME_SCORE_RING_DISC.textColor,
        }}
      >
        <span className="font-black leading-none" style={{ fontSize: scoreFontSize }}>
          {clamped}
        </span>
        <span
          className="font-bold leading-none"
          style={{ fontSize: labelFontSize, marginTop: labelGap }}
        >
          {`מתוך ${GAME_WIN_SCORE}`}
        </span>
      </div>
    </div>
  );
}
