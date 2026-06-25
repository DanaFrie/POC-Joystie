import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import {
  BALL_START_VX,
  BALL_START_VY,
  DEFAULT_PADDLE_WIDTH,
  GAME_WIN_SCORE,
} from './constants';
import type { GameOnboardingContextRecord, GameRoomRecord } from './types';

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
  return { x: 0.5, y: 0.5, vx: 0, vy: 0, updatedBy: 'parent', updatedAt: now };
}

function isRoomMember(room: GameRoomRecord, uid: string): boolean {
  return room.parentId === uid || room.childUid === uid;
}

function buildOnboardingContext(data: Record<string, unknown>): GameOnboardingContextRecord | undefined {
  const ctx: GameOnboardingContextRecord = {};
  if (data.childId) ctx.childId = String(data.childId);
  if (data.challengeId) ctx.challengeId = String(data.challengeId);
  if (data.bondingInviteId) ctx.bondingInviteId = String(data.bondingInviteId);
  if (data.parentStepId) ctx.parentStepId = String(data.parentStepId);
  if (data.childStepId) ctx.childStepId = String(data.childStepId);
  return Object.keys(ctx).length > 0 ? ctx : undefined;
}

export const createGameRoom = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const parentId = request.auth.uid;
    const data = (request.data || {}) as Record<string, unknown>;
    const onboardingContext = buildOnboardingContext(data);

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
        width: DEFAULT_PADDLE_WIDTH,
      },
      score: {
        shared: 0,
      },
      activeSide: 'parent',
      winner: null,
      gameOutcome: null,
      onboardingAdvanced: false,
      onboardingAdvancedAt: null,
      createdAt: now,
      updatedAt: now,
      ...(onboardingContext?.childId ? { childId: onboardingContext.childId } : {}),
      ...(onboardingContext?.challengeId ? { challengeId: onboardingContext.challengeId } : {}),
      ...(onboardingContext?.bondingInviteId
        ? { bondingInviteId: onboardingContext.bondingInviteId }
        : {}),
      ...(onboardingContext ? { onboardingContext } : {}),
    };

    await roomRef.set(record);
    functions.logger.info('createGameRoom', { roomId, parentId, winScore: GAME_WIN_SCORE });
    return { roomId, joinCode: record.joinCode, winScore: GAME_WIN_SCORE };
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
      ball: {
        x: 0.5,
        y: 0.5,
        vx: BALL_START_VX,
        vy: BALL_START_VY,
        updatedBy: 'parent',
        updatedAt: now,
      },
      updatedAt: now,
    });

    functions.logger.info('joinGameRoom', { roomId, childUid: uid, phase: 'playing' });
    return { roomId, phase: 'playing' as const, winScore: GAME_WIN_SCORE };
  }
);

/** Poll onboarding funnel — is the cooperative game won and ready to advance? */
export const getGameOnboardingStatus = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const uid = request.auth.uid;
    const { roomId } = request.data as { roomId?: string };
    if (!roomId) {
      throw new functions.https.HttpsError('invalid-argument', 'roomId required');
    }

    const snap = await getRtdb().ref(`${ROOMS_PATH}/${roomId}`).get();
    if (!snap.exists()) {
      throw new functions.https.HttpsError('not-found', 'Room not found');
    }

    const room = snap.val() as GameRoomRecord;
    if (!isRoomMember(room, uid)) {
      throw new functions.https.HttpsError('permission-denied', 'Not a room member');
    }

    const won =
      room.phase === 'finished' &&
      room.winner === 'shared' &&
      room.score.shared >= GAME_WIN_SCORE;

    return {
      roomId,
      phase: room.phase,
      score: room.score.shared,
      winScore: GAME_WIN_SCORE,
      gameOutcome: room.gameOutcome ?? null,
      onboardingAdvanced: room.onboardingAdvanced === true,
      canAdvanceOnboarding: won && room.onboardingAdvanced === true,
      role: room.parentId === uid ? 'parent' : 'child',
    };
  }
);

/**
 * Idempotent — marks room ready for onboarding to advance after cooperative win.
 * Called by parent client when physics detects win (score >= win target).
 */
export const completeGameOnboarding = functions.https.onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }
    const uid = request.auth.uid;
    const { roomId } = request.data as { roomId?: string };
    if (!roomId) {
      throw new functions.https.HttpsError('invalid-argument', 'roomId required');
    }

    const roomRef = getRtdb().ref(`${ROOMS_PATH}/${roomId}`);
    const snap = await roomRef.get();
    if (!snap.exists()) {
      throw new functions.https.HttpsError('not-found', 'Room not found');
    }

    const room = snap.val() as GameRoomRecord;
    if (room.parentId !== uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only parent can complete onboarding game'
      );
    }

    const won =
      room.phase === 'finished' &&
      room.winner === 'shared' &&
      room.score.shared >= GAME_WIN_SCORE;

    if (!won) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Game not won yet — need cooperative win at target score'
      );
    }

    const now = new Date().toISOString();
    if (!room.onboardingAdvanced) {
      await roomRef.update({
        onboardingAdvanced: true,
        onboardingAdvancedAt: now,
        gameOutcome: 'won',
        updatedAt: now,
      });
    }

    functions.logger.info('completeGameOnboarding', {
      roomId,
      score: room.score.shared,
      winScore: GAME_WIN_SCORE,
    });

    return {
      roomId,
      onboardingAdvanced: true,
      winScore: GAME_WIN_SCORE,
      score: room.score.shared,
    };
  }
);
