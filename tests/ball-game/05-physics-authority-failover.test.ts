/**
 * Type 5 — simulation (authority failover).
 * Physics used to run on the parent device only. After serve, a backgrounded
 * parent phone (two-device onboarding) froze the ball for child and parent.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createStartBall, stepBallPhysics, DEFAULT_PADDLE_WIDTH } from '@/lib/game/physics';
import {
  PHYSICS_PARENT_STALE_MS,
  shouldRunPhysics,
} from '@/lib/game/stallGuards';

const paddles = { parentX: 0.5, childX: 0.5, width: DEFAULT_PADDLE_WIDTH };

describe('physics authority failover (simulation)', () => {
  it('parent always runs while playing', () => {
    assert.equal(
      shouldRunPhysics({
        role: 'parent',
        phase: 'playing',
        ballUpdatedAt: new Date().toISOString(),
        nowMs: Date.now(),
      }),
      true
    );
  });

  it('child does not fight a live parent tick stream', () => {
    const nowMs = Date.parse('2026-09-22T12:00:00.200Z');
    assert.equal(
      shouldRunPhysics({
        role: 'child',
        phase: 'playing',
        ballUpdatedAt: '2026-09-22T12:00:00.000Z',
        nowMs,
        staleMs: PHYSICS_PARENT_STALE_MS,
      }),
      false
    );
  });

  it('child takes over when parent updates go stale (background tab)', () => {
    const nowMs = Date.parse('2026-09-22T12:00:01.000Z');
    assert.equal(
      shouldRunPhysics({
        role: 'child',
        phase: 'playing',
        ballUpdatedAt: '2026-09-22T12:00:00.000Z',
        nowMs,
      }),
      true
    );
  });

  it('child takes over when ball.updatedAt is missing or unparseable', () => {
    assert.equal(
      shouldRunPhysics({
        role: 'child',
        phase: 'playing',
        ballUpdatedAt: '??',
        nowMs: Date.now(),
      }),
      true
    );
  });

  it('nobody runs physics before playing — countdown must not move the ball', () => {
    assert.equal(
      shouldRunPhysics({
        role: 'parent',
        phase: 'countdown',
        ballUpdatedAt: new Date().toISOString(),
        nowMs: Date.now(),
      }),
      false
    );
  });

  it('child failover actually advances the served ball', () => {
    const nowMs = Date.parse('2026-09-22T12:00:01.000Z');
    const canChildTick = shouldRunPhysics({
      role: 'child',
      phase: 'playing',
      ballUpdatedAt: '2026-09-22T12:00:00.000Z',
      nowMs,
    });
    assert.equal(canChildTick, true);

    const start = createStartBall();
    const result = stepBallPhysics({
      ball: start,
      paddles,
      score: { shared: 0 },
      phase: 'playing',
      winner: null,
    });
    assert.notEqual(result.ball.y, start.y);
  });
});
