'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  completeGameOnboarding,
  createGameRoom,
  joinGameRoom,
} from '@/lib/api/game';
import { pointerXToCourt } from '@/lib/game/courtView';
import { buildChildGameUrl, isGameWon } from '@/lib/game/onboarding';
import {
  logGamePhase,
  logGameRoomSnapshot,
  logGameTransition,
  logOnboardingAdvanceReady,
} from '@/lib/game/phaseLog';
import { isPhysicsAuthority, stepBallPhysics } from '@/lib/game/physics';
import {
  resetGameRound,
  subscribeToGameRoom,
  updateBallPosition,
  updatePaddlePosition,
  updateScoreAndPhase,
} from '@/lib/game/rooms';
import { getAuthInstance } from '@/lib/firebase';
import { getCurrentUserId } from '@/utils/auth';
import type { GamePlayerRole, GameRoomPhase, GameRoomState } from '@/types/game';

const PARENT_AS_CHILD_ERROR =
  'לא ניתן להצטרף כילד עם אותו חשבון הורה. פתחו את קישור הילד בחלון גלישה פרטית (Incognito) או במכשיר אחר.';

function formatGameError(e: unknown): string {
  const msg =
    e && typeof e === 'object' && 'message' in e
      ? String((e as { message: string }).message)
      : 'שגיאה לא ידועה';
  if (msg.includes('Parent cannot join as child')) return PARENT_AS_CHILD_ERROR;
  if (msg.includes('Room already has a child')) {
    return 'החדר כבר תפוס על ידי ילד אחר. צרו חדר חדש.';
  }
  if (msg.includes('admin-restricted-operation') || msg.includes('OPERATION_NOT_ALLOWED')) {
    return 'התחברות אנונימית לא מופעלת ב-Firebase. הפעילו Anonymous Auth בקונסול.';
  }
  if (msg.includes('not-found') || msg.includes('Room not found')) {
    return 'החדר לא נמצא. צרו חדר חדש מהמסך של ההורה.';
  }
  if (msg.includes('permission-denied') || msg.includes('Invalid join code')) {
    return 'קוד הצטרפות שגוי. בדקו את הקישור מההורה.';
  }
  return msg;
}

export type UseGameSessionOptions = {
  mode: string | null;
  roomIdParam: string;
  joinCodeParam: string;
  /** Dev: `/game/test`. Onboarding child route TBD. */
  childBasePath?: string;
};

