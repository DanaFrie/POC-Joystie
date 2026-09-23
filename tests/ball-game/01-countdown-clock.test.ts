/**
 * Type 1 — unit (clock).
 * Frozen «מוכנים?» happens when countdown waits on Date.parse(countdownAt)
 * vs Date.now(). Phone clocks disagree; parent tab is often backgrounded.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BALL_GAME_COUNTDOWN_TOTAL_MS } from '@/constants/ball-game-countdown';
import { ballGameCountdownStep } from '@/constants/ball-game-countdown';
import {
  countdownElapsedMs,
  parseTimestampMs,
  shouldStartPlayFromCountdown,
} from '@/lib/game/stallGuards';

describe('countdown clock (unit)', () => {
  it('parses ISO, epoch-ms, and epoch-seconds; never returns NaN', () => {
    assert.equal(parseTimestampMs('2026-09-22T12:00:00.000Z'), Date.parse('2026-09-22T12:00:00.000Z'));
    assert.equal(parseTimestampMs(1_800_000_000_000), 1_800_000_000_000);
    assert.equal(parseTimestampMs('1800000000'), 1_800_000_000_000);
    assert.equal(parseTimestampMs('not-a-date'), null);
    assert.equal(parseTimestampMs(''), null);
    assert.equal(parseTimestampMs(NaN), null);
  });

  it('does not freeze on a countdownAt in the future (child clock behind parent)', () => {
    const observedAtMs = 1_000_000;
    const nowMs = observedAtMs + 5_000;
    const futureStamp = new Date(nowMs + 120_000).toISOString();
    const elapsed = countdownElapsedMs({
      countdownAt: futureStamp,
      observedAtMs,
      nowMs,
    });
    assert.equal(elapsed, 5_000);
    assert.equal(
      shouldStartPlayFromCountdown({
        phase: 'countdown',
        countdownAt: futureStamp,
        observedAtMs,
        nowMs,
      }),
      true
    );
  });

  it('starts play immediately when countdownAt is already overdue', () => {
    const nowMs = Date.parse('2026-09-22T12:00:10.000Z');
    assert.equal(
      shouldStartPlayFromCountdown({
        phase: 'countdown',
        countdownAt: '2026-09-22T12:00:00.000Z',
        observedAtMs: nowMs,
        nowMs,
      }),
      true
    );
  });

  it('still counts local 5s when countdownAt is missing or unparseable', () => {
    const observedAtMs = 50_000;
    assert.equal(
      shouldStartPlayFromCountdown({
        phase: 'countdown',
        countdownAt: 'garbage',
        observedAtMs,
        nowMs: observedAtMs + BALL_GAME_COUNTDOWN_TOTAL_MS - 1,
      }),
      false
    );
    assert.equal(
      shouldStartPlayFromCountdown({
        phase: 'countdown',
        countdownAt: null,
        observedAtMs,
        nowMs: observedAtMs + BALL_GAME_COUNTDOWN_TOTAL_MS,
      }),
      true
    );
  });

  it('does not start play before 5s on a healthy stamp', () => {
    const start = '2026-09-22T12:00:00.000Z';
    const startMs = Date.parse(start);
    assert.equal(
      shouldStartPlayFromCountdown({
        phase: 'countdown',
        countdownAt: start,
        observedAtMs: startMs,
        nowMs: startMs + 4_999,
      }),
      false
    );
    assert.equal(ballGameCountdownStep(0), 'ready');
    assert.equal(ballGameCountdownStep(1_000), '3');
    assert.equal(ballGameCountdownStep(4_000), 'go');
  });

  it('ignores non-countdown phases', () => {
    assert.equal(
      shouldStartPlayFromCountdown({
        phase: 'playing',
        countdownAt: '2026-09-22T12:00:00.000Z',
        observedAtMs: 0,
        nowMs: 10_000,
      }),
      false
    );
  });
});
