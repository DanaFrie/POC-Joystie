/**
 * Type 2 — regression (join vs live room).
 * Child `ensureWaitingReadyPhase` used to rewrite countdown/playing back to
 * waiting_ready with vx=vy=0, which parked the serve and stuck onboarding.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { shouldResetRoomToWaitingReady } from '@/lib/game/stallGuards';

describe('join phase guard (regression)', () => {
  it('may reset only a fresh waiting_child room', () => {
    assert.equal(shouldResetRoomToWaitingReady('waiting_child'), true);
    assert.equal(shouldResetRoomToWaitingReady(''), true);
  });

  it('must not rewind countdown, playing, waiting_ready, or finished', () => {
    for (const phase of ['waiting_ready', 'countdown', 'playing', 'finished'] as const) {
      assert.equal(
        shouldResetRoomToWaitingReady(phase),
        false,
        `join must not clobber phase=${phase}`
      );
    }
  });

  it('must not reset after the first rally has started', () => {
    assert.equal(shouldResetRoomToWaitingReady('waiting_child', true), false);
    assert.equal(shouldResetRoomToWaitingReady('countdown', true), false);
    assert.equal(shouldResetRoomToWaitingReady('playing', true), false);
  });

  it('covers the production race: join sets countdown, then ensureWaitingReady runs', () => {
    const roomAfterJoin = { phase: 'countdown', hasStartedRound: false };
    assert.equal(
      shouldResetRoomToWaitingReady(roomAfterJoin.phase, roomAfterJoin.hasStartedRound),
      false
    );
  });

  it('covers the late-join race: play already started when child ensure runs', () => {
    const roomAfterServe = { phase: 'playing', hasStartedRound: true };
    assert.equal(
      shouldResetRoomToWaitingReady(roomAfterServe.phase, roomAfterServe.hasStartedRound),
      false
    );
  });
});
