'use client';

/**
 * DEV ONLY — RTDB ball game smoke test. Delete `src/app/game/test/` when done.
 * @see DELETE_AFTER_TEST.md
 */
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameArena } from '@/components/game/GameArena';
import { GAME_WIN_SCORE } from '@/constants/game';
import { shouldAdvanceOnboarding } from '@/lib/game/onboarding';
import { useGameSession } from '@/hooks/useGameSession';

function GameTestInner() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const roomIdParam = searchParams.get('roomId') ?? '';
  const joinCodeParam = searchParams.get('joinCode') ?? '';

  const {
    roomId,
    joinCode,
    role,
    room,
    error,
    busy,
    childJoinBlocked,
    childLink,
    parentAsChildError,
    onCreateParentRoom,
    attemptChildJoin,
    onArenaPointer,
    onRetry,
    resetChildJoinAttempt,
    continueAsParent,
  } = useGameSession({ mode, roomIdParam, joinCodeParam });

  return (
    <div className="min-h-screen bg-[#F6F6F6] p-6 font-varela">
      <div className="max-w-lg mx-auto space-y-4">
        <p className="text-sm text-red-600 font-semibold">
          DEV TEST — מחקו את התיקייה game/test אחרי חיבור לאונבורדינג
        </p>

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
              <strong>קישור ילד:</strong> {childLink}
            </p>
            <p className="text-amber-800 bg-amber-50 rounded-lg p-2 text-xs">
              פתחו את קישור הילד ב-Incognito או במכשיר אחר.
            </p>
            {!role && (
              <button
                type="button"
                disabled={busy}
                onClick={continueAsParent}
                className="w-full py-2 rounded-[18px] border-2 border-[#273143]"
              >
                המשך כהורה בחדר זה
              </button>
            )}
          </div>
        )}

        {roomId && role === null && mode === 'child' && !childJoinBlocked && (
          <p className="text-sm text-center">{busy ? 'מצטרף…' : 'ממתין…'}</p>
        )}

        {childJoinBlocked && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-[18px] text-sm space-y-2">
            <p className="font-semibold text-amber-900">אותו חשבון כמו ההורה</p>
            <p className="text-[#494358]">{parentAsChildError}</p>
            <p className="break-all text-xs text-[#948DA9]">{childLink}</p>
          </div>
        )}

        {mode === 'child' && error && !childJoinBlocked && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              resetChildJoinAttempt();
              void attemptChildJoin();
            }}
            className="w-full py-3 rounded-[18px] bg-[#273143] text-white"
          >
            נסו להצטרף שוב
          </button>
        )}

        {room && role && (
          <>
            <GameArena room={room} role={role} onPointerMove={onArenaPointer} />
            {room.phase === 'finished' && !room.winner && (
              <button
                type="button"
                disabled={busy}
                onClick={onRetry}
                className="w-full py-3 rounded-[18px] bg-[#273143] text-white"
              >
                נסו שוב
              </button>
            )}
            {room.phase === 'finished' && room.winner === 'shared' && (
              <div className="text-center space-y-2">
                <p className="font-semibold text-green-700">
                  {GAME_WIN_SCORE} נקודות — מוכן להמשך אונבורדינג
                </p>
                {shouldAdvanceOnboarding(room) && (
                  <p className="text-xs text-[#494358]">
                    (באונבורדינג האמיתי יעברו לשלב הבא אוטומטית)
                  </p>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={onRetry}
                  className="w-full py-3 rounded-[18px] border-2 border-[#273143]"
                >
                  שחקו שוב (בדיקה)
                </button>
              </div>
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
