/**
 * The sprite must leave a paddle at once. Holding y on the contact line
 * while x keeps moving is the "rolls along the paddle" bug.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { integrateBallFlight } from '@/lib/game/ballFlight';
import {
  BALL_RADIUS_Y,
  DEFAULT_PADDLE_WIDTH,
  missHoldCenterY,
  PARENT_PADDLE_Y,
  stepBallPhysics,
} from '@/lib/game/physics';

const contact = PARENT_PADDLE_Y - BALL_RADIUS_Y;
const paddles = { parentX: 0.5, childX: 0.5, width: DEFAULT_PADDLE_WIDTH };

describe('paddle return flight', () => {
  it('turns back toward the other side instead of sliding on the paddle', () => {
    const pos = integrateBallFlight(
      { x: 0.5, y: contact - 0.04, vx: 0.45, vy: 0.54 },
      0.25,
      undefined,
      paddles
    );
    assert.ok(
      pos.y < contact - 0.03,
      `ball should have left the paddle, y=${pos.y} contact=${contact}`
    );
  });

  it('does not stay glued when the snapshot is already on the paddle', () => {
    const pos = integrateBallFlight(
      { x: 0.5, y: contact, vx: 0.5, vy: 0.54 },
      0.15,
      undefined,
      paddles
    );
    assert.ok(pos.y < contact - 0.02, `y=${pos.y} contact=${contact}`);
  });

  it('stops on the failure line when the paddle is not under the ball', () => {
    const missed = { parentX: 0.2, childX: 0.5, width: DEFAULT_PADDLE_WIDTH };
    const pos = integrateBallFlight(
      { x: 0.85, y: contact - 0.02, vx: 0.05, vy: 0.54 },
      0.2,
      undefined,
      missed
    );
    const onPaddle = missHoldCenterY('parent');
    assert.ok(
      pos.y > contact,
      `miss should sit on the paddle, not above it, y=${pos.y} contact=${contact}`
    );
    assert.ok(
      Math.abs(pos.y - onPaddle) < 0.01,
      `miss should rest on the paddle face, y=${pos.y} hold=${onPaddle}`
    );
    const later = integrateBallFlight(
      { x: 0.85, y: contact - 0.02, vx: 0.05, vy: 0.54 },
      0.8,
      undefined,
      missed
    );
    assert.ok(
      Math.abs(later.y - onPaddle) < 0.01,
      `a longer lookahead must stay on the paddle, y=${later.y}`
    );
  });

  it('counts one return and the ball is already moving away', () => {
    const result = stepBallPhysics({
      ball: { x: 0.5, y: contact - 0.01, vx: 0.1, vy: 0.54, toward: 'parent' },
      paddles,
      score: { shared: 2 },
      phase: 'playing',
      winner: null,
    });
    assert.equal(result.score.shared, 3);
    assert.ok(result.ball.vy < 0, `vy should leave the parent paddle, vy=${result.ball.vy}`);
    assert.ok(result.ball.y < contact, `y=${result.ball.y} contact=${contact}`);
  });
});
