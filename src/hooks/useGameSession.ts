'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
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
  beginCountdown,
  restartAfterMiss,
  resetGameRound,
  startGamePlay,
  subscribeToGameRoom,
  ensureWaitingReadyPhase,
  updateBallPosition,
  updatePaddlePosition,
  updatePlayReady,
} from '@/lib/game/rooms';
import { BALL_GAME_COUNTDOWN_TOTAL_MS } from '@/constants/ball-game-countdown';
import { ensureAnonymousChildAuth as signInAnonymousChild } from '@/lib/game/anonymousChildAuth';
import { getCurrentUserId } from '@/utils/auth';
import type { GameOnboardingContext } from '@/constants/game';
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
  /** Onboarding child game: `/game/child`. */
  childBasePath?: string;
  /** When set with empty roomId, auto-create as parent on mount. */
  autoCreateParent?: boolean;
  createRoomContext?: GameOnboardingContext;
};

export function useGameSession({
  mode,
  roomIdParam,
  joinCodeParam,
  childBasePath = '/game/child',
  autoCreateParent = false,
  createRoomContext,
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

        const scoreChanged = result.score.shared !== current.score.shared;
        const phaseChanged =
          result.phase !== current.phase || result.winner !== current.winner;

        await updateBallPosition(
          roomId,
          role,
          result.ball.x,
          result.ball.y,
          result.ball.vx,
          result.ball.vy,
          result.ball.toward,
          scoreChanged || phaseChanged
            ? {
                score: result.score,
                phase: result.phase,
                winner: result.winner,
              }
            : undefined
        );
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
    return signInAnonymousChild();
  }, []);

  const autoCreateAttempted = useRef(false);

  const onCreateParentRoom = useCallback(async (context?: GameOnboardingContext) => {
    setError(null);
    setBusy(true);
    try {
      const uid = await getCurrentUserId();
      if (!uid) {
        setError('התחברו כהורה (אימייל) לפני יצירת חדר');
        autoCreateAttempted.current = false;
        return;
      }
      const result = await createGameRoom(context ?? createRoomContext ?? {});
      setRoomId(result.roomId);
      setJoinCode(result.joinCode);
      setRole('parent');
      logGamePhase('waiting_child', { roomId: result.roomId, source: 'create' });
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'יצירת חדר נכשלה');
      autoCreateAttempted.current = false;
      return null;
    } finally {
      setBusy(false);
    }
  }, [createRoomContext]);

  useEffect(() => {
    if (!autoCreateParent || autoCreateAttempted.current || roomId) return;
    autoCreateAttempted.current = true;
    void onCreateParentRoom(createRoomContext);
  }, [autoCreateParent, roomId, createRoomContext, onCreateParentRoom]);

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
      try {
        await ensureWaitingReadyPhase(roomIdParam);
      } catch {
        // deployed joinGameRoom may already use waiting_ready
      }
      logGamePhase('waiting_ready', { roomId: roomIdParam, source: 'child_join' });
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

  const lastPaddleWriteAt = useRef(0);

  const onArenaPointer = useCallback(
    (clientX: number, _clientY: number, rect: DOMRect) => {
      if (!roomId || !role || !room || room.phase !== 'playing') return;
      const x = pointerXToCourt(clientX, rect);
      const now = performance.now();
      if (now - lastPaddleWriteAt.current < 32) return;
      lastPaddleWriteAt.current = now;
      void updatePaddlePosition(roomId, role, x, room.paddles.width).catch((err) => {
        setError(err instanceof Error ? err.message : 'עדכון מגש נכשל');
      });
    },
    [roomId, role, room]
  );

  const playReadyInFlight = useRef(false);
  const countdownStartedRef = useRef<string | null>(null);
  const playStartedRef = useRef<string | null>(null);
  const restartAfterMissRef = useRef<string | null>(null);

  const markPlayReady = useCallback(async () => {
    if (!roomId || playReadyInFlight.current) return;

    let effectiveRole = role;
    if (!effectiveRole && room) {
      const uid = await getCurrentUserId();
      if (uid && uid === room.parentId) effectiveRole = 'parent';
      else if (uid && uid === room.childUid) effectiveRole = 'child';
    }
    if (!effectiveRole) {
      setError('לא ניתן לאשר מוכנות — נסו לרענן את העמוד');
      return;
    }

    playReadyInFlight.current = true;
    setError(null);
    try {
      await updatePlayReady(roomId, effectiveRole, true);
      if (!role) setRole(effectiveRole);
      logGamePhase('waiting_ready', { roomId, role: effectiveRole, playReady: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'אישור מוכנות נכשל');
    } finally {
      playReadyInFlight.current = false;
    }
  }, [roomId, role, room]);

  const onRetry = useCallback(async () => {
    if (!roomId || playReadyInFlight.current) return;
    const current = roomRef.current;
    if (current?.phase === 'finished' && !current.winner) {
      await markPlayReady();
      return;
    }
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await resetGameRound(roomId);
      logGamePhase('playing', { roomId, source: 'retry' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'איפוס המשחק נכשל');
    } finally {
      setBusy(false);
    }
  }, [roomId, busy, markPlayReady]);

  /** Parent only — first rally: synchronized countdown before play. */
  useEffect(() => {
    if (!roomId || !room || role !== 'parent') return;
    const ready = room.playReady ?? { parent: false, child: false };
    if (
      room.childUid &&
      ready.parent &&
      !room.hasStartedRound &&
      (room.phase === 'waiting_ready' || room.phase === 'waiting_child')
    ) {
      const key = `${roomId}:countdown`;
      if (countdownStartedRef.current === key) return;
      countdownStartedRef.current = key;
      void beginCountdown(roomId).catch((err) => {
        countdownStartedRef.current = null;
        setError(err instanceof Error ? err.message : 'התחלת ספירה נכשלה');
      });
    }
    if (room.phase === 'waiting_ready' && !ready.parent) {
      countdownStartedRef.current = null;
    }
  }, [roomId, role, room]);

  /** Parent only — end countdown → serve toward child. */
  useEffect(() => {
    if (!roomId || !room || role !== 'parent') return;
    if (room.phase !== 'countdown' || !room.countdownAt) return;

    const key = `${roomId}:${room.countdownAt}`;
    const startMs = new Date(room.countdownAt).getTime();
    const fire = () => {
      if (Date.now() - startMs < BALL_GAME_COUNTDOWN_TOTAL_MS) return;
      if (playStartedRef.current === key) return;
      playStartedRef.current = key;
      void startGamePlay(roomId).catch((err) => {
        playStartedRef.current = null;
        setError(err instanceof Error ? err.message : 'התחלת משחק נכשלה');
      });
    };
    fire();
    const id = window.setInterval(fire, 100);
    return () => window.clearInterval(id);
  }, [roomId, role, room]);

  /** Parent only — both tapped retry after miss. */
  useEffect(() => {
    if (!roomId || !room || role !== 'parent') return;
    const ready = room.playReady ?? { parent: false, child: false };
    if (room.phase === 'finished' && !room.winner && ready.parent && ready.child) {
      const key = `${roomId}:${room.updatedAt}:restart`;
      if (restartAfterMissRef.current === key) return;
      restartAfterMissRef.current = key;
      void restartAfterMiss(roomId).catch((err) => {
        restartAfterMissRef.current = null;
        setError(err instanceof Error ? err.message : 'התחלת משחק מחדש נכשלה');
      });
    }
    if (room.phase === 'playing') {
      restartAfterMissRef.current = null;
    }
  }, [roomId, role, room]);

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
    markPlayReady,
    resetChildJoinAttempt: () => {
      childJoinAttempted.current = false;
    },
    continueAsParent: () => setRole('parent'),
  };
}
