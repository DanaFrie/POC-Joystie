/**
 * Type 3 — concurrency.
 * `setInterval(async () => await rtdbWrite)` started overlapping ticks from the
 * same ball snapshot. The serve looked frozen on every browser.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createExclusiveAsyncLock } from '@/lib/game/stallGuards';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('physics tick lock (concurrency)', () => {
  it('drops overlapping ticks so only one write is in flight', async () => {
    const lock = createExclusiveAsyncLock();
    let started = 0;
    let finished = 0;

    const tick = () =>
      lock.run(async () => {
        started += 1;
        await delay(40);
        finished += 1;
        return started;
      });

    const results = await Promise.all([tick(), tick(), tick(), tick()]);
    const ran = results.filter((value) => value !== undefined);

    assert.equal(started, 1);
    assert.equal(finished, 1);
    assert.equal(ran.length, 1);
    assert.equal(lock.pending, false);
  });

  it('allows the next tick after the in-flight write settles', async () => {
    const lock = createExclusiveAsyncLock();
    const order: number[] = [];

    await lock.run(async () => {
      order.push(1);
    });
    await lock.run(async () => {
      order.push(2);
    });

    assert.deepEqual(order, [1, 2]);
  });

  it('advances local ball across serialized ticks instead of rewriting the same y', async () => {
    const lock = createExclusiveAsyncLock();
    const ball = { y: 0.5, vy: -0.2 };
    const written: number[] = [];

    const tick = () =>
      lock.run(async () => {
        ball.y += ball.vy * 0.03;
        await delay(15);
        written.push(ball.y);
      });

    await tick();
    await tick();
    await tick();

    assert.equal(written.length, 3);
    assert.ok(written[0]! < 0.5);
    assert.ok(written[1]! < written[0]!);
    assert.ok(written[2]! < written[1]!);
  });
});
