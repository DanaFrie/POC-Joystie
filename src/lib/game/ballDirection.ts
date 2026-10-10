import type { GamePlayerRole } from '@/types/game';

/**
 * Serve speed in court-heights per second.
 * First returns stay readable. Each paddle hit multiplies speed
 * (`PADDLE_SPEED_BOOST` in physics) so later rallies are faster.
 * Nothing damps the ball between hits.
 */
/** Court-heights per second. */
export const BALL_SERVE_SPEED = 0.54;
export const BALL_START_VY = BALL_SERVE_SPEED;
/** Serve angle scale — small so the ball crosses the court instead of sliding on a side wall. */
export const BALL_START_VX = 0.32;

/** Shared-court Y velocity sign → player who should receive the ball next. */
export function ballTowardFromVy(vy: number): GamePlayerRole {
  return vy < 0 ? 'child' : 'parent';
}

function randomServeVx(): number {
  const spread = 0.35 + Math.random() * 0.5;
  const sign = Math.random() < 0.5 ? -1 : 1;
  return sign * BALL_START_VX * spread;
}

export function velocityToward(
  toward: GamePlayerRole,
  speed = BALL_START_VY,
  vx?: number
): { vx: number; vy: number } {
  const resolvedVx = vx ?? randomServeVx();
  return {
    vx: resolvedVx,
    vy: toward === 'child' ? -Math.abs(speed) : Math.abs(speed),
  };
}

/** True when the ball moves down on this player's screen (toward their paddle). */
export function ballApproachesSelfOnScreen(vy: number, role: GamePlayerRole): boolean {
  return ballTowardFromVy(vy) === role;
}
