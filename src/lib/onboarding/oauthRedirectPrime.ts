/**
 * Capture OAuth redirect result as soon as Auth is initialized.
 * Import this module once on routes that handle Google/Apple redirect return.
 */
import { getAuthInstance } from '@/lib/firebase';
import { primeOAuthRedirectCapture } from '@/utils/auth-oauth';

if (typeof window !== 'undefined') {
  void (async () => {
    await getAuthInstance();
    primeOAuthRedirectCapture();
  })();
}
