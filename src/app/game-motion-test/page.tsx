'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { OnboardingBallGameScreen } from '@/components/onboarding/game/OnboardingBallGameScreen';
import { FunnelViewportProvider } from '@/components/ui/FunnelViewportContext';
import { BALL_GAME_COUNTDOWN_TOTAL_MS } from '@/constants/ball-game-countdown';
import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';
import { BALL_SERVE_SPEED } from '@/lib/game/ballDirection';
import {
  clampPaddleCenterX,
  createStartBall,
  BALL_EVASIVENESS,
  DEFAULT_PADDLE_WIDTH,
  PADDLE_SPEED_BOOST,
  stepBallPhysics,
} from '@/lib/game/physics';
import { pointerXToCourt } from '@/lib/game/courtView';
import { createCoalescedAsyncWriter, PHYSICS_LOOP_INTERVAL_MS } from '@/lib/game/stallGuards';
import type { GamePlayerRole, GameRoomPhase, GameRoomState, GameWinner } from '@/types/game';

type Live = {
  ball: GameRoomState['ball'];
  paddles: GameRoomState['paddles'];
  score: GameRoomState['score'];
  phase: GameRoomPhase;
  winner: GameWinner;
  countdownAt: string | null;
};

const PHONE_METRICS = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  designWidth: V03_SCREEN_WIDTH,
  viewportWidth: V03_SCREEN_WIDTH,
  viewportHeight: V03_SCREEN_HEIGHT,
  needsVerticalScroll: false,
  usableCanvasHeightPx: V03_SCREEN_HEIGHT,
  canvasHeightPx: V03_SCREEN_HEIGHT,
};

function freshRally(): Live {
  const now = new Date().toISOString();
  return {
    ball: {
      x: 0.5,
      y: 0.5,
      vx: 0,
      vy: 0,
      updatedBy: 'parent',
      updatedAt: now,
    },
    paddles: { parentX: 0.5, childX: 0.5, width: DEFAULT_PADDLE_WIDTH },
    score: { shared: 0 },
    phase: 'countdown',
    winner: null,
    countdownAt: now,
  };
}

