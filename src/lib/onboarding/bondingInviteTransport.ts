/**
 * Bonding invites + ball-game rooms go through RTDB in every environment.
 *
 * Production `recordBondingInvite` / game callables are often undeployed, not
 * publicly invokable (browser CORS / failed-to-fetch on joystie.com), or run
 * as a SA that cannot write Firestore. Intgr already used RTDB successfully.
 */
export function useRtdbBondingInvites(): boolean {
  return true;
}
