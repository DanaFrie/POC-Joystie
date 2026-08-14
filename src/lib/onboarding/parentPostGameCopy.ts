/** Gender-aware Hebrew copy — parent post-game funnel on `/game`. */

/** Post-win screen 1 (4s) — cooperation intro. */
export function parentPostWinCoopHeadline(
  childName: string,
  parentGender: 'female' | 'male'
): string {
  const you = parentGender === 'female' ? 'ואת' : 'ואתה';
  return `מעולה!\n${childName} ${you} מתחילים לשתף פעולה דרך המסך`;
}

/** Post-win screen 2 (7s) — walls / together message. */
export function parentPostWinWallsHeadline(childName: string): string {
  return `המשחק נועד כדי לשבור חומות בינך לבין ${childName} בכל מה שקשור למסך, ולהבין שאתם ביחד בזה`;
}

export function parentWaitingChildChangeHeadline(
  childName: string,
  gender: 'boy' | 'girl'
): string {
  if (gender === 'girl') {
    return `מחכים ש${childName} תבחר את השינוי הראשון שהיא רוצה ליישם`;
  }
  return `מחכים ש${childName} יבחר את השינוי הראשון שהוא רוצה ליישם`;
}

export function parentWaitingAdditionalChangeApprovalHeadline(
  childName: string,
  gender: 'boy' | 'girl'
): string {
  return gender === 'girl'
    ? `מחכים ש${childName} תגיב לשינוי הנוסף`
    : `מחכים ש${childName} יגיב לשינוי הנוסף`;
}

export const PARENT_WAITING_DORI_SELFIE_HEADLINE = 'מחכים לסלפי עם דורי';

/** Figma 13656:4329 — child change to confirm. */
export function parentChildDecidedChangeHeadline(
  childName: string,
  gender: 'boy' | 'girl'
): string {
  return gender === 'girl'
    ? `${childName} החליטה על שינוי ראשון!`
    : `${childName} החליט על שינוי ראשון!`;
}

export function parentChildChangeCardLabel(
  childName: string,
  gender: 'boy' | 'girl'
): string {
  return gender === 'girl'
    ? `השינוי ש${childName} בחרה`
    : `השינוי ש${childName} בחר`;
}

export const PARENT_REVIEW_APPROVE_LABEL = 'מעולה, אני מאשר!';
export const PARENT_REVIEW_SUGGEST_MORE_DIVIDER = 'רוצה להציע שינוי משלך?';
export const PARENT_REVIEW_SUGGEST_MORE_LABEL = 'אני מאשר ורוצה להציע שינוי נוסף';

/** Figma 13615:10486 — parent additional change choice. */
export function parentAdditionalChangeTitle(childName: string): string {
  return `שינוי נוסף שאפשר להציע ל${childName}`;
}

export const parentAdditionalChangeSubtitle = 'אפשר לבחור שינוי נוסף אחד';

export function parentSendChangeToChildLabel(childName: string): string {
  return `שליחה ל${childName}`;
}

export const PARENT_ADDITIONAL_CHANGE_OR = 'או';
export const PARENT_CUSTOM_CHANGE_LABEL = 'שינוי משלכם';
export const PARENT_CUSTOM_CHANGE_PLACEHOLDER =
  'זה המקום לפרט על השינוי (עד 15 מילים)';