function toRoom(live: Live): GameRoomState {
  return {
    roomId: 'motion-test',
    parentId: 'parent',
    childUid: 'child',
    joinCode: 'PLAY',
    phase: live.phase,
    playReady: { parent: false, child: false },
    hasStartedRound: true,
    countdownAt: live.countdownAt,
    ball: live.ball,
    paddles: live.paddles,
    score: live.score,
    activeSide: 'parent',
    winner: live.winner,
    gameOutcome: live.phase === 'finished' ? (live.winner === 'shared' ? 'won' : 'missed') : null,
    createdAt: live.ball.updatedAt,
    updatedAt: live.ball.updatedAt,
  };
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Two real game screens. Parent runs physics and writes the ball.
 * The child screen paints the write after the App Hosting RTDB delay.
 * Each side moves only its own paddle.
 */
export default function GameMotionTestPage() {
  const [round, setRound] = useState(0);
  const [deliveryMs, setDeliveryMs] = useState(0);
  const [serveSpeed, setServeSpeed] = useState(BALL_SERVE_SPEED);
  const [paddleBoost, setPaddleBoost] = useState(PADDLE_SPEED_BOOST);
  const [evasiveness, setEvasiveness] = useState(BALL_EVASIVENESS);
  const [parent, setParent] = useState<Live | null>(null);
  const [remote, setRemote] = useState<Live | null>(null);

  const deliveryRef = useRef(deliveryMs);
  const serveSpeedRef = useRef(serveSpeed);
  const paddleBoostRef = useRef(paddleBoost);
  const evasivenessRef = useRef(evasiveness);
  const appliedSpeedRef = useRef(serveSpeed);
  const parentXRef = useRef(0.5);
  const childXRef = useRef(0.5);
  deliveryRef.current = deliveryMs;
  serveSpeedRef.current = serveSpeed;
  paddleBoostRef.current = paddleBoost;
  evasivenessRef.current = evasiveness;

  useEffect(() => {
    let cancelled = false;
    parentXRef.current = 0.5;
    childXRef.current = 0.5;
    let local = freshRally();
    const writer = createCoalescedAsyncWriter<Live>();
    setParent(local);
    setRemote(local);

    const id = window.setInterval(() => {
      if (cancelled) return;

      if (local.phase === 'countdown') {
        const started = Date.parse(local.countdownAt || '');
        if (Date.now() - started < BALL_GAME_COUNTDOWN_TOTAL_MS) return;
        const served = createStartBall(serveSpeedRef.current, evasivenessRef.current);
        appliedSpeedRef.current = serveSpeedRef.current;
        const now = new Date().toISOString();
        local = {
          ...local,
          phase: 'playing',
          ball: { ...served, updatedBy: 'parent', updatedAt: now },
        };
        setParent(local);
        return;
      }

      if (local.phase !== 'playing') return;

      const desiredSpeed = serveSpeedRef.current;
      const previousSpeed = appliedSpeedRef.current;
      if (Math.abs(desiredSpeed - previousSpeed) > 0.001 && previousSpeed > 0.001) {
        const scale = desiredSpeed / previousSpeed;
        const speed = Math.hypot(local.ball.vx, local.ball.vy);
        if (speed > 0.02) {
          local = {
            ...local,
            ball: {
              ...local.ball,
              vx: local.ball.vx * scale,
              vy: local.ball.vy * scale,
            },
          };
        }
        appliedSpeedRef.current = desiredSpeed;
      }

      const width = local.paddles.width;
      const paddles = {
        parentX: parentXRef.current,
        childX: childXRef.current,
        width,
      };
      const result = stepBallPhysics(
        {
          ball: local.ball,
          paddles,
          score: local.score,
          phase: local.phase,
          winner: local.winner,
        },
        {
          serveSpeed: serveSpeedRef.current,
          paddleBoost: paddleBoostRef.current,
          evasiveness: evasivenessRef.current,
        }
      );
      const now = new Date().toISOString();
      local = {
        ball: {
          x: result.ball.x,
          y: result.ball.y,
          vx: result.ball.vx,
          vy: result.ball.vy,
          toward: result.ball.toward,
          updatedBy: 'parent',
          updatedAt: now,
        },
        paddles,
        score: result.score,
        phase: result.phase,
        winner: result.winner,
        countdownAt: local.countdownAt,
      };
      setParent(local);

      const payload: Live = {
        ball: { ...local.ball },
        paddles: { ...local.paddles },
        score: { ...local.score },
        phase: local.phase,
        winner: local.winner,
        countdownAt: local.countdownAt,
      };
      writer.push(payload, async (written) => {
        await wait(deliveryRef.current);
        if (!cancelled) setRemote(written);
      });
    }, PHYSICS_LOOP_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [round]);

  const restart = () => setRound((n) => n + 1);

  return (
    <main className="flex h-[100dvh] flex-col bg-[#021014] text-white">
      <div className="flex shrink-0 flex-wrap items-center gap-4 px-4 py-2 font-rubik text-sm">
        <span className="font-bold">בדיקת משחק · שני מסכים</span>
        <label className="flex items-center gap-2 text-white/80">
          מהירות
          <input
            type="range"
            min={0.3}
            max={2.5}
            step={0.02}
            value={serveSpeed}
            onChange={(e) => setServeSpeed(Number(e.target.value))}
          />
          <span className="tabular-nums">{serveSpeed.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-white/80">
          האצה
          <input
            type="range"
            min={1}
            max={1.8}
            step={0.01}
            value={paddleBoost}
            onChange={(e) => setPaddleBoost(Number(e.target.value))}
          />
          <span className="tabular-nums">×{paddleBoost.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-white/80">
          התחמקות
          <input
            type="range"
            min={0}
            max={2}
            step={0.05}
            value={evasiveness}
            onChange={(e) => setEvasiveness(Number(e.target.value))}
          />
          <span className="tabular-nums">{evasiveness.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-white/80">
          השהיית RTDB
          <input
            type="range"
            min={0}
            max={400}
            step={20}
            value={deliveryMs}
            onChange={(e) => setDeliveryMs(Number(e.target.value))}
          />
          <span className="tabular-nums">{deliveryMs}ms</span>
        </label>
        <button
          type="button"
          onClick={restart}
          className="rounded-full bg-[#00E7A2] px-4 py-1.5 font-bold text-[#092125]"
        >
          התחלה מחדש
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 px-3 pb-3" dir="ltr">
        <PhoneGame
          label="הורה"
          role="parent"
          live={parent}
          onPaddle={(x) => {
            parentXRef.current = clampPaddleCenterX(x, DEFAULT_PADDLE_WIDTH);
          }}
          onRetry={restart}
        />
        <PhoneGame
          label="ילד"
          role="child"
          live={remote}
          onPaddle={(x) => {
            childXRef.current = clampPaddleCenterX(x, DEFAULT_PADDLE_WIDTH);
          }}
          onRetry={restart}
        />
      </div>
    </main>
  );
}

function PhoneGame({
  label,
  role,
  live,
  onPaddle,
  onRetry,
}: {
  label: string;
  role: GamePlayerRole;
  live: Live | null;
  onPaddle: (x: number) => void;
  onRetry: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const next = Math.min(box.width / V03_SCREEN_WIDTH, box.height / V03_SCREEN_HEIGHT);
      setScale(Number.isFinite(next) && next > 0 ? next : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="flex min-h-0 min-w-0 flex-col gap-1">
      <p className="text-center font-rubik text-sm text-white/70" dir="rtl">
        {label}
      </p>
      <div ref={boxRef} className="relative min-h-0 flex-1">
        <div
          className="absolute left-1/2 top-1/2 overflow-hidden rounded-[28px] bg-v03-green-900 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          style={{
            width: V03_SCREEN_WIDTH,
            height: V03_SCREEN_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          <FunnelViewportProvider isDesktop={false} metrics={PHONE_METRICS} layoutReady>
            {live ? (
              <OnboardingBallGameScreen
                role={role}
                room={toRoom(live)}
                parentName="אבא"
                childName="נועם"
                parentGender="male"
                childGender="boy"
                onPointerMove={(clientX, _clientY, rect) => {
                  onPaddle(pointerXToCourt(clientX, rect));
                }}
                onRetry={onRetry}
              />
            ) : null}
          </FunnelViewportProvider>
        </div>
      </div>
    </section>
  );
}
