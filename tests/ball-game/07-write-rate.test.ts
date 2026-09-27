/**
 * Type 7 — load simulation (RTDB write budget).
 * 20 Hz parent-only is the smooth cadence. Exclusive lock already stops
 * overlapping writes; the 1000 writes/s budget is only a concern at ~50
 * simultaneous live games.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createWriteRateLimiter,
  PHYSICS_LOOP_INTERVAL_MS,
  PHYSICS_MAX_CATCHUP_STEPS,
  PHYSICS_MAX_WRITES_PER_SEC,
  PHYSICS_MIN_WRITE_INTERVAL_MS,
  physicsStepsForElapsed,
  RTDB_WRITE_BUDGET_PER_SEC,
  simulateRtdbWriteLoad,
} from '@/lib/game/stallGuards';

describe('RTDB write-rate (load simulation)', () => {
  it('caps one writer at 20 Hz (one write per 50ms tick)', () => {
    const limiter = createWriteRateLimiter();
    let allowed = 0;
    for (let t = 0; t < 1000; t += 50) {
      if (limiter.allow(t)) {
        limiter.record(t);
        allowed += 1;
      }
    }
    assert.equal(PHYSICS_MIN_WRITE_INTERVAL_MS, 50);
    assert.equal(PHYSICS_MAX_WRITES_PER_SEC, 20);
    assert.equal(allowed, 20);
  });

  it('rejects a write that is closer than the min interval', () => {
    const limiter = createWriteRateLimiter({ minIntervalMs: 50, maxPerSec: 20 });
    assert.equal(limiter.allow(0), true);
    limiter.record(0);
    assert.equal(limiter.allow(25), false);
    assert.equal(limiter.allow(50), true);
  });

  it('old uncapped loop blows the database budget at 50 concurrent games', () => {
    const load = simulateRtdbWriteLoad({
      concurrentGames: 50,
      writersPerGame: 1,
      writesPerSecPerWriter: 20,
    });
    assert.equal(load.budgetPerSec, RTDB_WRITE_BUDGET_PER_SEC);
    assert.equal(load.totalWritesPerSec, 1000);
    assert.equal(load.overBudget, false);

    const over = simulateRtdbWriteLoad({
      concurrentGames: 51,
      writersPerGame: 1,
      writesPerSecPerWriter: 20,
    });
    assert.equal(over.overBudget, true);
  });

  it('20 Hz parent-only stays under budget for 40 concurrent games', () => {
    const load = simulateRtdbWriteLoad({
      concurrentGames: 40,
      writersPerGame: 1,
      writesPerSecPerWriter: PHYSICS_MAX_WRITES_PER_SEC,
    });
    assert.equal(load.totalWritesPerSec, 800);
    assert.equal(load.overBudget, false);
    assert.equal(load.headroom, 200);
  });

  it('flags child+parent both writing (failover fight) as over budget', () => {
    const load = simulateRtdbWriteLoad({
      concurrentGames: 60,
      writersPerGame: 2,
      writesPerSecPerWriter: PHYSICS_MAX_WRITES_PER_SEC,
    });
    assert.equal(load.totalWritesPerSec, 2400);
    assert.equal(load.overBudget, true);
  });

  it('1000 games at 20 Hz is far beyond production RTDB writes/s', () => {
    const load = simulateRtdbWriteLoad({
      concurrentGames: 1000,
      writersPerGame: 1,
      writesPerSecPerWriter: 20,
    });
    assert.equal(load.totalWritesPerSec, 20_000);
    assert.equal(load.overBudget, true);
  });

  it('healthy 50ms ticks stay 1 step; hitch gaps catch up', () => {
    assert.equal(PHYSICS_LOOP_INTERVAL_MS, 50);
    assert.equal(physicsStepsForElapsed(50), 1);
    assert.equal(physicsStepsForElapsed(100), 2);
    assert.equal(physicsStepsForElapsed(150), 3);
    assert.equal(physicsStepsForElapsed(400), PHYSICS_MAX_CATCHUP_STEPS);
  });
});
