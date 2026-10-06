import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ballFlightPosition } from '@/lib/game/ballFlight';

describe('ball display flight', () => {
  it('holds the snapshot at t=0', () => {
    const pos = ballFlightPosition(
      { x: 0.5, y: 0.4, vx: 0, vy: -2, updatedAt: '2026-01-01T00:00:00.000Z' },
      Date.parse('2026-01-01T00:00:00.000Z')
    );
    assert.equal(pos.x, 0.5);
    assert.equal(pos.y, 0.4);
  });

  it('advances along velocity until the lookahead cap', () => {
    const t0 = Date.parse('2026-01-01T00:00:00.000Z');
    const pos = ballFlightPosition(
      { x: 0.5, y: 0.5, vx: 0, vy: -2, updatedAt: '2026-01-01T00:00:00.000Z' },
      t0 + 40
    );
    assert.equal(pos.x, 0.5);
    assert.ok(Math.abs(pos.y - (0.5 - 2 * 0.04)) < 1e-9);
  });

  it('does not run more than 100ms ahead of the snapshot', () => {
    const t0 = Date.parse('2026-01-01T00:00:00.000Z');
    const pos = ballFlightPosition(
      { x: 0.5, y: 0.5, vx: 0, vy: -2, updatedAt: '2026-01-01T00:00:00.000Z' },
      t0 + 500
    );
    assert.ok(Math.abs(pos.y - (0.5 - 2 * 0.1)) < 1e-9);
  });
});
