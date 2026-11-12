'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { BALL_GAME_SLIDER_CTA_CLASS } from '@/components/onboarding/game/BallGameSliderCard';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { GAME_WIN_SCORE } from '@/constants/game';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import {
  createSnakeMatch,
  queueTurn,
  SNAKE_COLS,
  SNAKE_ROWS,
  SNAKE_TICK_MS,
  stepSnake,
  type SnakeCell,
  type SnakeDir,
  type SnakeMatch,
  type SnakeRole,
} from '@/lib/game/snake/engine';

const DESIGN_W = 375;
const DESIGN_H = 812;
const PHONE_GAP = 20;

const ROLE_NAME: Record<SnakeRole, string> = {
  parent: 'הורה',
  child: 'ילד',
};

const CRASH_COPY: Record<'wall' | 'self', string> = {
  wall: 'נתקל בקיר',
  self: 'נתקל בעצמו',
};

type Tone = 'parent' | 'child' | 'food';

/** Child's phone is flipped so their snake sits at the bottom, same as the ball game. */
function screenDirToWorld(role: SnakeRole, dir: SnakeDir): SnakeDir {
  if (role === 'parent') return dir;
  if (dir === 'up') return 'down';
  if (dir === 'down') return 'up';
  return dir;
}

function worldDirToScreen(role: SnakeRole, dir: SnakeDir): SnakeDir {
  return screenDirToWorld(role, dir);
}

function viewCell(role: SnakeRole, cell: SnakeCell): SnakeCell {
  if (role === 'parent') return cell;
  return { x: cell.x, y: SNAKE_ROWS - 1 - cell.y };
}

/** Same orange layers as the in-court ball (`#FAD733` / `#F8A313` / `#FC850E`). */
function OrangeOrb({ size, tone }: { size: number; tone: Tone }) {
  const scale = size / 44;
  const glow = 54 * scale;
  const outer = 44 * scale;
  const mid = 30 * scale;
  const core = 12 * scale;
  const glowColor = tone === 'child' ? 'rgba(248, 163, 19, 0.55)' : 'rgba(239, 61, 14, 0.60)';
  const midColor = tone === 'child' ? '#FC850E' : '#F8A313';
  const coreColor = tone === 'child' ? '#F8A313' : '#FC850E';

  return (
    <div className="pointer-events-none relative overflow-visible" style={{ width: size, height: size }}>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: glow, height: glow, background: glowColor, filter: `blur(${5.8 * scale}px)` }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FAD733]"
        style={{ width: outer, height: outer }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{ width: mid, height: mid, borderColor: midColor }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: core, height: core, background: coreColor }}
      />
    </div>
  );
}

