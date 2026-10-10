/**
 * Serve starts slow. Speed stays flat between hits and steps up on each return.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BALL_SERVE_SPEED } from '@/lib/game/ballDirection';
import {
  createStartBall,
  PADDLE_SPEED_BOOST,
  stepBallPhysics,
  type BallVector,
} from '@/lib/game/physics';
import type { GameWinner } from '@/types/game';

describe('rally pace', () => {
  it('serve is slower than a blur and aimed at the child', () => {
    const ball = createStartBall();
    assert.equal(ball.toward, 'child');
    assert.ok(ball.vy < 0);
    assert.ok(Math.abs(Math.abs(ball.vy) - BALL_SERVE_SPEED) < 1e-9);
    assert.ok(BALL_SERVE_SPEED < 1.2);
    assert.ok(Math.hypot(ball.vx, ball.vy) < 1.3);
  });

  it('does not lose speed while the ball is in flight', () => {
    let ball: BallVector = { x: 0.5, y: 0.62, vx: 0.04, vy: -0.45, toward: 'child' };
    const speed0 = Math.hypot(ball.vx, ball.vy);
    for (let i = 0; i < 16; i += 1) {
      const result = stepBallPhysics({
        ball,
        paddles: { parentX: 0.05, childX: 0.05, width: 0.12 },
        score: { shared: 0 },
        phase: 'playing',
        winner: null,
      });
      assert.equal(result.scored, false, `unexpected hit on tick ${i}`);
      const speed = Math.hypot(result.ball.vx, result.ball.vy);
      assert.ok(
        Math.abs(speed - speed0) < 1e-6,
        `tick ${i} speed ${speed} drifted from ${speed0}`
      );
      ball = result.ball;
    }
  });

  it('each paddle return multiplies speed by the rally boost', () => {
    const wide = { parentX: 0.5, childX: 0.5, width: 1 };
    let state = {
      ball: createStartBall(),
      paddles: wide,
      score: { shared: 0 },
      phase: 'playing' as const,
      winner: null as GameWinner,
    };
    let lastSpeed = Math.hypot(state.ball.vx, state.ball.vy);
    let hits = 0;
    for (let i = 0; i < 800 && hits < 6 && state.phase === 'playing'; i += 1) {
      const result = stepBallPhysics(state);
      if (result.scored) {
        hits += 1;
        const nextSpeed = Math.hypot(result.ball.vx, result.ball.vy);
        assert.ok(
          Math.abs(nextSpeed / lastSpeed - PADDLE_SPEED_BOOST) < 1e-6,
          `hit ${hits}: ${nextSpeed} / ${lastSpeed} should be ${PADDLE_SPEED_BOOST}`
        );
        lastSpeed = nextSpeed;
      }
      state = {
        ball: result.ball,
        paddles: result.paddles,
        score: result.score,
        phase: result.phase,
        winner: result.winner,
      };
    }
    assert.ok(hits >= 4, `expected several returns, got ${hits}`);
    assert.ok(lastSpeed > BALL_SERVE_SPEED * PADDLE_SPEED_BOOST ** 4);
  });
});
