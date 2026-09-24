/**
 * Type 4 — contract (RTDB rules).
 * Ball y was not clamped. A single write with y∉[0,1] or |v|>1 is rejected
 * and the 50ms loop stops advancing — stuck after serve.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  clampBallCenter,
  createStartBall,
  DEFAULT_PADDLE_WIDTH,
  stepBallPhysics,
  stepBallPhysicsN,
} from '@/lib/game/physics';
import type { GameWinner } from '@/types/game';
import {
  clampBallForRtdbWrite,
  isLegalRtdbBallWrite,
} from '@/lib/game/stallGuards';

const paddles = { parentX: 0.5, childX: 0.5, width: DEFAULT_PADDLE_WIDTH };

describe('RTDB ball bounds (contract)', () => {
  it('clamps y into [0,1] before a write (the old center helper left y raw)', () => {
    assert.deepEqual(clampBallCenter(0.5, -0.04), {
      x: clampBallCenter(0.5, 0.5).x,
      y: 0,
    });
    assert.equal(clampBallCenter(0.5, 1.2).y, 1);
  });

  it('repairs illegal velocity so rules (.validate |v|<=1) accept the write', () => {
    const repaired = clampBallForRtdbWrite({ x: 0.5, y: 0.5, vx: 1.8, vy: -2 });
    assert.equal(isLegalRtdbBallWrite(repaired), true);
    assert.equal(repaired.vx, 1);
    assert.equal(repaired.vy, -1);
  });

  it('keeps a served ball legal for the first 80 physics ticks', () => {
    let state = {
      ball: createStartBall(),
      paddles,
      score: { shared: 0 },
      phase: 'playing' as const,
      winner: null as GameWinner,
    };

    for (let i = 0; i < 80; i += 1) {
      const result = stepBallPhysics(state);
      const write = clampBallForRtdbWrite(result.ball);
      assert.equal(
        isLegalRtdbBallWrite(write),
        true,
        `tick ${i} produced an illegal RTDB ball ${JSON.stringify(write)}`
      );
      if (result.phase !== 'playing') break;
      state = {
        ball: result.ball,
        paddles: result.paddles,
        score: result.score,
        phase: result.phase,
        winner: result.winner,
      };
    }
  });

  it('rejects the pre-fix out-of-range write the rules would drop', () => {
    assert.equal(isLegalRtdbBallWrite({ x: 0.5, y: -0.01, vx: 0, vy: -0.4 }), false);
    assert.equal(isLegalRtdbBallWrite({ x: 0.5, y: 1.01, vx: 0, vy: 0.4 }), false);
  });

  it('two catch-up steps match two 50ms ticks so 10 Hz writes keep original speed', () => {
    const input = {
      ball: { x: 0.5, y: 0.5, vx: 0.2, vy: -0.6, toward: 'child' as const },
      paddles,
      score: { shared: 0 },
      phase: 'playing' as const,
      winner: null as GameWinner,
    };
    const first = stepBallPhysics(input);
    const second = stepBallPhysics({
      ...input,
      ball: first.ball,
      score: first.score,
      phase: first.phase,
      winner: first.winner,
    });
    const catchup = stepBallPhysicsN(input, 2);
    assert.ok(Math.abs(catchup.ball.y - second.ball.y) < 1e-9);
    assert.ok(Math.abs(catchup.ball.x - second.ball.x) < 1e-9);
    assert.ok(
      Math.abs(catchup.ball.y - first.ball.y) > 0.001,
      'catch-up must travel farther than a single skipped tick'
    );
  });
});
