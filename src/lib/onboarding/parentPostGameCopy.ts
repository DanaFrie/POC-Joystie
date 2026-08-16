/** Gender-aware Hebrew copy — parent post-game funnel on `/game`. */

type ParentGender = 'female' | 'male';
type ChildGender = 'boy' | 'girl';

/** Both female → feminine plural; otherwise masculine plural (incl. mixed). */
function bothFemale(parentGender: ParentGender, childGender: ChildGender): boolean {
  return parentGender === 'female' && childGender === 'girl';
}

/** Post-win screen 1 (4s) — cooperation intro. */
export function parentPostWinCoopHeadline(
  childName: string,
  parentGender: ParentGender,
  childGender: ChildGender = 'boy'
): string {
  const you = parentGender === 'female' ? 'ואת' : 'ואתה';
  const start = bothFemale(parentGender, childGender) ? 'מתחילות' : 'מתחילים';
  return `מעולה!\n${childName} ${you} ${start} לשתף פעולה דרך המסך`;
}

/** Post-win screen 2 (7s) — walls / together message. */
export function parentPostWinWallsHeadline(
  childName: string,
  parentGender: ParentGender = 'male',
  childGender: ChildGender = 'boy'
): string {
  const youPlural = bothFemale(parentGender, childGender) ? 'אתן' : 'אתם';
  return `המשחק נועד כדי לשבור חומות בינך לבין ${childName} בכל מה שקשור למסך, ולהבין ש${youPlural} ביחד בזה`;
}

export function parentWaitingChildChangeHeadline(
  childName: string,
  gender: ChildGender
): string {
  if (gender === 'girl') {
    return `מחכים ש${childName} תבחר את השינוי הראשון שהיא רוצה ליישם`;
  }
  return `מחכים ש${childName} יבחר את השינוי הראשון שהוא רוצה ליישם`;
}

export function parentWaitingAdditionalChangeApprovalHeadline(
  childName: string,
  gender: ChildGender
): string {
  return gender === 'girl'
    ? `מחכים ש${childName} תגיב לשינוי הנוסף`
    : `מחכים ש${childName} יגיב לשינוי הנוסף`;
}

export const PARENT_WAITING_DORI_SELFIE_HEADLINE = 'מחכים לסלפי עם דורי';

/** Figma 13656:4329 — child change to confirm. */
export function parentChildDecidedChangeHeadline(
  childName: string,
  gender: ChildGender
): string {
  return gender === 'girl'
    ? `${childName} החליטה על שינוי ראשון!`
    : `${childName} החליט על שינוי ראשון!`;
}

export function parentChildChangeCardLabel(
  childName: string,
  gender: ChildGender
): string {
  return gender === 'girl'
    ? `השינוי ש${childName} בחרה`
    : `השינוי ש${childName} בחר`;
}

export function parentReviewApproveLabel(parentGender: ParentGender = 'male'): string {
  return parentGender === 'female' ? 'מעולה, אני מאשרת!' : 'מעולה, אני מאשר!';
}

export function parentReviewSuggestMoreLabel(parentGender: ParentGender = 'male'): string {
  return parentGender === 'female'
    ? 'אני מאשרת ורוצה להציע שינוי נוסף'
    : 'אני מאשר ורוצה להציע שינוי נוסף';
}

/** @deprecated Use parentReviewApproveLabel(parentGender). */
export const PARENT_REVIEW_APPROVE_LABEL = 'מעולה, אני מאשר!';
export const PARENT_REVIEW_SUGGEST_MORE_DIVIDER = 'רוצה להציע שינוי משלך?';
/** @deprecated Use parentReviewSuggestMoreLabel(parentGender). */
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
