/**
 * First rally only: both phones can see the countdown end.
 * One of them must win the serve. A second write resets the ball
 * mid-flight (direction jump, then a miss at score 0).
 */
export function applyGameStart(
  current: Record<string, unknown> | null,
  startBall: { x: number; y: number; vx: number; vy: number; toward?: string },
  now: string
): Record<string, unknown> | undefined {
  if (!current) return undefined;
  if (String(current.phase ?? '') !== 'countdown') return undefined;
  return {
    ...current,
    phase: 'playing',
    hasStartedRound: true,
    countdownAt: null,
    ball: {
      ...startBall,
      updatedBy: 'parent',
      updatedAt: now,
    },
    updatedAt: now,
  };
}
