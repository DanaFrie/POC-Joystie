/**
 * First serve — toward the child from court center (deployed 9cbaea3 feel).
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createStartBall } from '@/lib/game/physics';
import { BALL_START_VY, ballTowardFromVy } from '@/lib/game/ballDirection';
import { isLegalRtdbBallWrite } from '@/lib/game/stallGuards';

describe('child-first serve', () => {
  it('serve is toward the child (vy < 0) from center and legal for RTDB', () => {
    const ball = createStartBall();
    assert.equal(ball.toward, 'child');
    assert.equal(ball.x, 0.5);
    assert.equal(ball.y, 0.5);
    assert.ok(ball.vy < 0, `vy should be negative, got ${ball.vy}`);
    assert.ok(
      Math.abs(ball.vy) >= BALL_START_VY * 0.99,
      `expected serve vy, got ${ball.vy}`
    );
    assert.equal(ballTowardFromVy(ball.vy), 'child');
    assert.equal(isLegalRtdbBallWrite(ball), true);
  });
});
