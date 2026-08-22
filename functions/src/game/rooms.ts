import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { getServiceAccount } from '../serviceAccount';
import {
  DEFAULT_PADDLE_WIDTH,
  GAME_WIN_SCORE,
} from './constants';
import type { GameOnboardingContextRecord, GameRoomRecord } from './types';

const ROOMS_PATH = 'gameRooms';

const GAME_CALLABLE = {
  region: 'us-central1' as const,
  invoker: 'public' as const,
  serviceAccount: getServiceAccount(),
};

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
  { ...GAME_CALLABLE },
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
      playReady: { parent: false, child: false },
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

    const bondingInviteId = onboardingContext?.bondingInviteId;
    if (bondingInviteId) {
      const inviteRef = admin.firestore().collection('bonding_invites').doc(bondingInviteId);
      await inviteRef.set(
        {
          gameRoomId: roomId,
          gameJoinCode: record.joinCode,
          updatedAt: now,
        },
        { merge: true }
      );
    }

    functions.logger.info('createGameRoom', { roomId, parentId, winScore: GAME_WIN_SCORE });
    return { roomId, joinCode: record.joinCode, winScore: GAME_WIN_SCORE };
  }
);

export const joinGameRoom = functions.https.onCall(
  { ...GAME_CALLABLE },
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
    if (room.childUid === uid) {
      functions.logger.info('joinGameRoom already joined', { roomId, childUid: uid });
      return { roomId, phase: room.phase, winScore: GAME_WIN_SCORE };
    }

    const now = new Date().toISOString();
    const parentAlreadyReady = room.playReady?.parent === true;
    const hasStartedRound = (room as { hasStartedRound?: boolean }).hasStartedRound === true;
    await roomRef.update({
      childUid: uid,
      parentId: room.parentId,
      phase: 'waiting_ready',
      updatedAt: now,
    });

    if (parentAlreadyReady && !hasStartedRound) {
      await roomRef.update({
        phase: 'countdown',
        countdownAt: now,
        updatedAt: now,
      });
    }

    functions.logger.info('joinGameRoom', {
      roomId,
      childUid: uid,
      phase: parentAlreadyReady ? 'countdown' : 'waiting_ready',
    });
    return {
      roomId,
      phase: parentAlreadyReady ? ('countdown' as const) : ('waiting_ready' as const),
      winScore: GAME_WIN_SCORE,
    };
  }
);

/** Poll onboarding funnel — is the cooperative game won and ready to advance? */
export const getGameOnboardingStatus = functions.https.onCall(
  { ...GAME_CALLABLE },
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
  { ...GAME_CALLABLE },
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

/**
 * Marks cooperative win, removes RTDB room + bonding public snapshot.
 * Called by parent after win fade — stops live game sync.
 */
export const endOnboardingGameRoom = functions.https.onCall(
  { ...GAME_CALLABLE },
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
      return { roomId, removed: false, alreadyGone: true };
    }

    const room = snap.val() as GameRoomRecord;
    if (room.parentId !== uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only parent can end onboarding game'
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

    await roomRef.remove();
    await getRtdb().ref(`onboardingBondingPublic/${uid}`).remove();

    functions.logger.info('endOnboardingGameRoom', {
      roomId,
      parentId: uid,
      score: room.score.shared,
    });

    return { roomId, removed: true, winScore: GAME_WIN_SCORE, score: room.score.shared };
  }
);
