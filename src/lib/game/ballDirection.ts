import type { GamePlayerRole } from '@/types/game';

/** Base serve speed — 8× the 9cbaea3 start, then −35%, then −20%. */
export const BALL_START_VY = 0.602784 * 8 * 0.65 * 0.8;
export const BALL_START_VX = 0.43056 * 8 * 0.65 * 0.8;

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
