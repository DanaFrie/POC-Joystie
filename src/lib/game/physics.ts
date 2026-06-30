import { GAME_WIN_SCORE } from '@/constants/game';
import {
  PHYSICS_BALL_RADIUS_X,
  PHYSICS_BALL_RADIUS_Y,
  PHYSICS_CHILD_PADDLE_SURFACE_Y,
  PHYSICS_PARENT_PADDLE_SURFACE_Y,
  PHYSICS_PADDLE_HEIGHT_NORM,
} from '@/lib/game/ballGameCourt';
import { velocityToward, ballTowardFromVy } from '@/lib/game/ballDirection';
import type {
  GamePlayerRole,
  GamePaddlesState,
  GameRoomPhase,
  GameScoreState,
  GameWinner,
} from '@/types/game';

/** Ball radius in normalized court coords — matches 44px rendered ball. */
export const BALL_RADIUS_X = PHYSICS_BALL_RADIUS_X;
export const BALL_RADIUS_Y = PHYSICS_BALL_RADIUS_Y;
/** @deprecated use BALL_RADIUS_X / BALL_RADIUS_Y */
export const BALL_RADIUS = BALL_RADIUS_Y;
export const BALL_DIAMETER = BALL_RADIUS_Y * 2;

/** Paddle collision surfaces — aligned to Figma paddle edges on play lane. */
export const PARENT_PADDLE_Y = PHYSICS_PARENT_PADDLE_SURFACE_Y;
export const CHILD_PADDLE_Y = PHYSICS_CHILD_PADDLE_SURFACE_Y;

/** Paddle width in normalized court coords (0–1) — Figma 92px on 327px lane. */
export const DEFAULT_PADDLE_WIDTH = 92 / 327;

export const PHYSICS_DT = 0.03;
export const PHYSICS_SUBSTEPS = 4;

/** @deprecated use GAME_WIN_SCORE from @/constants/game */
export const WIN_SCORE = GAME_WIN_SCORE;

const MIN_SPEED = 0.1794;
const MAX_SPEED = 0.5;
const PADDLE_BOOST = 1.04;
const PADDLE_ANGLE_GAIN = 0.28;
const PADDLE_ANGLE_JITTER = 0.06;

const SUBSTEP_DT = PHYSICS_DT / PHYSICS_SUBSTEPS;

export type BallVector = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  toward?: GamePlayerRole;
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

/** Serve from center toward the child paddle (shared y → 0). */
export function createStartBall(): BallVector {
  const { vx, vy } = velocityToward('child');
  return { x: 0.5, y: 0.5, vx, vy, toward: 'child' };
}

/** Kick a stationary ball — preserve intended receiver. */
export function ensureBallMoving(ball: BallVector): BallVector {
  if (Math.hypot(ball.vx, ball.vy) < 0.02) {
    const toward = ball.toward ?? ballTowardFromVy(ball.vy);
    const { vx, vy } = velocityToward(toward);
    return { ...ball, vx, vy, toward };
  }
  return { ...ball, toward: ball.toward ?? ballTowardFromVy(ball.vy) };
}

function clampBallX(x: number): number {
  return Math.min(1 - BALL_RADIUS_X, Math.max(BALL_RADIUS_X, x));
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
  if (speed < 1e-9) {
    return velocityToward('child');
  }
  if (speed < MIN_SPEED) {
    const scale = MIN_SPEED / speed;
    return { vx: vx * scale, vy: vy * scale };
  }
  if (speed > MAX_SPEED) {
    const scale = MAX_SPEED / speed;
    return { vx: vx * scale, vy: vy * scale };
  }
  return { vx, vy };
}

const PADDLE_HIT_EPS = 0.004;

function overlapsPaddleX(
  x: number,
  paddleX: number,
  paddleHalf: number
): boolean {
  return Math.abs(x - paddleX) <= paddleHalf + BALL_RADIUS_X * 1.05;
}

function ballOverlapsPaddle(
  x: number,
  y: number,
  paddleX: number,
  paddleHalf: number,
  paddleY: number,
  isBottomPaddle: boolean
): boolean {
  if (!overlapsPaddleX(x, paddleX, paddleHalf)) return false;
  if (isBottomPaddle) {
    return (
      y + BALL_RADIUS_Y >= paddleY - PADDLE_HIT_EPS &&
      y - BALL_RADIUS_Y <= paddleY + PHYSICS_PADDLE_HEIGHT_NORM + PADDLE_HIT_EPS
    );
  }
  return (
    y - BALL_RADIUS_Y <= paddleY + PADDLE_HIT_EPS &&
    y + BALL_RADIUS_Y >= paddleY - PHYSICS_PADDLE_HEIGHT_NORM - PADDLE_HIT_EPS
  );
}

function reflectOffPaddle(
  x: number,
  vx: number,
  vy: number,
  paddleX: number,
  paddleHalf: number,
  defender: GamePlayerRole,
  paddleY: number
): { vx: number; vy: number; y: number; toward: GamePlayerRole } {
  const hitOffset = Math.max(-1, Math.min(1, (x - paddleX) / paddleHalf));
  const nextToward: GamePlayerRole = defender === 'parent' ? 'child' : 'parent';
  const speed = Math.max(MIN_SPEED, Math.hypot(vx, vy) * PADDLE_BOOST);
  const angleKick =
    hitOffset * PADDLE_ANGLE_GAIN +
    (Math.random() - 0.5) * PADDLE_ANGLE_JITTER;
  const angledVx = vx + angleKick;
  const towardVel = velocityToward(nextToward, speed, angledVx);
  const normalized = normalizeSpeed(towardVel.vx, towardVel.vy);
  const isBottomPaddle = paddleY > 0.5;
  const y = isBottomPaddle
    ? paddleY - BALL_RADIUS_Y
    : paddleY + BALL_RADIUS_Y;
  return { ...normalized, y, toward: nextToward };
}

