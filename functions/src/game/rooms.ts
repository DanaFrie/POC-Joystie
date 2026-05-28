import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import type { GameRoomRecord } from './types';

const ROOMS_PATH = 'gameRooms';

function getRtdb() {
  return admin.database();
}

function randomJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function defaultBall(now: string): GameRoomRecord['ball'] {
  return { x: 0.5, y: 0.5, vx: 0.32, vy: 0.42, updatedBy: 'parent', updatedAt: now };
}

export const createGameRoom = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const parentId = request.auth.uid;
    const { childId, challengeId, bondingInviteId } = (request.data || {}) as {
      childId?: string;
      challengeId?: string;
      bondingInviteId?: string;
    };

    const roomRef = getRtdb().ref(ROOMS_PATH).push();
    const roomId = roomRef.key;
    if (!roomId) {
      throw new functions.https.HttpsError('internal', 'Failed to allocate room id');
    }

    const now = new Date().toISOString();
    const record: GameRoomRecord = {
      parentId,
      childUid: null,
      joinCode: randomJoinCode().toUpperCase(),
      phase: 'waiting_child',
      ball: defaultBall(now),
      paddles: {
        parentX: 0.5,
        childX: 0.5,
        width: 0.28,
      },
      score: {
        shared: 0,
      },
      activeSide: 'parent',
      winner: null,
      createdAt: now,
      updatedAt: now,
      ...(childId ? { childId } : {}),
      ...(challengeId ? { challengeId } : {}),
      ...(bondingInviteId ? { bondingInviteId } : {}),
    };

    await roomRef.set(record);
    return { roomId, joinCode: record.joinCode };
  }
);

export const joinGameRoom = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const uid = request.auth.uid;
    const { roomId, joinCode } = request.data as { roomId?: string; joinCode?: string };

    if (!roomId || !joinCode) {
      throw new functions.https.HttpsError('invalid-argument', 'roomId and joinCode required');
    }

    const roomRef = getRtdb().ref(`${ROOMS_PATH}/${roomId}`);
    const snap = await roomRef.get();
    if (!snap.exists()) {
      throw new functions.https.HttpsError('not-found', 'Room not found');
    }

    const room = snap.val() as GameRoomRecord;
    const normalized = String(joinCode).trim().toUpperCase();
    if (room.joinCode !== normalized) {
      throw new functions.https.HttpsError('permission-denied', 'Invalid join code');
    }
    if (room.parentId === uid) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Parent cannot join as child in the same account'
      );
    }
    if (room.childUid && room.childUid !== uid) {
      throw new functions.https.HttpsError('failed-precondition', 'Room already has a child');
    }

    const now = new Date().toISOString();
    await roomRef.update({
      childUid: uid,
      phase: 'playing',
      updatedAt: now,
    });

    return { roomId, phase: 'playing' as const };
  }
);