function DPad({
  label,
  hint,
  dir,
  onDir,
}: {
  label: string;
  hint: string;
  dir: SnakeDir;
  onDir: (dir: SnakeDir) => void;
}) {
  const press = (next: SnakeDir) => (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onDir(next);
  };

  const key = (next: SnakeDir, icon: React.ReactNode, aria: string, className: string) => (
    <button
      type="button"
      aria-label={aria}
      aria-pressed={dir === next}
      onPointerDown={press(next)}
      onContextMenu={(event) => event.preventDefault()}
      className={`flex h-full w-full items-center justify-center rounded-full touch-none ${
        dir === next ? 'bg-[#00E7A2] text-[#092125]' : 'bg-white/10 text-white'
      } ${className}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <p
        className="font-assistant text-[28px] font-black leading-none text-[#00E7A2]"
        style={{ textShadow: '0 0 25px rgba(0, 255, 179, 0.5)' }}
      >
        {label}
      </p>
      <p className="font-assistant text-[12px] text-white/55">{hint}</p>
      <div className="grid h-[108px] w-[108px] grid-cols-3 grid-rows-3" dir="ltr">
        {key('up', <ChevronUp size={22} />, `${label} למעלה`, 'col-start-2')}
        {key('left', <ChevronLeft size={22} />, `${label} שמאלה`, 'col-start-1 row-start-2')}
        {key('right', <ChevronRight size={22} />, `${label} ימינה`, 'col-start-3 row-start-2')}
        {key('down', <ChevronDown size={22} />, `${label} למטה`, 'row-start-3 col-start-2')}
      </div>
    </div>
  );
}

function cellBox(x: number, y: number, cell: number, size: number) {
  const offset = (cell - size) / 2;
  return {
    left: x * cell + offset,
    top: y * cell + offset,
    width: size,
    height: size,
  } as const;
}

function SnakePhone({
  role,
  match,
  onTurn,
  onRestart,
}: {
  role: SnakeRole;
  match: SnakeMatch;
  onTurn: (dir: SnakeDir) => void;
  onRestart: () => void;
}) {
  const courtRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const [cell, setCell] = useState(0);
  const myTurn = match.turn === role;

  useLayoutEffect(() => {
    const node = courtRef.current;
    if (!node) return undefined;
    const measure = () => {
      const next = Math.floor(Math.min(node.clientWidth / SNAKE_COLS, node.clientHeight / SNAKE_ROWS));
      setCell(next > 0 ? next : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const onCourtPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    swipeRef.current = { x: event.clientX, y: event.clientY };
  };

  const onCourtPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) < 18) return;
    const screenDir: SnakeDir =
      Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    onTurn(screenDir);
  };

  const boardW = cell * SNAKE_COLS;
  const boardH = cell * SNAKE_ROWS;
  const food = viewCell(role, match.food);

  return (
    <section
      dir="rtl"
      className="relative h-[812px] w-[375px] shrink-0 overflow-hidden bg-[#092125] font-assistant text-white"
      aria-label={role === 'child' ? 'מסך ילד' : 'מסך הורה'}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.ballGameBg}
          alt=""
          className="size-full object-cover"
          priority
        />
        <div
          className="absolute rounded-full"
          style={{
            left: -98,
            top: 620,
            width: 272,
            height: 272,
            background: '#00d978',
            filter: 'blur(150px)',
          }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex justify-center px-6 pt-6">
          <p
            dir="ltr"
            className="font-assistant text-[32px] font-black tabular-nums leading-none text-[#00E7A2]"
          >
            {match.score}
            <span className="text-[16px] font-semibold text-[#00E7A2]/60"> / {GAME_WIN_SCORE}</span>
          </p>
        </header>

        <div
          ref={courtRef}
          dir="ltr"
          className="relative mx-6 min-h-0 flex-1 touch-none"
          onPointerDown={onCourtPointerDown}
          onPointerUp={onCourtPointerUp}
          onPointerCancel={() => {
            swipeRef.current = null;
          }}
        >
          {cell > 0 ? (
            <div
              className="absolute left-1/2 top-1/2 overflow-visible rounded-[18px] border border-white/15"
              style={{
                width: boardW,
                height: boardH,
                transform: 'translate(-50%, -50%)',
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
                backgroundSize: `${cell}px ${cell}px`,
              }}
            >
              <div
                className="pointer-events-none absolute left-0 right-0 top-1/2 z-[1] border-t border-dashed border-white/20"
                aria-hidden
              />
              <div className="absolute z-[2]" style={cellBox(food.x, food.y, cell, cell * 0.82)}>
                <OrangeOrb size={cell * 0.82} tone="food" />
              </div>
              {(['parent', 'child'] as const).map((snakeRole) =>
                match[snakeRole].body.slice(1).map((segment, index) => {
                  const at = viewCell(role, segment);
                  return (
                    <div
                      key={`${snakeRole}-body-${index}`}
                      className="absolute z-[3]"
                      style={cellBox(at.x, at.y, cell, cell * 0.92)}
                    >
                      <OrangeOrb size={cell * 0.92} tone={snakeRole} />
                    </div>
                  );
                })
              )}
              {(['parent', 'child'] as const).map((snakeRole) => {
                const head = viewCell(role, match[snakeRole].body[0]);
                return (
                  <div
                    key={`${snakeRole}-head`}
                    className="absolute z-[4]"
                    style={cellBox(head.x, head.y, cell, cell * 0.96)}
                  >
                    <OrangeOrb size={cell * 0.96} tone={snakeRole} />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <footer className={`flex justify-center px-6 pb-5 pt-1 ${myTurn ? '' : 'opacity-40'}`}>
          <DPad
            label={ROLE_NAME[role]}
            hint={
              myTurn
                ? role === 'child'
                  ? 'התור שלך לאכול - W A S D'
                  : 'התור שלך לאכול - מקשי חצים'
                : role === 'child'
                  ? 'W A S D'
                  : 'מקשי חצים'
            }
            dir={worldDirToScreen(role, match[role].queued)}
            onDir={onTurn}
          />
        </footer>
      </div>

      {match.phase !== 'playing' ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#092125]/75 px-6">
          <div className="flex w-full max-w-[327px] flex-col items-center gap-4 rounded-[22px] border border-white/15 bg-[#092125]/80 px-5 py-6 text-center backdrop-blur-md">
            <p className="font-assistant text-[16px] text-white/80">
              {match.phase === 'won'
                ? 'אספתם את האוכל ביחד'
                : `${ROLE_NAME[match.crashedRole ?? 'parent']} ${CRASH_COPY[match.crash ?? 'wall']}`}
            </p>
            <p className="font-assistant text-[28px] font-black leading-tight text-white">
              {match.phase === 'won' ? `${GAME_WIN_SCORE} נקודות - כל הכבוד!` : 'לא נורא, נסו שוב'}
            </p>
            <button type="button" className={BALL_GAME_SLIDER_CTA_CLASS} onClick={onRestart}>
              יאללה, מנסים שוב!
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function SnakeTestScreen() {
  const [scale, setScale] = useState(1);
  const [match, setMatch] = useState<SnakeMatch>(() => createSnakeMatch());
  const totalW = DESIGN_W * 2 + PHONE_GAP;

  useLayoutEffect(() => {
    const fit = () => {
      const width = window.visualViewport?.width ?? window.innerWidth;
      const height = window.visualViewport?.height ?? window.innerHeight;
      setScale(Math.min(width / totalW, height / DESIGN_H));
    };
    fit();
    window.addEventListener('resize', fit);
    window.visualViewport?.addEventListener('resize', fit);
    return () => {
      window.removeEventListener('resize', fit);
      window.visualViewport?.removeEventListener('resize', fit);
    };
  }, [totalW]);

  const turn = useCallback((role: SnakeRole, screenDir: SnakeDir) => {
    setMatch((current) => queueTurn(current, role, screenDirToWorld(role, screenDir)));
  }, []);

  const restart = useCallback(() => {
    setMatch(createSnakeMatch());
  }, []);

  useEffect(() => {
    if (match.phase !== 'playing') return undefined;
    const id = window.setInterval(() => {
      setMatch((current) => stepSnake(current));
    }, SNAKE_TICK_MS);
    return () => window.clearInterval(id);
  }, [match.phase]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const child: Partial<Record<string, SnakeDir>> = {
        KeyW: 'up',
        KeyA: 'left',
        KeyS: 'down',
        KeyD: 'right',
      };
      const parent: Partial<Record<string, SnakeDir>> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };
      const childDir = child[event.code];
      const parentDir = parent[event.code];
      if (!childDir && !parentDir) return;
      event.preventDefault();
      if (childDir) turn('child', childDir);
      if (parentDir) turn('parent', parentDir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn]);

  return (
    <div
      dir="ltr"
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-[#041416]"
    >
      <div className="relative shrink-0" style={{ width: totalW * scale, height: DESIGN_H * scale }}>
        <div
          dir="rtl"
          className="absolute left-0 top-0 flex"
          style={{
            width: totalW,
            height: DESIGN_H,
            gap: PHONE_GAP,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          aria-label="משחק נחשים לבדיקה"
        >
          <SnakePhone
            role="child"
            match={match}
            onTurn={(dir) => turn('child', dir)}
            onRestart={restart}
          />
          <SnakePhone
            role="parent"
            match={match}
            onTurn={(dir) => turn('parent', dir)}
            onRestart={restart}
          />
        </div>
      </div>
    </div>
  );
}
