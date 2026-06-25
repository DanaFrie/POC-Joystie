import { GAME_WIN_SCORE } from '@/constants/game';
import type {
  GamePlayerRole,
  GamePaddlesState,
  GameRoomPhase,
  GameScoreState,
  GameWinner,
} from '@/types/game';

/** Ball diameter in normalized court coords (0–1). */
export const BALL_DIAMETER = 0.04;
export const BALL_RADIUS = BALL_DIAMETER / 2;

export const PARENT_PADDLE_Y = 0.92;
export const CHILD_PADDLE_Y = 0.08;

export const PHYSICS_DT = 0.03;
export const PHYSICS_SUBSTEPS = 4;

/** @deprecated use GAME_WIN_SCORE from @/constants/game */
export const WIN_SCORE = GAME_WIN_SCORE;

/** Paddle width in normalized court coords (0–1). */
export const DEFAULT_PADDLE_WIDTH = 0.28;

/** Ball speed when play begins (after child joins). */
export const BALL_START_VX = 0.1;
export const BALL_START_VY = 0.14;

const MIN_SPEED = 0.1;
const MAX_SPEED = 0.32;
const PADDLE_BOOST = 1.02;

const SUBSTEP_DT = PHYSICS_DT / PHYSICS_SUBSTEPS;

export type BallVector = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type PhysicsStepInput = {
  ball: BallVector;
  paddles: GamePaddlesState;
  score: GameScoreState;
  phase: GameRoomPhase;
  winner: GameWinner;
};

export type PhysicsStepResult = PhysicsStepInput & {
  scored: boolean;
  missed: boolean;
  missedBy: GamePlayerRole | null;
};

export function createStartBall(): BallVector {
  return { x: 0.5, y: 0.5, vx: BALL_START_VX, vy: BALL_START_VY };
}

/** Kick a stationary ball when play begins (e.g. join fn not yet deployed). */
export function ensureBallMoving(ball: BallVector): BallVector {
  if (Math.hypot(ball.vx, ball.vy) < 0.02) {
    return { ...ball, vx: BALL_START_VX, vy: BALL_START_VY };
  }
  return ball;
}

function clampBallX(x: number): number {
  const r = BALL_RADIUS;
  return Math.min(1 - r, Math.max(r, x));
}

/** Keep paddle center so the full paddle stays inside the court. */
export function clampPaddleCenterX(x: number, paddleWidth: number): number {
  const half = paddleWidth / 2;
  return Math.min(1 - half, Math.max(half, x));
}

export function clampBallCenter(x: number, y: number): { x: number; y: number } {
  return { x: clampBallX(x), y };
}

function normalizeSpeed(vx: number, vy: number): { vx: number; vy: number } {
  const speed = Math.hypot(vx, vy);
  if (speed < MIN_SPEED) {
    const angle = Math.atan2(vy || 1, vx || 0.3);
    return {
      vx: Math.cos(angle) * MIN_SPEED,
      vy: Math.sin(angle) * MIN_SPEED,
    };
  }
  if (speed > MAX_SPEED) {
    const scale = MAX_SPEED / speed;
    return { vx: vx * scale, vy: vy * scale };
  }
  return { vx, vy };
}

function overlapsPaddleX(x: number, paddleX: number, paddleHalf: number): boolean {
  return Math.abs(x - paddleX) <= paddleHalf + BALL_RADIUS * 0.2;
}

function reflectOffPaddle(
  x: number,
  vx: number,
  vy: number,
  paddleX: number,
  paddleHalf: number,
  paddleY: number
): { vx: number; vy: number; y: number } {
  const hitOffset = Math.max(-1, Math.min(1, (x - paddleX) / paddleHalf));
  const isBottomPaddle = paddleY > 0.5;
  let newVx = vx + hitOffset * 0.12;
  let newVy = isBottomPaddle
    ? -Math.abs(vy) * PADDLE_BOOST
    : Math.abs(vy) * PADDLE_BOOST;
  const normalized = normalizeSpeed(newVx, newVy);
  const y = isBottomPaddle
    ? paddleY - BALL_RADIUS
    : paddleY + BALL_RADIUS;
  return { ...normalized, y };
}

function bounceHorizontal(x: number, vx: number): { x: number; vx: number } {
  const r = BALL_RADIUS;
  if (x <= r) return { x: r, vx: Math.abs(vx) };
  if (x >= 1 - r) return { x: 1 - r, vx: -Math.abs(vx) };
  return { x, vx };
}

type SubstepResult = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scored: boolean;
  missed: boolean;
  missedBy: GamePlayerRole | null;
  phase: GameRoomPhase;
  winner: GameWinner;
  score: GameScoreState;
};

function tryPaddleBounce(
  prevY: number,
  x: number,
  y: number,
  vx: number,
  vy: number,
  paddleX: number,
  paddleHalf: number,
  paddleY: number
): { hit: boolean; x: number; y: number; vx: number; vy: number } {
  const r = BALL_RADIUS;
  const isBottomPaddle = paddleY > 0.5;

  if (isBottomPaddle) {
    if (vy <= 0) return { hit: false, x, y, vx, vy };
    const crossed = prevY + r < paddleY && y + r >= paddleY;
    if (!crossed || !overlapsPaddleX(x, paddleX, paddleHalf)) {
      return { hit: false, x, y, vx, vy };
    }
    const reflected = reflectOffPaddle(x, vx, vy, paddleX, paddleHalf, paddleY);
    return {
      hit: true,
      x,
      y: reflected.y,
      vx: reflected.vx,
      vy: reflected.vy,
    };
  }

  if (vy >= 0) return { hit: false, x, y, vx, vy };
  const crossed = prevY - r > paddleY && y - r <= paddleY;
  if (!crossed || !overlapsPaddleX(x, paddleX, paddleHalf)) {
    return { hit: false, x, y, vx, vy };
  }
  const reflected = reflectOffPaddle(x, vx, vy, paddleX, paddleHalf, paddleY);
  return {
    hit: true,
    x,
    y: reflected.y,
    vx: reflected.vx,
    vy: reflected.vy,
  };
}

