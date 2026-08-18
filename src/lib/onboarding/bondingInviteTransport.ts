import { isLocalDevHost } from '@/utils/is-local-dev-host';

/**
 * localhost and intgr App Hosting: bonding/game callables are often missing
 * (CORS on preflight, as with joystie-poc-prod from localhost). Route invites,
 * milestones, and ball-game rooms through RTDB instead.
 */
export function useRtdbBondingInvites(): boolean {
  if (isLocalDevHost()) return true;
  return process.env.NEXT_PUBLIC_ENV === 'intgr';
}
