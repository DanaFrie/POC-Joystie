/**
 * First serve — always toward the child, random X and left/right angle.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createStartBall } from '@/lib/game/physics';
import { ballTowardFromVy } from '@/lib/game/ballDirection';
import { isLegalRtdbBallWrite } from '@/lib/game/stallGuards';

describe('random child-first serve', () => {
  it('every serve is toward the child (vy < 0)', () => {
    for (let i = 0; i < 40; i += 1) {
      const ball = createStartBall();
      assert.equal(ball.toward, 'child');
      assert.ok(ball.vy < 0, `vy should be negative, got ${ball.vy}`);
      assert.equal(ballTowardFromVy(ball.vy), 'child');
      assert.equal(isLegalRtdbBallWrite(ball), true);
    }
  });

  it('varies lane X and vx across tries', () => {
    const xs = new Set<number>();
    const vxs = new Set<number>();
    for (let i = 0; i < 40; i += 1) {
      const ball = createStartBall();
      xs.add(Number(ball.x.toFixed(4)));
      vxs.add(Number(ball.vx.toFixed(4)));
      assert.ok(ball.x >= 0.22 && ball.x <= 0.78);
    }
    assert.ok(xs.size > 1, 'serve X should not be a single value');
    assert.ok(vxs.size > 1, 'serve vx should not be a single value');
  });
});
