/**
 * Display smoothing — local physics vs RTDB echo, and coasting between snapshots.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PHYSICS_DT } from '@/lib/game/physics';
import {
  BALL_EXTRAPOLATE_MAX_MS,
  blendBallPosition,
  displayBallAfterSnapshot,
  extrapolateBallPosition,
} from '@/lib/game/ballDisplay';
import {
  PHYSICS_LOOP_INTERVAL_MS,
  shouldKeepLocalBall,
} from '@/lib/game/stallGuards';

describe('ball display smoothness', () => {
  it('keeps a newer local ball instead of an older RTDB echo', () => {
    assert.equal(
      shouldKeepLocalBall({
        localUpdatedAt: '2026-09-27T12:00:00.200Z',
        remoteUpdatedAt: '2026-09-27T12:00:00.100Z',
        localPhase: 'playing',
        remotePhase: 'playing',
      }),
      true
    );
  });

  it('takes the remote ball when the snapshot is newer', () => {
    assert.equal(
      shouldKeepLocalBall({
        localUpdatedAt: '2026-09-27T12:00:00.100Z',
        remoteUpdatedAt: '2026-09-27T12:00:00.200Z',
        localPhase: 'playing',
        remotePhase: 'playing',
      }),
      false
    );
  });

  it('does not keep local ball after the rally leaves playing', () => {
    assert.equal(
      shouldKeepLocalBall({
        localUpdatedAt: '2026-09-27T12:00:00.400Z',
        remoteUpdatedAt: '2026-09-27T12:00:00.100Z',
        localPhase: 'playing',
        remotePhase: 'finished',
      }),
      false
    );
  });

  it('coasts one 50ms physics step of travel in 50ms', () => {
    const moved = extrapolateBallPosition({ x: 0.5, y: 0.5, vx: 0, vy: -0.6 }, 50);
    assert.ok(Math.abs(moved.y - (0.5 + -0.6 * PHYSICS_DT)) < 1e-9);
    assert.equal(PHYSICS_LOOP_INTERVAL_MS, 50);
  });

  it('caps extrapolation so a hitch does not tunnel the court', () => {
    const far = extrapolateBallPosition({ x: 0.5, y: 0.5, vx: 0, vy: -1 }, 5_000);
    const cap = extrapolateBallPosition(
      { x: 0.5, y: 0.5, vx: 0, vy: -1 },
      BALL_EXTRAPOLATE_MAX_MS
    );
    assert.deepEqual(far, cap);
  });

  it('coasts from receive time, not from a delayed writer clock', () => {
    const ball = { x: 0.5, y: 0.5, vx: 0, vy: -0.6 };
    const receivedAtMs = 1_000;
    const atReceive = displayBallAfterSnapshot({
      ball,
      from: { x: 0.5, y: 0.5 },
      receivedAtMs,
      nowMs: receivedAtMs,
    });
    assert.equal(atReceive.y, 0.5);

    const shortly = displayBallAfterSnapshot({
      ball,
      from: { x: 0.5, y: 0.5 },
      receivedAtMs,
      nowMs: receivedAtMs + 50,
    });
    assert.ok(shortly.y < 0.5);
    assert.ok(shortly.y > 0.5 + -0.6 * PHYSICS_DT - 0.01);
  });

  it('blends into a new snapshot instead of teleporting', () => {
    const mid = blendBallPosition({ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.8 }, 0.5);
    assert.ok(Math.abs(mid.x - 0.5) < 1e-9);
    assert.ok(Math.abs(mid.y - 0.5) < 1e-9);
  });
});
