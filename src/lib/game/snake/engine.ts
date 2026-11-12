import { GAME_WIN_SCORE } from '@/constants/game';

/** Shared test-court grid. One match drives both snakes on the same tick. */
export const SNAKE_COLS = 15;
export const SNAKE_ROWS = 17;
export const SNAKE_TICK_MS = 180;

export type SnakeDir = 'up' | 'down' | 'left' | 'right';
export type SnakeRole = 'parent' | 'child';
export type SnakeCell = { x: number; y: number };
export type SnakeCrash = 'wall' | 'self';
export type SnakePhase = 'playing' | 'crashed' | 'won';

export type SnakeBody = {
  /** Head is index 0. */
  body: SnakeCell[];
  dir: SnakeDir;
  queued: SnakeDir;
  /** Stays put until this side picks a direction, so an idle snake does not hit the wall. */
  ready: boolean;
};

export type SnakeMatch = {
  parent: SnakeBody;
  child: SnakeBody;
  food: SnakeCell;
  /** Shared points. Neither snake owns the score. */
  score: number;
  /** Whose snake is moving until it eats. Parent eats first, then the child, and so on. */
  turn: SnakeRole;
  phase: SnakePhase;
  crashedRole: SnakeRole | null;
  crash: SnakeCrash | null;
};

const DELTA: Record<SnakeDir, SnakeCell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<SnakeDir, SnakeDir> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

function same(a: SnakeCell, b: SnakeCell): boolean {
  return a.x === b.x && a.y === b.y;
}

function keyOf(cell: SnakeCell): string {
  return `${cell.x},${cell.y}`;
}

function stepCell(cell: SnakeCell, dir: SnakeDir): SnakeCell {
  const d = DELTA[dir];
  return { x: cell.x + d.x, y: cell.y + d.y };
}

function inCourt(cell: SnakeCell): boolean {
  return cell.x >= 0 && cell.y >= 0 && cell.x < SNAKE_COLS && cell.y < SNAKE_ROWS;
}

function resolveDir(dir: SnakeDir, queued: SnakeDir): SnakeDir {
  if (queued === OPPOSITE[dir]) return dir;
  return queued;
}

function buildSnake(head: SnakeCell, dir: SnakeDir, length: number): SnakeBody {
  const body: SnakeCell[] = [];
  let cell = head;
  const back = OPPOSITE[dir];
  for (let i = 0; i < length; i += 1) {
    body.push(cell);
    cell = stepCell(cell, back);
  }
  return { body, dir, queued: dir, ready: false };
}

function occupiedKeys(parent: SnakeCell[], child: SnakeCell[]): Set<string> {
  const taken = new Set<string>();
  for (const cell of parent) taken.add(keyOf(cell));
  for (const cell of child) taken.add(keyOf(cell));
  return taken;
}

function openCells(taken: Set<string>): SnakeCell[] {
  const cells: SnakeCell[] = [];
  for (let y = 0; y < SNAKE_ROWS; y += 1) {
    for (let x = 0; x < SNAKE_COLS; x += 1) {
      if (!taken.has(`${x},${y}`)) cells.push({ x, y });
    }
  }
  return cells;
}

/** Random empty cell, preferring a spot that is not on top of either head. */
export function spawnFood(parent: SnakeCell[], child: SnakeCell[]): SnakeCell | null {
  const open = openCells(occupiedKeys(parent, child));
  if (open.length === 0) return null;
  const heads = [parent[0], child[0]].filter((cell): cell is SnakeCell => Boolean(cell));
  const calm = open.filter((cell) =>
    heads.every((head) => Math.abs(head.x - cell.x) + Math.abs(head.y - cell.y) > 2)
  );
  const pool = calm.length > 0 ? calm : open;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function createSnakeMatch(): SnakeMatch {
  const parent = buildSnake({ x: 4, y: SNAKE_ROWS - 3 }, 'up', 3);
  const child = buildSnake({ x: 10, y: 2 }, 'down', 3);
  const food = spawnFood(parent.body, child.body) ?? { x: 7, y: 8 };
  return {
    parent,
    child,
    food,
    score: 0,
    turn: 'parent',
    phase: 'playing',
    crashedRole: null,
    crash: null,
  };
}

export function queueTurn(match: SnakeMatch, role: SnakeRole, dir: SnakeDir): SnakeMatch {
  if (match.phase !== 'playing') return match;
  const snake = match[role];
  if (!snake.ready) {
    if (dir === OPPOSITE[snake.dir]) return match;
    return { ...match, [role]: { ...snake, dir, queued: dir, ready: true } };
  }
  if (dir === OPPOSITE[snake.dir]) return match;
  if (snake.queued === dir) return match;
  return { ...match, [role]: { ...snake, queued: dir } };
}

type Intent = {
  dir: SnakeDir;
  next: SnakeCell;
  eat: boolean;
  crash: SnakeCrash | null;
};

function intentFor(snake: SnakeBody, food: SnakeCell): Intent {
  const dir = resolveDir(snake.dir, snake.queued);
  const next = stepCell(snake.body[0], dir);
  if (!inCourt(next)) {
    return { dir, next, eat: false, crash: 'wall' };
  }
  const eat = same(next, food);
  const solid = eat ? snake.body : snake.body.slice(0, -1);
  if (solid.some((cell) => same(cell, next))) {
    return { dir, next, eat: false, crash: 'self' };
  }
  return { dir, next, eat, crash: null };
}

function otherRole(role: SnakeRole): SnakeRole {
  return role === 'parent' ? 'child' : 'parent';
}

/**
 * The snake whose turn it is keeps moving until it eats once.
 * Eating passes the turn to the other snake and adds one shared point.
 * A step onto the other snake is skipped so the bodies never overlap.
 * Walls and a snake's own body end the round.
 */
export function stepSnake(match: SnakeMatch): SnakeMatch {
  if (match.phase !== 'playing') return match;
  const role = match.turn;
  const snake = match[role];
  if (!snake.ready) return match;

  const intent = intentFor(snake, match.food);
  if (intent.crash) {
    return {
      ...match,
      phase: 'crashed',
      crashedRole: role,
      crash: intent.crash,
    };
  }

  const other = match[otherRole(role)];
  if (other.body.some((cell) => same(cell, intent.next))) {
    return match;
  }

  const body = [intent.next, ...snake.body];
  let food = match.food;
  let score = match.score;
  let phase: SnakePhase = match.phase;
  if (intent.eat) {
    score += 1;
    const parentBody = role === 'parent' ? body : match.parent.body;
    const childBody = role === 'child' ? body : match.child.body;
    const spawned = spawnFood(parentBody, childBody);
    if (!spawned || score >= GAME_WIN_SCORE) {
      phase = 'won';
      if (spawned) food = spawned;
    } else {
      food = spawned;
    }
  } else {
    body.pop();
  }

  return {
    ...match,
    [role]: { body, dir: intent.dir, queued: intent.dir, ready: true },
    food,
    score,
    phase,
    turn: intent.eat && phase !== 'won' ? otherRole(role) : role,
    crashedRole: null,
    crash: null,
  };
}
