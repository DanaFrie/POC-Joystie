import type { GamePlayerRole } from '@/types/game';
import { CHILD_PADDLE_Y, PARENT_PADDLE_Y } from '@/lib/game/physics';

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
  return role === 'parent' ? PARENT_PADDLE_Y : CHILD_PADDLE_Y;
}

export function rivalPaddleWorldY(role: GamePlayerRole): number {
  return role === 'parent' ? CHILD_PADDLE_Y : PARENT_PADDLE_Y;
}
