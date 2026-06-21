/** Parent–child bonding invite (v0.3) — Firestore `bonding_invites` */

export type BondingInviteStatus =
  | 'pending_share'
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
  status: BondingInviteStatus;
  createdAt: string;
  updatedAt: string;
  whatsappSharedAt?: string;
  childLinkOpenedAt?: string;
}
