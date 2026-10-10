import { GAME_WIN_SCORE } from '@/constants/game';
import {
  PHYSICS_BALL_RADIUS_X,
  PHYSICS_BALL_RADIUS_Y,
  PHYSICS_CHILD_PADDLE_SURFACE_Y,
  PHYSICS_PARENT_PADDLE_SURFACE_Y,
  PHYSICS_PADDLE_HEIGHT_NORM,
} from '@/lib/game/ballGameCourt';
import { BALL_START_VY, velocityToward, ballTowardFromVy } from '@/lib/game/ballDirection';
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

export const PHYSICS_DT = 0.05;
/** Extra substeps so a fast serve does not tunnel through paddles. */
export const PHYSICS_SUBSTEPS = 8;

/** @deprecated use GAME_WIN_SCORE from @/constants/game */
export const WIN_SCORE = GAME_WIN_SCORE;

const MIN_SPEED = 0.21528;
/**
 * Headroom above serve so paddle hits can keep adding speed
 * instead of clamping on the first bounce.
 */
const MAX_SPEED = 16;
/**
 * Each successful return is this much faster than the previous one.
 * Speed is constant for the whole flight between hits.
 */
/** Each return is 5% faster than the last. */
export const PADDLE_SPEED_BOOST = 1.05;
/**
 * 0 sends the ball straight back. 1 is a modest sideways kick.
 * The live game uses 1.45 — wider serve and wider returns.
 */
export const BALL_EVASIVENESS = 1.45;
const PADDLE_ANGLE_GAIN = 0.28;
const PADDLE_VX_SHARE = 0.42;

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
export function createStartBall(
  serveSpeed = BALL_START_VY,
  evasiveness = BALL_EVASIVENESS
): BallVector {
  const { vx, vy } = velocityToward('child', serveSpeed);
  return { x: 0.5, y: 0.5, vx: vx * evasiveness, vy, toward: 'child' };
}

/** Kick a stationary ball — preserve intended receiver. */
export function ensureBallMoving(ball: BallVector, serveSpeed = BALL_START_VY): BallVector {
  if (Math.hypot(ball.vx, ball.vy) < 0.02) {
    const toward = ball.toward ?? ballTowardFromVy(ball.vy);
    const { vx, vy } = velocityToward(toward, serveSpeed);
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
  return { x: clampBallX(x), y: Math.min(1, Math.max(0, y)) };
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

export function overlapsPaddleX(
  x: number,
  paddleX: number,
  paddleHalf: number
): boolean {
  return Math.abs(x - paddleX) <= paddleHalf + BALL_RADIUS_X * 1.05;
}

/**
 * Leave angle from where the ball meets the paddle.
 * No random kick — the on-screen flight uses the same angle, so the
 * return does not kink when the next snapshot arrives.
 */
export function paddleReturnVelocity(
  x: number,
  vx: number,
  vy: number,
  paddleX: number,
  paddleHalf: number,
  defender: GamePlayerRole,
  paddleBoost = PADDLE_SPEED_BOOST,
  evasiveness = BALL_EVASIVENESS
): { vx: number; vy: number } {
  const hitOffset = Math.max(-1, Math.min(1, (x - paddleX) / Math.max(paddleHalf, 1e-6)));
  const nextToward: GamePlayerRole = defender === 'parent' ? 'child' : 'parent';
  const incoming = Math.max(MIN_SPEED, Math.hypot(vx, vy));
  const nextSpeed = Math.min(MAX_SPEED, incoming * paddleBoost);
  const angleKick = hitOffset * PADDLE_ANGLE_GAIN * evasiveness;
  const incomingVxShare = incoming > 1e-6 ? vx / incoming : 0;
  const maxShare = Math.min(0.9, PADDLE_VX_SHARE * evasiveness);
  const vxShare = Math.max(
    -maxShare,
    Math.min(maxShare, incomingVxShare * 0.65 * evasiveness + angleKick)
  );
  const outVx = vxShare * nextSpeed;
  const vyMag = Math.sqrt(Math.max(0, nextSpeed * nextSpeed - outVx * outVx));
  const outVy = nextToward === 'child' ? -vyMag : vyMag;
  return normalizeSpeed(outVx, outVy);
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
  paddleY: number,
  paddleBoost = PADDLE_SPEED_BOOST,
  evasiveness = BALL_EVASIVENESS
): { vx: number; vy: number; y: number; toward: GamePlayerRole } {
  const nextToward: GamePlayerRole = defender === 'parent' ? 'child' : 'parent';
  const normalized = paddleReturnVelocity(
    x,
    vx,
    vy,
    paddleX,
    paddleHalf,
    defender,
    paddleBoost,
    evasiveness
  );
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
  defender: GamePlayerRole,
  paddleBoost = PADDLE_SPEED_BOOST,
  evasiveness = BALL_EVASIVENESS
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
      paddleY,
      paddleBoost,
      evasiveness
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
    paddleY,
    paddleBoost,
    evasiveness
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
  winner: GameWinner,
  paddleBoost = PADDLE_SPEED_BOOST,
  evasiveness = BALL_EVASIVENESS
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
    'parent',
    paddleBoost,
    evasiveness
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
      'child',
      paddleBoost,
      evasiveness
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
export type BallPhysicsTune = {
  /** Serve / restart speed in court-heights per second. */
  serveSpeed?: number;
  /** Multiplier applied on each paddle return. */
  paddleBoost?: number;
  /** 0 = straight returns. 1 = default sideways kick. Higher = wider and less predictable. */
  evasiveness?: number;
};

export function stepBallPhysics(
  input: PhysicsStepInput,
  tune?: BallPhysicsTune
): PhysicsStepResult {
  const serveSpeed = tune?.serveSpeed ?? BALL_START_VY;
  const paddleBoost = tune?.paddleBoost ?? PADDLE_SPEED_BOOST;
  const evasiveness = tune?.evasiveness ?? BALL_EVASIVENESS;
  let ball = ensureBallMoving(input.ball, serveSpeed);
  let score = { ...input.score };
  let phase = input.phase;
  let winner = input.winner;
  let scored = false;
  let missed = false;
  let missedBy: GamePlayerRole | null = null;

  for (let i = 0; i < PHYSICS_SUBSTEPS; i++) {
    if (phase !== 'playing') break;

    const step = physicsSubstep(
      ball,
      input.paddles,
      score,
      phase,
      winner,
      paddleBoost,
      evasiveness
    );
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