export function useGameSession({
  mode,
  roomIdParam,
  joinCodeParam,
  childBasePath = '/game/test',
}: UseGameSessionOptions) {
  const [roomId, setRoomId] = useState(roomIdParam);
  const [joinCode, setJoinCode] = useState(joinCodeParam);
  const [role, setRole] = useState<GamePlayerRole | null>(null);
  const [room, setRoom] = useState<GameRoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [childJoinBlocked, setChildJoinBlocked] = useState(false);

  const roomRef = useRef<GameRoomState | null>(null);
  const childJoinAttempted = useRef(false);
  const lastPhaseRef = useRef<GameRoomPhase | null>(null);
  const onboardingCompleteCalled = useRef(false);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    if (roomIdParam) setRoomId(roomIdParam);
    if (joinCodeParam) setJoinCode(joinCodeParam);
  }, [roomIdParam, joinCodeParam]);

  useEffect(() => {
    if (mode === 'child' || role) return;
    void (async () => {
      const uid = await getCurrentUserId();
      if (uid && room?.parentId === uid) setRole('parent');
    })();
  }, [mode, role, room?.parentId]);

  useEffect(() => {
    if (!roomId) return;
    if (mode === 'child' && role !== 'child') return;
    return subscribeToGameRoom(roomId, setRoom);
  }, [roomId, mode, role]);

  useEffect(() => {
    if (!room) return;
    logGameRoomSnapshot(room, role);
    if (lastPhaseRef.current && lastPhaseRef.current !== room.phase) {
      logGameTransition(lastPhaseRef.current, room.phase, {
        roomId: room.roomId,
        score: room.score.shared,
        winner: room.winner,
      });
    }
    lastPhaseRef.current = room.phase;
    logGamePhase(room.phase, {
      roomId: room.roomId,
      role,
      score: room.score.shared,
      winner: room.winner,
      onboardingAdvanced: room.onboardingAdvanced,
    });
    if (isGameWon(room) && room.onboardingAdvanced) {
      logOnboardingAdvanceReady(room);
    }
  }, [room, role]);

  useEffect(() => {
    if (!roomId || !role || !isPhysicsAuthority(role)) return;

    const id = window.setInterval(async () => {
      const current = roomRef.current;
      if (!current || current.phase !== 'playing') return;

      try {
        const result = stepBallPhysics({
          ball: current.ball,
          paddles: current.paddles,
          score: current.score,
          phase: current.phase,
          winner: current.winner,
        });

        await updateBallPosition(
          roomId,
          role,
          result.ball.x,
          result.ball.y,
          result.ball.vx,
          result.ball.vy
        );

        if (
          result.score.shared !== current.score.shared ||
          result.phase !== current.phase ||
          result.winner !== current.winner
        ) {
          await updateScoreAndPhase(
            roomId,
            result.score,
            result.phase,
            'parent',
            result.winner
          );
        }

        if (
          result.phase === 'finished' &&
          result.winner === 'shared' &&
          !onboardingCompleteCalled.current
        ) {
          onboardingCompleteCalled.current = true;
          try {
            await completeGameOnboarding({ roomId });
            logOnboardingAdvanceReady({
              ...current,
              score: result.score,
              phase: result.phase,
              winner: result.winner,
              onboardingAdvanced: true,
            });
          } catch (err) {
            onboardingCompleteCalled.current = false;
            logGamePhase('finished', {
              completeGameOnboardingError:
                err instanceof Error ? err.message : 'unknown',
            });
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? `עדכון כדור נכשל: ${err.message}`
            : 'עדכון כדור נכשל'
        );
      }
    }, 50);

    return () => window.clearInterval(id);
  }, [roomId, role]);

  const ensureAnonymousChildAuth = useCallback(async () => {
    const auth = await getAuthInstance();
    const { signInAnonymously, signOut } = await import('firebase/auth');
    if (auth.currentUser) await signOut(auth);
    await signInAnonymously(auth);
    return getCurrentUserId();
  }, []);

  const onCreateParentRoom = async () => {
    setError(null);
    setBusy(true);
    onboardingCompleteCalled.current = false;
    try {
      const uid = await getCurrentUserId();
      if (!uid) {
        setError('התחברו כהורה (אימייל) לפני יצירת חדר');
        return;
      }
      const result = await createGameRoom({
        parentStepId: 'dev_test_parent',
        childStepId: 'dev_test_child',
      });
      setRoomId(result.roomId);
      setJoinCode(result.joinCode);
      setRole('parent');
      logGamePhase('waiting_child', { roomId: result.roomId, source: 'create' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'יצירת חדר נכשלה');
    } finally {
      setBusy(false);
    }
  };

  const attemptChildJoin = useCallback(async () => {
    if (!roomIdParam || !joinCodeParam) return;
    setError(null);
    setChildJoinBlocked(false);
    setBusy(true);
    try {
      await ensureAnonymousChildAuth();
      await joinGameRoom({ roomId: roomIdParam, joinCode: joinCodeParam });
      setRoomId(roomIdParam);
      setJoinCode(joinCodeParam);
      setRole('child');
      logGamePhase('playing', { roomId: roomIdParam, source: 'child_join' });
    } catch (e) {
      const msg = formatGameError(e);
      if (msg === PARENT_AS_CHILD_ERROR) {
        setChildJoinBlocked(true);
      } else {
        setError(msg);
        childJoinAttempted.current = false;
      }
    } finally {
      setBusy(false);
    }
  }, [roomIdParam, joinCodeParam, ensureAnonymousChildAuth]);

  useEffect(() => {
    if (mode !== 'child' || !roomIdParam || !joinCodeParam || role) return;
    if (childJoinAttempted.current) return;
    childJoinAttempted.current = true;
    void attemptChildJoin();
  }, [mode, roomIdParam, joinCodeParam, role, attemptChildJoin]);

  const onArenaPointer = async (clientX: number, _clientY: number, rect: DOMRect) => {
    if (!roomId || !role || !room) return;
    const x = pointerXToCourt(clientX, rect);
    try {
      await updatePaddlePosition(roomId, role, x, room.paddles.width);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'עדכון מגש נכשל');
    }
  };

  const onRetry = async () => {
    if (!roomId || busy) return;
    setError(null);
    setBusy(true);
    onboardingCompleteCalled.current = false;
    try {
      await resetGameRound(roomId);
      logGamePhase('playing', { roomId, source: 'retry' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'איפוס המשחק נכשל');
    } finally {
      setBusy(false);
    }
  };

  const childLink =
    typeof window !== 'undefined' && roomId && joinCode
      ? buildChildGameUrl(window.location.origin, roomId, joinCode, childBasePath)
      : '';

  return {
    roomId,
    joinCode,
    role,
    room,
    error,
    busy,
    childJoinBlocked,
    childLink,
    parentAsChildError: PARENT_AS_CHILD_ERROR,
    onCreateParentRoom,
    attemptChildJoin,
    onArenaPointer,
    onRetry,
    resetChildJoinAttempt: () => {
      childJoinAttempted.current = false;
    },
    continueAsParent: () => setRole('parent'),
  };
}
