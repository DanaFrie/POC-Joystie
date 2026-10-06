import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lerpBallDraw } from '@/lib/game/ballDraw';
import { stepLocalBall } from '@/lib/game/localBallMotion';

describe('physics ball draw (lerp only)', () => {
  it('sits on the from snapshot at t=0', () => {
    const pos = lerpBallDraw(
      { x: 0.2, y: 0.2 },
      { x: 0.8, y: 0.8 },
      1000,
      1000
    );
    assert.equal(pos.x, 0.2);
    assert.equal(pos.y, 0.2);
  });

  it('reaches the physics snapshot after 50ms', () => {
    const pos = lerpBallDraw(
      { x: 0.2, y: 0.2 },
      { x: 0.8, y: 0.8 },
      1000,
      1050
    );
    assert.equal(pos.x, 0.8);
    assert.equal(pos.y, 0.8);
  });

  it('does not run past the physics snapshot', () => {
    const pos = lerpBallDraw(
      { x: 0.2, y: 0.2 },
      { x: 0.8, y: 0.8 },
      1000,
      2000
    );
    assert.equal(pos.x, 0.8);
    assert.equal(pos.y, 0.8);
  });
});

describe('celebration wall stepper', () => {
  it('bounces on all walls after a win', () => {
    const next = stepLocalBall({ x: 0.01, y: 0.5, vx: -2, vy: 0 }, 'all');
    assert.ok(next.vx > 0);
  });
});
