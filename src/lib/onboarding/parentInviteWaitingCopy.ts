import type { SignupChildInviteWaitingVariant } from '@/constants/signup-child-invite-layout';

/** Parent invite waiting headlines — single copy source for each variant. */
export function parentInviteWaitingHeadline(
  childName: string,
  variant: SignupChildInviteWaitingVariant,
  childGender: 'boy' | 'girl' = 'boy'
): string {
  const isGirl = childGender === 'girl';
  if (variant === 'companionPick') {
    return isGirl
      ? `מחכים ש${childName} תעיר את דורי הדרקון`
      : `מחכים ש${childName} יעיר את דורי הדרקון`;
  }
  return isGirl
    ? `מחכים ש${childName} תפתח את הלינק`
    : `מחכים ש${childName} יפתח את הלינק`;
}

export function parentInviteWaitingAriaLabel(
  variant: SignupChildInviteWaitingVariant
): string {
  return variant === 'companionPick'
    ? 'ממתינים שהילד/ה יעיר/תעיר את דורי הדרקון'
    : 'ממתינים לפתיחת הלינק';
}

export function inviteWaitingVariantFromProgress(linkOpened: boolean): SignupChildInviteWaitingVariant {
  return linkOpened ? 'companionPick' : 'linkOpen';
}
