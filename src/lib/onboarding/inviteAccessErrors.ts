import { FirebaseError } from 'firebase/app';

export const INVITE_COMPLETED_ERROR_MESSAGE = 'Invite completed';
export const INVITE_EXPIRED_ERROR_MESSAGE = 'Invite expired';

export type ChildInviteFailureStatus = 'expired' | 'consumed' | 'invalid';

export function inviteAccessFailureStatus(error: unknown): ChildInviteFailureStatus {
  const code = error instanceof FirebaseError ? error.code : '';
  const message = error instanceof Error ? error.message : '';
  if (code.includes('failed-precondition')) {
    if (/completed|consumed/i.test(message)) return 'consumed';
    return 'expired';
  }
  return 'invalid';
}
