/**
 * Opening serve: one countdown produces one serve, and the child paddle
 * placed before the rally is the one the ball hits.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { integrateBallFlight } from '@/lib/game/ballFlight';
import { applyGameStart } from '@/lib/game/gameStart';
import {
  BALL_RADIUS_Y,
  CHILD_PADDLE_Y,
  DEFAULT_PADDLE_WIDTH,
  stepBallPhysics,
} from '@/lib/game/physics';
import type { GameRoomPhase, GameWinner } from '@/types/game';

const contactY = CHILD_PADDLE_Y + BALL_RADIUS_Y;
const serveVy = -0.54;
const serveVx = 0.4;

function rallyUntilSettle(childX: number) {
  let ball = { x: 0.5, y: 0.5, vx: serveVx, vy: serveVy, toward: 'child' as const };
  let score = { shared: 0 };
  let phase: GameRoomPhase = 'playing';
  let winner: GameWinner = null;
  for (let i = 0; i < 40 && phase === 'playing'; i += 1) {
    const step = stepBallPhysics({
      ball,
      paddles: { parentX: 0.5, childX, width: DEFAULT_PADDLE_WIDTH },
      score,
      phase,
      winner,
    });
    ball = step.ball;
    score = step.score;
    phase = step.phase;
    winner = step.winner;
  }
  return { ball, score, phase };
}

describe('opening serve', () => {
  it('lets only the first countdown caller start the rally', () => {
    const serve = { x: 0.5, y: 0.5, vx: 0.2, vy: -0.54, toward: 'child' };
    const countdown = { phase: 'countdown', score: { shared: 0 }, paddles: { childX: 0.2 } };
    const started = applyGameStart(countdown, serve, '2026-10-10T00:00:00.000Z');
    assert.equal(started?.phase, 'playing');
    assert.equal((started?.ball as { vx: number }).vx, 0.2);
    assert.equal(applyGameStart(started ?? null, { ...serve, vx: 0.9 }, 'later'), undefined);
    assert.equal(applyGameStart(null, serve, 'later'), undefined);
  });

  it('misses a center paddle and returns when the paddle is where the serve lands', () => {
    const dt = (0.5 - contactY) / Math.abs(serveVy);
    const landed = integrateBallFlight({ x: 0.5, y: 0.5, vx: serveVx, vy: serveVy }, dt);
    const atCenter = rallyUntilSettle(0.5);
    assert.equal(atCenter.score.shared, 0);
    assert.equal(atCenter.phase, 'finished');

    const caught = rallyUntilSettle(landed.x);
    assert.equal(caught.score.shared, 1);
    assert.ok(caught.ball.vy > 0, `return should head back down, vy=${caught.ball.vy}`);
    assert.equal(caught.phase, 'playing');
  });
});
