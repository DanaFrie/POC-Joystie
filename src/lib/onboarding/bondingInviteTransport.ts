import { isLocalDevHost } from '@/utils/is-local-dev-host';

/**
 * Use RTDB `onboardingBondingInvites` instead of bonding callables.
 * intgr App Hosting hits CORS when callables are not deployed; localhost same.
 */
export function useRtdbBondingInvites(): boolean {
  if (isLocalDevHost()) return true;
  return process.env.NEXT_PUBLIC_ENV === 'intgr';
}
