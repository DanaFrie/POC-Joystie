'use client';

/**
 * DEV ONLY — RTDB ball game smoke test. Delete `src/app/game/test/` when done.
 * @see DELETE_AFTER_TEST.md
 */
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createGameRoom, joinGameRoom } from '@/lib/api/game';
import {
  subscribeToGameRoom,
  updateBallPosition,
  updatePaddlePosition,
  updateScoreAndPhase,
} from '@/lib/game/rooms';
import { getAuthInstance } from '@/lib/firebase';
import { getCurrentUserId } from '@/utils/auth';
import type { GamePlayerRole, GameRoomState } from '@/types/game';
import { Suspense } from 'react';

const BALL_SIZE = 0.04;
const PADDLE_Y = 0.92;
const WIN_SCORE = 4;

function GameTestInner() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const roomIdParam = searchParams.get('roomId') ?? '';
  const joinCodeParam = searchParams.get('joinCode') ?? '';

  const [roomId, setRoomId] = useState(roomIdParam);
  const [joinCode, setJoinCode] = useState(joinCodeParam);
  const [role, setRole] = useState<GamePlayerRole | null>(null);
  const [room, setRoom] = useState<GameRoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    return subscribeToGameRoom(roomId, setRoom);
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !role) return;
    const id = window.setInterval(async () => {
      if (!room || room.phase !== 'playing' || room.activeSide !== role) return;
      let { x, y, vx, vy } = room.ball;
      x += vx * 0.03;
      y += vy * 0.03;

      if (x <= BALL_SIZE / 2 || x >= 1 - BALL_SIZE / 2) {
        vx *= -1;
        x = Math.min(1 - BALL_SIZE / 2, Math.max(BALL_SIZE / 2, x));
      }

      let score = room.score;
      let phase: GameRoomState['phase'] = room.phase;
      let activeSide: GamePlayerRole = room.activeSide;
      let winner = room.winner;
      const paddleHalf = room.paddles.width / 2;
      const currentPaddleX = role === 'parent' ? room.paddles.parentX : room.paddles.childX;

      if (y >= PADDLE_Y) {
        const hit = Math.abs(x - currentPaddleX) <= paddleHalf;
        if (hit) {
          score = { shared: score.shared + 1 };
          // Reflect immediately to the other screen; never go below the paddle.
          vy = Math.abs(vy) * 1.04;
          activeSide = role === 'parent' ? 'child' : 'parent';
          y = BALL_SIZE / 2;
          winner = score.shared >= WIN_SCORE ? 'shared' : null;
          phase = winner ? 'finished' : 'playing';
        } else {
          // Miss by either side fails for both players and stops the game.
          score = { shared: 0 };
          phase = 'finished';
          winner = null;
          x = 0.5;
          y = PADDLE_Y;
          vx = Math.sign(vx || 1) * 0.32;
          vy = 0;
        }
      }

      if (y <= BALL_SIZE / 2) {
        // Switch to the other player's screen ("dimension").
        activeSide = role === 'parent' ? 'child' : 'parent';
        y = BALL_SIZE / 2;
        vy = Math.abs(vy);
      }

      await updateBallPosition(roomId, role, x, y, vx, vy);
      if (
        score.shared !== room.score.shared ||
        phase !== room.phase ||
        activeSide !== room.activeSide ||
        winner !== room.winner
      ) {
        await updateScoreAndPhase(roomId, score, phase, activeSide, winner);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [roomId, role, room]);

  const ensureAuth = useCallback(async () => {
    const auth = await getAuthInstance();
    if (!auth.currentUser) {
      const { signInAnonymously } = await import('firebase/auth');
      await signInAnonymously(auth);
    }
    return getCurrentUserId();
  }, []);

  const onCreateParentRoom = async () => {
    setError(null);
    setBusy(true);
    try {
      const uid = await getCurrentUserId();
      if (!uid) {
        setError('התחברו כהורה (אימייל) לפני יצירת חדר');
        return;
      }
      const result = await createGameRoom({});
      setRoomId(result.roomId);
      setJoinCode(result.joinCode);
      setRole('parent');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'יצירת חדר נכשלה');
    } finally {
      setBusy(false);
    }
  };

  const onJoinAsChild = async () => {
    setError(null);
    setBusy(true);
    try {
      await ensureAuth();
      await joinGameRoom({ roomId, joinCode });
      setRole('child');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'הצטרפות נכשלה');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (mode === 'child' && roomIdParam && joinCodeParam) {
      void onJoinAsChild();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, roomIdParam, joinCodeParam]);

  const onArenaMove = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!roomId || !role) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    try {
      await updatePaddlePosition(roomId, role, x);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'עדכון מגש נכשל');
    }
  };

  const childLink =
    typeof window !== 'undefined' && roomId && joinCode
      ? `${window.location.origin}/game/test?mode=child&roomId=${roomId}&joinCode=${joinCode}`
      : '';

  const isMyTurn = !!(room && role && room.activeSide === role);

  return (
    <div className="min-h-screen bg-[#F6F6F6] p-6 font-varela">
      <div className="max-w-lg mx-auto space-y-4">
        <p className="text-sm text-red-600 font-semibold">DEV TEST — מחקו את התיקייה game/test אחרי הבדיקה</p>

        {!roomId && (
          <button
            type="button"
            disabled={busy}
            onClick={onCreateParentRoom}
            className="w-full py-3 rounded-[18px] bg-[#273143] text-white"
          >
            צור חדר (הורה מחובר)
          </button>
        )}

        {roomId && mode !== 'child' && (
          <div className="bg-white p-4 rounded-[18px] space-y-2 text-sm">
            <p>
              <strong>roomId:</strong> {roomId}
            </p>
            <p>
              <strong>joinCode:</strong> {joinCode}
            </p>
            <p className="break-all">
              <strong>קישור ילד (חלון פרטי / מכשיר אחר):</strong> {childLink}
            </p>
            {!role && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setRole('parent')}
                className="w-full py-2 rounded-[18px] border-2 border-[#273143]"
              >
                המשך כהורה בחדר זה
              </button>
            )}
          </div>
        )}

        {roomId && role === null && mode === 'child' && (
          <p className="text-sm">מצטרף כילד…</p>
        )}

        {room && role && (
          <>
            <p className="text-sm text-[#494358] text-center">
              תפקיד: {role === 'parent' ? 'הורה' : 'ילד'} · שלב: {room.phase}
            </p>
            <p className="text-sm text-center font-semibold text-[#273143]">
              נקודות משותפות: {room.score.shared} / {WIN_SCORE}
            </p>
            <p className="text-xs text-center text-[#494358]">
              {isMyTurn ? 'הכדור אצלך — נגחו בזמן' : 'הכדור במסך השני — התכוננו'}
            </p>
            <div
              role="presentation"
              onMouseMove={onArenaMove}
              className="relative w-full aspect-square max-w-md mx-auto bg-[#E6F19A] rounded-[18px] border-2 border-[#273143] cursor-crosshair"
            >
              <div
                className="absolute h-3 -mt-1.5 rounded-full bg-[#1f2937]"
                style={{
                  width: `${room.paddles.width * 100}%`,
                  left: `${(role === 'parent' ? room.paddles.parentX : room.paddles.childX) * 100}%`,
                  top: `${PADDLE_Y * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              />
              <div
                className="absolute rounded-full bg-[#273143] border-2 border-white shadow-md transition-all duration-75"
                style={{
                  width: `${BALL_SIZE * 100}%`,
                  height: `${BALL_SIZE * 100}%`,
                  marginLeft: `-${(BALL_SIZE * 100) / 2}%`,
                  marginTop: `-${(BALL_SIZE * 100) / 2}%`,
                  left: `${(isMyTurn ? room.ball.x : -2) * 100}%`,
                  top: `${(isMyTurn ? room.ball.y : -2) * 100}%`,
                  opacity: isMyTurn ? 1 : 0,
                }}
              />
            </div>
            <p className="text-xs text-center text-[#948DA9]">
              לכל שחקן מגש אחד. כל נגיחה מוצלחת = נקודה. פספוס מאפס את הרצף.
            </p>
            {room.winner && (
              <p className="text-center font-semibold text-green-700">
                הצלחתם יחד! הגעתם ל-{WIN_SCORE} נקודות.
              </p>
            )}
            {room.phase === 'finished' && !room.winner && (
              <p className="text-center font-semibold text-red-600">
                הכדור נפל לתהום — שני השחקנים לא הצליחו.
              </p>
            )}
          </>
        )}

        {error && (
          <p className="text-sm text-red-600 text-center" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default function GameTestPage() {
  return (
    <Suspense fallback={<p className="p-6 font-varela">טוען…</p>}>
      <GameTestInner />
    </Suspense>
  );
}
