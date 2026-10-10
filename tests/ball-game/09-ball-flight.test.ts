import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BALL_FLIGHT_MAX_LOOKAHEAD_S,
  ballFlightPosition,
} from '@/lib/game/ballFlight';
import { BALL_RADIUS_X, BALL_RADIUS_Y, CHILD_PADDLE_Y } from '@/lib/game/physics';
import { APP_HOSTING_RTDB_DELIVERY_MS } from '@/lib/game/stallGuards';

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

  it('does not run more than the lookahead cap ahead of the snapshot', () => {
    const t0 = Date.parse('2026-01-01T00:00:00.000Z');
    const pos = ballFlightPosition(
      { x: 0.5, y: 0.5, vx: 0, vy: -0.2, updatedAt: '2026-01-01T00:00:00.000Z' },
      t0 + 900
    );
    assert.ok(
      Math.abs(pos.y - (0.5 - 0.2 * BALL_FLIGHT_MAX_LOOKAHEAD_S)) < 1e-9
    );
  });

  it('holds at the paddle instead of flying through it', () => {
    const t0 = Date.parse('2026-01-01T00:00:00.000Z');
    const pos = ballFlightPosition(
      { x: 0.5, y: 0.25, vx: 0, vy: -3, updatedAt: new Date(t0).toISOString() },
      t0 + 400
    );
    assert.ok(Math.abs(pos.y - (CHILD_PADDLE_Y + BALL_RADIUS_Y)) < 1e-6);
  });

  it('keeps flying across an App Hosting RTDB delivery instead of sitting on the stale sample', () => {
    const t0 = Date.parse('2026-01-01T00:00:00.000Z');
    const sent = {
      x: 0.5,
      y: 0.5,
      vx: 0,
      vy: -1,
      updatedAt: new Date(t0).toISOString(),
    };
    const paintedWhenItArrives = ballFlightPosition(sent, t0 + APP_HOSTING_RTDB_DELIVERY_MS);
    const whereTheBallActuallyIs = 0.5 - 1 * (APP_HOSTING_RTDB_DELIVERY_MS / 1000);
    assert.ok(Math.abs(paintedWhenItArrives.y - whereTheBallActuallyIs) < 1e-9);
    assert.ok(paintedWhenItArrives.y < sent.y);
  });

  it('a newer sample continues the same flight (no rewind)', () => {
    const t0 = Date.parse('2026-01-01T00:00:00.000Z');
    const first = ballFlightPosition(
      { x: 0.5, y: 0.5, vx: 0, vy: -1, updatedAt: new Date(t0).toISOString() },
      t0 + 80
    );
    const second = ballFlightPosition(
      {
        x: 0.5,
        y: 0.5 - 0.05,
        vx: 0,
        vy: -1,
        updatedAt: new Date(t0 + 50).toISOString(),
      },
      t0 + 80
    );
    assert.ok(Math.abs(first.y - second.y) < 1e-9);
  });

  it('bounces off a side wall instead of sticking to it', () => {
    const t0 = Date.parse('2026-01-01T00:00:00.000Z');
    const x0 = BALL_RADIUS_X + 0.05;
    const pos = ballFlightPosition(
      { x: x0, y: 0.5, vx: -1, vy: 0, updatedAt: new Date(t0).toISOString() },
      t0 + 200
    );
    assert.ok(Math.abs(pos.x - (BALL_RADIUS_X + 0.15)) < 1e-6);
  });
});