function detectPaddleMiss(
  prevY: number,
  x: number,
  y: number,
  vy: number,
  paddleX: number,
  paddleHalf: number,
  paddleY: number,
  defender: GamePlayerRole,
  hadHit: boolean
): GamePlayerRole | null {
  if (hadHit) return null;
  const r = BALL_RADIUS;
  const isBottomPaddle = paddleY > 0.5;

  if (isBottomPaddle) {
    if (vy <= 0) return null;
    const crossedLine = prevY + r <= paddleY && y + r > paddleY;
    const tunneledPast = prevY + r < paddleY && y - r > paddleY;
    if ((crossedLine || tunneledPast) && !overlapsPaddleX(x, paddleX, paddleHalf)) {
      return defender;
    }
    if (y + r >= 1 - 0.002) return defender;
    return null;
  }

  if (vy >= 0) return null;
  const crossedLine = prevY - r >= paddleY && y - r < paddleY;
  const tunneledPast = prevY - r > paddleY && y + r < paddleY;
  if ((crossedLine || tunneledPast) && !overlapsPaddleX(x, paddleX, paddleHalf)) {
    return defender;
  }
  if (y - r <= 0.002) return defender;
  return null;
}

function physicsSubstep(
  ball: BallVector,
  paddles: GamePaddlesState,
  score: GameScoreState,
  phase: GameRoomPhase,
  winner: GameWinner
): SubstepResult {
  let { x, y, vx, vy } = ball;
  const prevY = y;
  let scored = false;
  let missed = false;
  let missedBy: GamePlayerRole | null = null;
  const paddleHalf = paddles.width / 2;

  x += vx * SUBSTEP_DT;
  y += vy * SUBSTEP_DT;

  const wallX = bounceHorizontal(x, vx);
  x = wallX.x;
  vx = wallX.vx;

  let parentHit = false;
  let childHit = false;

  const parentBounce = tryPaddleBounce(
    prevY,
    x,
    y,
    vx,
    vy,
    paddles.parentX,
    paddleHalf,
    PARENT_PADDLE_Y
  );

  if (parentBounce.hit) {
    parentHit = true;
    x = parentBounce.x;
    y = parentBounce.y;
    vx = parentBounce.vx;
    vy = parentBounce.vy;
    score = { shared: score.shared + 1 };
    scored = true;
    if (score.shared >= WIN_SCORE) {
      winner = 'shared';
      phase = 'finished';
    }
  } else {
    const childBounce = tryPaddleBounce(
      prevY,
      x,
      y,
      vx,
      vy,
      paddles.childX,
      paddleHalf,
      CHILD_PADDLE_Y
    );
    if (childBounce.hit) {
      childHit = true;
      x = childBounce.x;
      y = childBounce.y;
      vx = childBounce.vx;
      vy = childBounce.vy;
      score = { shared: score.shared + 1 };
      scored = true;
      if (score.shared >= WIN_SCORE) {
        winner = 'shared';
        phase = 'finished';
      }
    }
  }

  if (!scored && phase === 'playing') {
    const parentMiss = detectPaddleMiss(
      prevY,
      x,
      y,
      vy,
      paddles.parentX,
      paddleHalf,
      PARENT_PADDLE_Y,
      'parent',
      parentHit
    );
    if (parentMiss) {
      missed = true;
      missedBy = parentMiss;
      phase = 'finished';
      winner = null;
      y = Math.min(1 - BALL_RADIUS * 0.5, y);
      vx = 0;
      vy = 0;
    } else {
      const childMiss = detectPaddleMiss(
        prevY,
        x,
        y,
        vy,
        paddles.childX,
        paddleHalf,
        CHILD_PADDLE_Y,
        'child',
        childHit
      );
      if (childMiss) {
        missed = true;
        missedBy = childMiss;
        phase = 'finished';
        winner = null;
        y = Math.max(BALL_RADIUS * 0.5, y);
        vx = 0;
        vy = 0;
      }
    }
  }

  x = clampBallX(x);

  return {
    x,
    y,
    vx,
    vy,
    scored,
    missed,
    missedBy,
    phase,
    winner,
    score,
  };
}

/**
 * Shared court — side walls bounce; top/bottom only via paddles.
 * Miss past a paddle → game over.
 */
export function stepBallPhysics(input: PhysicsStepInput): PhysicsStepResult {
  let ball = ensureBallMoving(input.ball);
  let score = { ...input.score };
  let phase = input.phase;
  let winner = input.winner;
  let scored = false;
  let missed = false;
  let missedBy: GamePlayerRole | null = null;

  for (let i = 0; i < PHYSICS_SUBSTEPS; i++) {
    if (phase !== 'playing') break;

    const step = physicsSubstep(ball, input.paddles, score, phase, winner);
    ball = { x: step.x, y: step.y, vx: step.vx, vy: step.vy };
    score = step.score;
    phase = step.phase;
    winner = step.winner;
    if (step.scored) scored = true;
    if (step.missed) {
      missed = true;
      missedBy = step.missedBy;
      break;
    }
  }

  return {
    ball,
    paddles: input.paddles,
    score,
    phase,
    winner,
    scored,
    missed,
    missedBy,
  };
}

/** Only the parent runs physics so both screens stay in sync. */
export function isPhysicsAuthority(role: GamePlayerRole): boolean {
  return role === 'parent';
}
