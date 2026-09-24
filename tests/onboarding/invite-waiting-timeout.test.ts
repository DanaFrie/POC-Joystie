/**
 * After 3 min on link/dragon waiting, parent stays on copy-invite
 * even if pairing stage is already child_funnel.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parentResumeAction } from '@/lib/onboarding/pairingResume';
import { SIGNUP_CHILD_INVITE_WAITING_STALL_MS } from '@/constants/signup-child-invite-layout';

describe('invite waiting stall (3 min)', () => {
  it('is a 3 minute stall per waiting variant', () => {
    assert.equal(SIGNUP_CHILD_INVITE_WAITING_STALL_MS, 180_000);
  });

  it('sends share → waiting while child funnel is live (no timeout)', () => {
    const action = parentResumeAction('child_funnel', '/onboarding', 'childInviteShare', {
      inviteWaitingTimedOut: false,
    });
    assert.deepEqual(action, { type: 'step', step: 'childInviteWaiting' });
  });

  it('keeps copy-invite after a waiting timeout', () => {
    const action = parentResumeAction('child_funnel', '/onboarding', 'childInviteShare', {
      inviteWaitingTimedOut: true,
    });
    assert.deepEqual(action, { type: 'stay' });
  });

  it('does not leave the waiting screen before timeout', () => {
    const action = parentResumeAction('child_funnel', '/onboarding', 'childInviteWaiting', {
      inviteWaitingTimedOut: true,
    });
    assert.deepEqual(action, { type: 'stay' });
  });
});
