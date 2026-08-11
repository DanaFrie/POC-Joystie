/** Child post-game — castle change selection (Figma 13702:10060 / 13702:9497). */

export const CHILD_CASTLE_CHANGE_CARD_LABEL = 'השינוי';

export const CHILD_CASTLE_CHANGE_CONFIRM_READY_LABEL = 'כן, אני מוכן!';

export function childCastleChangeConfirmReadyLabel(childGender: 'boy' | 'girl'): string {
  return childGender === 'girl' ? 'כן, אני מוכנה!' : CHILD_CASTLE_CHANGE_CONFIRM_READY_LABEL;
}

export const CHILD_CASTLE_CHANGE_CONFIRM_DECLINE_LABEL = 'בעצם לא';

export function childCastleChangeConfirmDeclineLabel(): string {
  return CHILD_CASTLE_CHANGE_CONFIRM_DECLINE_LABEL;
}

export const CHILD_CASTLE_CHANGE_CELEBRATION_TITLE = 'טוב שלך!';

export const CHILD_CASTLE_CHANGE_CELEBRATION_BODY =
  'יש לי הרגשה שיחד נוכל לחסוך לא מעט כסף!';

/** @deprecated Confirm overlay no longer uses a separate headline. */
export function childCastleChangeConfirmHeadline(childName: string): string {
  return `${childName}, זה השינוי שבחרת!`;
}

/** @deprecated Celebration uses CHILD_CASTLE_CHANGE_CELEBRATION_TITLE. */
export function childCastleChangeCelebrationHeadline(childName: string): string {
  return `אליפות, ${childName}!`;
}

/** Figma 13466:18573 — king celebration after first change. */
export function childChangeKingHeadline(
  childName: string,
  childGender: 'boy' | 'girl'
): string {
  return childGender === 'girl'
    ? `${childName}, אמרו לך כבר שאת מלכה?`
    : `${childName}, אמרו לך כבר שאתה קינג?`;
}

export const CHILD_CHANGE_KING_BODY =
  'מצאת שינוי חיובי שאתה מוכן להתחיל ליישם בחיים שלך!';

export function childChangeKingBody(childGender: 'boy' | 'girl'): string {
  return childGender === 'girl'
    ? 'מצאת שינוי חיובי שאת מוכנה להתחיל ליישם בחיים שלך!'
    : CHILD_CHANGE_KING_BODY;
}

/** Waiting for parent to approve child's change — Figma 13466 waiting. */
export function childWaitingParentChangeApproval(
  parentGender?: 'female' | 'male' | null
): string {
  return parentGender === 'female'
    ? 'מחכים שאמא תאשר את השינוי'
    : 'מחכים שאבא יאשר את השינוי';
}

/** Figma 13674:16154 */
export function childParentSuggestedChangeHeadline(
  parentGender?: 'female' | 'male' | null
): string {
  return parentGender === 'female'
    ? 'אמא הציעה שינוי נוסף (ומעניין):'
    : 'אבא הציע שינוי נוסף (ומעניין):';
}

export function childParentSuggestedChangeCardLabel(
  parentGender?: 'female' | 'male' | null
): string {
  return parentGender === 'female' ? 'השינוי שאמא הציעה' : 'השינוי שאבא הציע';
}

export const CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_TITLE = 'אליפות, יש חוזה!';

export const CHILD_PARENT_SUGGESTED_ACCEPT_CELEBRATION_SUBTITLE = 'אתם צוות מנצח.';

export const CHILD_PARENT_SUGGESTED_ACCEPT_LABEL = 'כן, אני מוכן לנסות!';

export function childParentSuggestedAcceptLabel(childGender: 'boy' | 'girl'): string {
  return childGender === 'girl' ? 'כן, אני מוכנה לנסות!' : CHILD_PARENT_SUGGESTED_ACCEPT_LABEL;
}

export function childParentSuggestedDeclineLabel(
  parentGender?: 'female' | 'male' | null
): string {
  return parentGender === 'female'
    ? 'אני לא בטוחה, אשמח לשינוי אחר מאמא'
    : 'אני לא בטוח, אשמח לשינוי אחר מאבא';
}

export function childParentSuggestedDeclineLabelForChild(
  childGender: 'boy' | 'girl',
  parentGender?: 'female' | 'male' | null
): string {
  if (childGender === 'girl') {
    return parentGender === 'female'
      ? 'אני לא בטוחה, אשמח לשינוי אחר מאמא'
      : 'אני לא בטוחה, אשמח לשינוי אחר מאבא';
  }
  return childParentSuggestedDeclineLabel(parentGender);
}

export const CHILD_SHARED_PHOTO_PREPARING_SUBTITLE = 'מכינים לכם תמונה משותפת...';

export const CHILD_CONTRACT_CONTINUE_LABEL = 'המשך למשימה האחרונה';

export const CHILD_MISSION_THREE_BADGE = 'משימה מס׳ 3';

export const CHILD_MISSION_THREE_HEADLINE_LINE1 = 'משימה אחרונה:';

export const CHILD_MISSION_THREE_HEADLINE_LINE2 = 'סלפי עם דורי!';

export const CHILD_MISSION_THREE_CAMERA_DISCLAIMER =
  'לחיצה על הכפתור מאשרת גישה ושימוש במצלמה';

export const CHILD_SELFIE_PATTERN_CAPTURE_LABEL = 'צילום!';

export const CHILD_SELFIE_CAMERA_DENIED_HEADLINE = 'לא אישרת גישה למצלמה';

export const CHILD_SELFIE_CAMERA_DENIED_TITLE = 'מעדיפים בלי תמונה?';

export const CHILD_SELFIE_CAMERA_DECLINE_LABEL = 'אני מעדיף לא להצטלם';

export const CHILD_SELFIE_CAMERA_RETRY_LABEL = 'אני כן רוצה להצטלם';

export const CHILD_SELFIE_CAMERA_DENIED_DISCLAIMER = 'יש לאשר גישה למצלמה';

export const CHILD_SHARED_PHOTO_LIKED_LABEL = 'אהבנו את התמונה!';

export const CHILD_SHARED_PHOTO_RETAKE_LABEL = 'רוצים לצלם תמונה חדשה';

export const CHILD_SHARED_PHOTO_SKIP_LABEL = 'מעדיפים בלי תמונה? זה גם בסדר!';

export const CHILD_SHARED_PHOTO_SHARE_HEADLINE_PREFIX = 'גם אנחנו חלק';

export const CHILD_SHARED_PHOTO_SHARE_HEADLINE_EMPHASIS = 'מהשינוי הדיגיטלי!';

/** Figma 13674:16159 — share CTA (side-by-side with wallet). */
export const CHILD_SHARED_PHOTO_SHARE_PRIMARY_LABEL = 'שיתוף';

/** @deprecated Use CHILD_SHARED_PHOTO_SHARE_PRIMARY_LABEL */
export const CHILD_SHARED_PHOTO_SHARE_LONG_LABEL =
  'שליחת התמונה לחברים או משפחה';

/** Figma 13674:16159 — continue to wallet. */
export const CHILD_SHARED_PHOTO_WALLET_LABEL = 'המשך לארנק';

/** Figma 14283:17885 — printed agreement change label. */
export const CHILD_SHARED_PHOTO_CHANGE_LABEL = 'השינוי הראשון שלנו';
