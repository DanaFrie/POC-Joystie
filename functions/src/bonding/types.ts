/** Parent is with child now vs. wants a nudge when they will be together */
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
  /** Parent-chosen time to nudge them (remind_later only) */
  shareReminderAt?: string;
  shareReminderSentAt?: string | null;
}
