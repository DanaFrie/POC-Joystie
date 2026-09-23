/**
 * Type 7 — load simulation (RTDB write budget).
 * 50ms physics without a cap is 20 writes/s per game. Concurrent onboarding
 * games can exceed the 1000 writes/s database budget and stall every court.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createWriteRateLimiter,
  PHYSICS_MAX_WRITES_PER_SEC,
  PHYSICS_MIN_WRITE_INTERVAL_MS,
  RTDB_WRITE_BUDGET_PER_SEC,
  simulateRtdbWriteLoad,
} from '@/lib/game/stallGuards';

describe('RTDB write-rate (load simulation)', () => {
  it('caps one writer at 10 Hz, not the old 20 Hz', () => {
    const limiter = createWriteRateLimiter();
    let allowed = 0;
    for (let t = 0; t < 1000; t += 50) {
      if (limiter.allow(t)) {
        limiter.record(t);
        allowed += 1;
      }
    }
    assert.equal(PHYSICS_MIN_WRITE_INTERVAL_MS, 100);
    assert.equal(PHYSICS_MAX_WRITES_PER_SEC, 10);
    assert.equal(allowed, 10);
  });

  it('rejects a write that is closer than the min interval', () => {
    const limiter = createWriteRateLimiter({ minIntervalMs: 100, maxPerSec: 10 });
    assert.equal(limiter.allow(0), true);
    limiter.record(0);
    assert.equal(limiter.allow(50), false);
    assert.equal(limiter.allow(100), true);
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

  it('capped 10 Hz parent-only stays under budget for 90 concurrent games', () => {
    const load = simulateRtdbWriteLoad({
      concurrentGames: 90,
      writersPerGame: 1,
      writesPerSecPerWriter: PHYSICS_MAX_WRITES_PER_SEC,
    });
    assert.equal(load.totalWritesPerSec, 900);
    assert.equal(load.overBudget, false);
    assert.equal(load.headroom, 100);
  });

  it('flags child+parent both writing (failover fight) as over budget', () => {
    const load = simulateRtdbWriteLoad({
      concurrentGames: 60,
      writersPerGame: 2,
      writesPerSecPerWriter: PHYSICS_MAX_WRITES_PER_SEC,
    });
    assert.equal(load.totalWritesPerSec, 1200);
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
});
