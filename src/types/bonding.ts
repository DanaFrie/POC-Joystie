/** Parent–child bonding invite (v0.3) — Firestore `bonding_invites` */

export type BondingShareMode = 'together_now' | 'remind_later';

export type BondingInviteStatus =
  | 'pending_share'
  | 'remind_scheduled'
  | 'shared'
  | 'child_opened'
  | 'completed';

export interface FirestoreBondingInvite {
  id: string;
  parentId: string;
  childId?: string;
  challengeId?: string;
  childUrl: string;
  whatsappShareUrl: string;
  shareMode: BondingShareMode;
  status: BondingInviteStatus;
  createdAt: string;
  updatedAt: string;
  whatsappSharedAt?: string;
  childLinkOpenedAt?: string;
  /** Parent-chosen time to remind them to share when together */
  shareReminderAt?: string;
  shareReminderSentAt?: string;
}
