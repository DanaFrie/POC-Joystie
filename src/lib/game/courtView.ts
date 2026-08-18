import type { GamePlayerRole } from '@/types/game';
import {
  PHYSICS_CHILD_PADDLE_CENTER_Y,
  PHYSICS_PARENT_PADDLE_CENTER_Y,
} from '@/lib/game/ballGameCourt';

/** Map shared court Y to this player's screen (own paddle always at bottom). */
export function courtYForViewer(y: number, role: GamePlayerRole): number {
  return role === 'child' ? 1 - y : y;
}

export function pointerYToCourt(
  clientY: number,
  rect: DOMRect,
  role: GamePlayerRole
): number {
  const normalized = (clientY - rect.top) / rect.height;
  return role === 'child' ? 1 - normalized : normalized;
}

export function pointerXToCourt(clientX: number, rect: DOMRect): number {
  return (clientX - rect.left) / rect.width;
}

export function localPaddleWorldY(role: GamePlayerRole): number {
  return role === 'parent'
    ? PHYSICS_PARENT_PADDLE_CENTER_Y
    : PHYSICS_CHILD_PADDLE_CENTER_Y;
}

export function rivalPaddleWorldY(role: GamePlayerRole): number {
  return role === 'parent'
    ? PHYSICS_CHILD_PADDLE_CENTER_Y
    : PHYSICS_PARENT_PADDLE_CENTER_Y;
}
