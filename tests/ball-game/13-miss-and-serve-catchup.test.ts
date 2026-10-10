/**
 * A miss stays finished until both players tap retry.
 * A stale opening stamp is caught up in one physics publish so the
 * sprite does not jump back to center.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { integrateBallFlight } from '@/lib/game/ballFlight';
import {
  createStartBall,
  DEFAULT_PADDLE_WIDTH,
  physicsCatchUpTicks,
  stepBallPhysics,
} from '@/lib/game/physics';
import { canRestartAfterMiss, shouldHoldFinishedRound } from '@/lib/game/stallGuards';

describe('miss stays finished', () => {
  it('does not treat the opening ready flags as a retry', () => {
    assert.equal(
      canRestartAfterMiss({
        phase: 'finished',
        winner: null,
        playReady: { parent: false, child: false },
      }),
      false
    );
    assert.equal(
      canRestartAfterMiss({
        phase: 'playing',
        winner: null,
        playReady: { parent: true, child: true },
      }),
      false
    );
    assert.equal(
      canRestartAfterMiss({
        phase: 'finished',
        winner: 'shared',
        playReady: { parent: true, child: true },
      }),
      false
    );
  });

  it('restarts only after both taps on a missed round', () => {
    assert.equal(
      canRestartAfterMiss({
        phase: 'finished',
        winner: null,
        playReady: { parent: true, child: true },
      }),
      true
    );
  });

  it('keeps a local miss when an older playing echo arrives', () => {
    assert.equal(
      shouldHoldFinishedRound({
        role: 'parent',
        localPhase: 'finished',
        remotePhase: 'playing',
        localBallUpdatedAt: '2026-10-10T12:00:01.000Z',
        remoteBallUpdatedAt: '2026-10-10T12:00:00.500Z',
      }),
      true
    );
    assert.equal(
      shouldHoldFinishedRound({
        role: 'parent',
        localPhase: 'finished',
        remotePhase: 'playing',
        localBallUpdatedAt: '2026-10-10T12:00:01.000Z',
        remoteBallUpdatedAt: '2026-10-10T12:00:01.200Z',
      }),
      false
    );
    assert.equal(
      shouldHoldFinishedRound({
        role: 'child',
        localPhase: 'finished',
        remotePhase: 'playing',
        localBallUpdatedAt: '2026-10-10T12:00:01.000Z',
        remoteBallUpdatedAt: '2026-10-10T12:00:00.500Z',
      }),
      false
    );
  });
});

describe('opening serve catch-up', () => {
  it('covers a stale stamp in one publish instead of a single 50ms step', () => {
    assert.equal(physicsCatchUpTicks(0.05), 1);
    assert.equal(physicsCatchUpTicks(0.3), 6);

    const start = createStartBall();
    const ticks = physicsCatchUpTicks(0.3);
    let ball = start;
    let score = { shared: 0 };
    let phase: 'playing' | 'finished' = 'playing';
    let winner = null;
    const paddles = { parentX: 0.5, childX: 0.5, width: DEFAULT_PADDLE_WIDTH };
    for (let t = 0; t < ticks; t += 1) {
      const stepped = stepBallPhysics({ ball, paddles, score, phase, winner });
      ball = stepped.ball;
      score = stepped.score;
      phase = stepped.phase;
      winner = stepped.winner;
    }

    const painted = integrateBallFlight(start, ticks * 0.05);
    assert.equal(phase, 'playing');
    assert.ok(ball.y < start.y - 0.1, `serve should have left center, y=${ball.y}`);
    assert.ok(
      Math.abs(ball.y - painted.y) < 0.04,
      `physics y=${ball.y} display y=${painted.y}`
    );
  });
});