function bounceHorizontal(x: number, vx: number): { x: number; vx: number } {
  if (x <= BALL_RADIUS_X) return { x: BALL_RADIUS_X, vx: Math.abs(vx) };
  if (x >= 1 - BALL_RADIUS_X) return { x: 1 - BALL_RADIUS_X, vx: -Math.abs(vx) };
  return { x, vx };
}

type SubstepResult = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  toward?: GamePlayerRole;
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
  paddleY: number,
  defender: GamePlayerRole
): { hit: boolean; x: number; y: number; vx: number; vy: number; toward?: GamePlayerRole } {
  const isBottomPaddle = paddleY > 0.5;

  if (isBottomPaddle) {
    if (vy <= 0) {
      return { hit: false, x, y, vx, vy };
    }
    const crossed =
      prevY + BALL_RADIUS_Y <= paddleY + PADDLE_HIT_EPS &&
      y + BALL_RADIUS_Y >= paddleY - PADDLE_HIT_EPS;
    if (!crossed || !overlapsPaddleX(x, paddleX, paddleHalf)) {
      return { hit: false, x, y, vx, vy };
    }
    const reflected = reflectOffPaddle(
      x,
      vx,
      vy,
      paddleX,
      paddleHalf,
      defender,
      paddleY
    );
    return {
      hit: true,
      x,
      y: reflected.y,
      vx: reflected.vx,
      vy: reflected.vy,
      toward: reflected.toward,
    };
  }

  if (vy >= 0) {
    return { hit: false, x, y, vx, vy };
  }
  const crossed =
    prevY - BALL_RADIUS_Y >= paddleY - PADDLE_HIT_EPS &&
    y - BALL_RADIUS_Y <= paddleY + PADDLE_HIT_EPS;
  if (!crossed || !overlapsPaddleX(x, paddleX, paddleHalf)) {
    return { hit: false, x, y, vx, vy };
  }
  const reflected = reflectOffPaddle(
    x,
    vx,
    vy,
    paddleX,
    paddleHalf,
    defender,
    paddleY
  );
  return {
    hit: true,
    x,
    y: reflected.y,
    vx: reflected.vx,
    vy: reflected.vy,
    toward: reflected.toward,
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
  const isBottomPaddle = paddleY > 0.5;

  if (ballOverlapsPaddle(x, y, paddleX, paddleHalf, paddleY, isBottomPaddle)) {
    return null;
  }

  if (isBottomPaddle) {
    if (vy <= 0) return null;
    const crossedLine =
      prevY + BALL_RADIUS_Y <= paddleY + PADDLE_HIT_EPS &&
      y + BALL_RADIUS_Y > paddleY + PADDLE_HIT_EPS;
    const tunneledPast =
      prevY + BALL_RADIUS_Y < paddleY && y - BALL_RADIUS_Y > paddleY;
    if ((crossedLine || tunneledPast) && !overlapsPaddleX(x, paddleX, paddleHalf)) {
      return defender;
    }
    if (y + BALL_RADIUS_Y >= 1 - PADDLE_HIT_EPS && !overlapsPaddleX(x, paddleX, paddleHalf)) {
      return defender;
    }
    return null;
  }

  if (vy >= 0) return null;
  const crossedLine =
    prevY - BALL_RADIUS_Y >= paddleY - PADDLE_HIT_EPS &&
    y - BALL_RADIUS_Y < paddleY - PADDLE_HIT_EPS;
  const tunneledPast =
    prevY - BALL_RADIUS_Y > paddleY && y + BALL_RADIUS_Y < paddleY;
  if ((crossedLine || tunneledPast) && !overlapsPaddleX(x, paddleX, paddleHalf)) {
    return defender;
  }
  if (y - BALL_RADIUS_Y <= PADDLE_HIT_EPS && !overlapsPaddleX(x, paddleX, paddleHalf)) {
    return defender;
  }
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
  let toward = ball.toward ?? ballTowardFromVy(vy);
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
    PARENT_PADDLE_Y,
    'parent'
  );

  if (parentBounce.hit) {
    parentHit = true;
    x = parentBounce.x;
    y = parentBounce.y;
    vx = parentBounce.vx;
    vy = parentBounce.vy;
    toward = parentBounce.toward ?? toward;
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
      CHILD_PADDLE_Y,
      'child'
    );
    if (childBounce.hit) {
      childHit = true;
      x = childBounce.x;
      y = childBounce.y;
      vx = childBounce.vx;
      vy = childBounce.vy;
      toward = childBounce.toward ?? toward;
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
      y = Math.min(1 - BALL_RADIUS_Y * 0.5, y);
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
        y = Math.max(BALL_RADIUS_Y * 0.5, y);
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
    toward,
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
    ball = {
      x: step.x,
      y: step.y,
      vx: step.vx,
      vy: step.vy,
      toward: step.toward ?? ball.toward,
    };
    score = step.score;
    phase = step.phase;
    winner = step.winner;
    if (step.scored) {
      scored = true;
      break;
    }
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
