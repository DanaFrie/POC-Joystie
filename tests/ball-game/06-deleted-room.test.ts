/**
 * Type 6 — presence (deleted RTDB room).
 * If gameRooms/{id} or ball is removed mid-rally, the UI used to stay on
 * «מתחברים למשחק» forever. Cleanup must also not delete a live room.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  GAME_ROOM_LOST_ERROR,
  isUsableGameRoomRaw,
  nextGameRoomPresence,
  shouldDeleteLeftoverGameRoom,
  shouldShowConnectingOverlay,
  type GameRoomPresence,
} from '@/lib/game/stallGuards';

const liveRoom = { ball: { x: 0.5, y: 0.5, vx: 0, vy: 0 } };

describe('deleted RTDB room (presence)', () => {
  it('treats null / missing ball as unusable', () => {
    assert.equal(isUsableGameRoomRaw(null), false);
    assert.equal(isUsableGameRoomRaw(undefined), false);
    assert.equal(isUsableGameRoomRaw({ phase: 'playing' }), false);
    assert.equal(isUsableGameRoomRaw({ ball: null }), false);
    assert.equal(isUsableGameRoomRaw(liveRoom), true);
  });

  it('first empty snapshot is connecting, not lost', () => {
    const presence = nextGameRoomPresence('unknown', null);
    assert.equal(presence, 'missing');
    assert.equal(shouldShowConnectingOverlay(presence), true);
  });

  it('live → null is a delete, not connecting', () => {
    const afterLive = nextGameRoomPresence('live', liveRoom);
    assert.equal(afterLive, 'live');
    const afterDelete = nextGameRoomPresence(afterLive, null);
    assert.equal(afterDelete, 'deleted');
    assert.equal(shouldShowConnectingOverlay(afterDelete), false);
    assert.equal(GAME_ROOM_LOST_ERROR, 'game_room_lost');
  });

  it('ball node stripped from an otherwise present record is a delete', () => {
    assert.equal(nextGameRoomPresence('live', { phase: 'playing' }), 'deleted');
  });

  it('stays deleted if more empty snaps arrive (no flicker back to connecting)', () => {
    assert.equal(nextGameRoomPresence('deleted', null), 'deleted');
  });

  it('must not delete leftover rooms while child/parent can still play', () => {
    for (const phase of ['waiting_child', 'waiting_ready', 'countdown', 'playing'] as const) {
      assert.equal(
        shouldDeleteLeftoverGameRoom({ phase }),
        false,
        `must keep room in phase=${phase}`
      );
    }
  });

  it('must not delete a missed rally still waiting on retry', () => {
    assert.equal(
      shouldDeleteLeftoverGameRoom({ phase: 'finished', onboardingAdvanced: false }),
      false
    );
  });

  it('may delete after cooperative win is marked advanced', () => {
    assert.equal(
      shouldDeleteLeftoverGameRoom({ phase: 'finished', onboardingAdvanced: true }),
      true
    );
  });

  it('walks a two-client sequence: both live, then parent cleanup deletes', () => {
    let parent: GameRoomPresence = 'unknown';
    let child: GameRoomPresence = 'unknown';
    parent = nextGameRoomPresence(parent, liveRoom);
    child = nextGameRoomPresence(child, liveRoom);
    assert.equal(parent, 'live');
    assert.equal(child, 'live');
    child = nextGameRoomPresence(child, null);
    assert.equal(child, 'deleted');
    assert.equal(shouldShowConnectingOverlay(child), false);
  });
});
