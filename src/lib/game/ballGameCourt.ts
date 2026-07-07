import {
  CHILD_BALL_GAME,
  PARENT_BALL_GAME,
} from '@/constants/child-onboarding-layout';

/** Figma paddle — 92×11 on 327px-wide play lane. */
export const BALL_GAME_PADDLE_WIDTH_PX = 92;
export const BALL_GAME_PADDLE_HEIGHT_PX = 11;

/** In-court play ball — matches `BallGameCourtBall` rendered size. */
export const BALL_GAME_COURT_BALL_SIZE = 44;

export type BallGameLayout = typeof CHILD_BALL_GAME | typeof PARENT_BALL_GAME;

/** Runtime layout with Y positions/heights scaled to visible canvas (812 @ full). */
export type ScaledBallGameLayout = {
  bg: { left: number; top: number; width: number; height: number };
  parentLabel: { top: number; left: number; width: number };
  childLabel: { top: number };
  centerLine: { top: number; width: number };
  childPaddle: { top: number; left: number; width: number; height: number };
  parentPaddle: { top: number; left: number; width: number; height: number };
  status: { top: number; width: number };
  court: { top: number; left: number; width: number; height: number };
  fireball: { width: number; height: number };
  scoreRing: { top: number; left: number; size: number };
  score: { top: number; width: number };
};

/** Scale Figma Y coords + vertical sizes for fitViewport ball-game (child + parent). */
export function scaleBallGameLayout(
  layout: BallGameLayout,
  scaleY: (figmaY: number) => number
): ScaledBallGameLayout {
  return {
    bg: {
      left: layout.bg.left,
      top: scaleY(layout.bg.top),
      width: layout.bg.width,
      height: scaleY(layout.bg.height),
    },
    parentLabel: {
      top: scaleY(layout.parentLabel.top),
      left: layout.parentLabel.left,
      width: layout.parentLabel.width,
    },
    childLabel: { top: scaleY(layout.childLabel.top) },
    centerLine: {
      top: scaleY(layout.centerLine.top),
      width: layout.centerLine.width,
    },
    childPaddle: {
      top: scaleY(layout.childPaddle.top),
      left: layout.childPaddle.left,
      width: layout.childPaddle.width,
      height: scaleY(layout.childPaddle.height),
    },
    parentPaddle: {
      top: scaleY(layout.parentPaddle.top),
      left: layout.parentPaddle.left,
      width: layout.parentPaddle.width,
      height: scaleY(layout.parentPaddle.height),
    },
    status: {
      top: scaleY(layout.status.top),
      width: layout.status.width,
    },
    court: {
      top: scaleY(layout.court.top),
      left: layout.court.left,
      width: layout.court.width,
      height: scaleY(layout.court.height),
    },
    fireball: {
      width: scaleY(layout.fireball.width),
      height: scaleY(layout.fireball.height),
    },
    scoreRing: {
      top: scaleY(layout.scoreRing.top),
      left: layout.scoreRing.left,
      size: scaleY(layout.scoreRing.size),
    },
    score: {
      top: scaleY(layout.score.top),
      width: layout.score.width,
    },
  };
}

export function ballGamePlayCourt(layout: BallGameLayout | ScaledBallGameLayout) {
  const innerTop = Math.min(
    layout.parentPaddle.top + layout.parentPaddle.height,
    layout.childPaddle.top + layout.childPaddle.height
  );
  const innerBottom = Math.max(layout.parentPaddle.top, layout.childPaddle.top);
  return {
    left: layout.court.left,
    top: innerTop,
    width: layout.court.width,
    height: innerBottom - innerTop,
  };
}

export function ballGamePaddleWidthNorm(layout: BallGameLayout | ScaledBallGameLayout): number {
  return BALL_GAME_PADDLE_WIDTH_PX / ballGamePlayCourt(layout).width;
}

function clampPaddleCenterX(x: number, paddleWidth: number): number {
  const half = paddleWidth / 2;
  return Math.min(1 - half, Math.max(half, x));
}

export function paddlePixelRect(
  layout: BallGameLayout | ScaledBallGameLayout,
  paddleRole: 'parent' | 'child',
  centerXNorm: number,
  paddleWidthNorm: number
) {
  const cfg = paddleRole === 'parent' ? layout.parentPaddle : layout.childPaddle;
  const court = ballGamePlayCourt(layout);
  const widthPx = court.width * paddleWidthNorm;
  const x = clampPaddleCenterX(centerXNorm, paddleWidthNorm);
  return {
    left: court.left + x * court.width - widthPx / 2,
    top: cfg.top,
    width: widthPx,
    height: cfg.height,
  };
}

export function ballRadiusNorm(layout: BallGameLayout | ScaledBallGameLayout) {
  const court = ballGamePlayCourt(layout);
  const half = BALL_GAME_COURT_BALL_SIZE / 2;
  return {
    x: half / court.width,
    y: half / court.height,
  };
}

/** Shared-court collision line — parent: paddle top; child: paddle bottom. */
export function paddleSurfaceY(
  layout: BallGameLayout | ScaledBallGameLayout,
  role: 'parent' | 'child'
): number {
  const court = ballGamePlayCourt(layout);
  const cfg = role === 'parent' ? layout.parentPaddle : layout.childPaddle;
  const surfacePx =
    role === 'parent' ? cfg.top : cfg.top + cfg.height;
  return (surfacePx - court.top) / court.height;
}

export function paddleCenterY(
  layout: BallGameLayout | ScaledBallGameLayout,
  role: 'parent' | 'child'
): number {
  const court = ballGamePlayCourt(layout);
  const cfg = role === 'parent' ? layout.parentPaddle : layout.childPaddle;
  return (cfg.top + cfg.height / 2 - court.top) / court.height;
}

/** Layout-aligned physics constants (shared court: parent bottom, child top). */
const PHYSICS_LAYOUT = PARENT_BALL_GAME;
const _ballRadii = ballRadiusNorm(PHYSICS_LAYOUT);

export const PHYSICS_BALL_RADIUS_X = _ballRadii.x;
export const PHYSICS_BALL_RADIUS_Y = _ballRadii.y;
export const PHYSICS_PARENT_PADDLE_SURFACE_Y = paddleSurfaceY(
  PHYSICS_LAYOUT,
  'parent'
);
export const PHYSICS_CHILD_PADDLE_SURFACE_Y = paddleSurfaceY(
  PHYSICS_LAYOUT,
  'child'
);
export const PHYSICS_PARENT_PADDLE_CENTER_Y = paddleCenterY(
  PHYSICS_LAYOUT,
  'parent'
);
export const PHYSICS_CHILD_PADDLE_CENTER_Y = paddleCenterY(
  PHYSICS_LAYOUT,
  'child'
);

/** Paddle thickness in normalized play-lane Y (shared physics court). */
export const PHYSICS_PADDLE_HEIGHT_NORM =
  BALL_GAME_PADDLE_HEIGHT_PX / ballGamePlayCourt(PHYSICS_LAYOUT).height;
