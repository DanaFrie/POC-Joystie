import { isLocalDevHost } from '@/utils/is-local-dev-host';

/**
 * intgr + localhost: bonding/game callables are often undeployed (CORS on preflight).
 * Route invite, game-room resolve, milestones, and ball-game rooms through RTDB instead.
 */
export function useRtdbBondingInvites(): boolean {
  if (isLocalDevHost()) return true;
  return process.env.NEXT_PUBLIC_ENV === 'intgr';
}
