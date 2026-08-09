/**
 * Firebase Auth error codes → Hebrew messages (email + OAuth).
 */
const LOGIN_CREDENTIALS_ERROR = 'אחד מפרטי ההתחברות שגויים. נסו שוב';

export function getAuthErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'כתובת האימייל כבר בשימוש',
    'auth/invalid-email': 'כתובת אימייל לא תקינה',
    'auth/operation-not-allowed': 'שיטת ההתחברות לא מופעלת בפרויקט. פנה לתמיכה.',
    'auth/weak-password': 'סיסמה חלשה מדי. אנא השתמש בסיסמה חזקה יותר',
    'auth/user-disabled': 'החשבון הושבת',
    'auth/user-not-found': LOGIN_CREDENTIALS_ERROR,
    'auth/wrong-password': LOGIN_CREDENTIALS_ERROR,
    'auth/too-many-requests': 'יותר מדי ניסיונות. אנא נסה שוב מאוחר יותר',
    'auth/network-request-failed': 'שגיאת רשת. אנא בדוק את החיבור לאינטרנט',
    'auth/invalid-credential': LOGIN_CREDENTIALS_ERROR,
    'auth/invalid-login-credentials': LOGIN_CREDENTIALS_ERROR,
    'auth/expired-action-code': 'קישור פג תוקף. אנא בקש קישור חדש',
    'auth/invalid-action-code': 'קישור לא תקין. אנא בקש קישור חדש',
    // OAuth / popup
    'auth/popup-closed-by-user': 'החלון נסגר לפני סיום ההתחברות. נסו שוב.',
    'auth/cancelled-popup-request': 'ההתחברות בוטלה. נסו שוב.',
    'auth/popup-blocked':
      'הדפדפן חסם חלון קופץ. אפשרו חלונות קופצים או השתמשו בהתחברות עם הפניה.',
    'auth/account-exists-with-different-credential':
      'החשבון נוצר עם אימייל וסיסמה, התחברו כך',
    'auth/credential-already-in-use': 'חשבון זה כבר מקושר למשתמש אחר.',
    'auth/auth-domain-config-required': 'תצורת התחברות לא הושלמה. פנו לתמיכה.',
    'auth/unauthorized-domain': 'הדומיין לא מאושר להתחברות. פנו לתמיכה.',
    'auth/operation-not-supported-in-this-environment':
      'התחברות לא נתמכה בסביבה זו. נסו דפדפן אחר.',
    'auth/redirect-cancelled-by-user': 'ההתחברות בוטלה.',
    'auth/redirect-operation-pending': 'התחברות כבר בתהליך. המתינו רגע.',
    'auth/disallowed-useragent':
      'לא ניתן להתחבר עם Google או Apple מדפדפן מוטמע. פתחו את האתר ב-Chrome או Safari.',
  };

  return errorMessages[code] || 'אירעה שגיאה בהתחברות. נסה שוב.';
}

/** Map legacy Hebrew login credential copy → canonical QA string. */
function normalizeLoginCredentialCopy(message: string): string {
  const legacy = [
    'סיסמה לא נכונה',
    'לא נמצא משתמש עם כתובת אימייל זו',
    'פרטי התחברות לא נכונים',
  ];
  if (legacy.some((s) => message.includes(s))) {
    return LOGIN_CREDENTIALS_ERROR;
  }
  return message;
}

export function getAuthErrorFromUnknown(error: unknown): string {
  const codeFromProp =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: string }).code === 'string'
      ? (error as { code: string }).code
      : '';

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message: string }).message === 'string'
        ? (error as { message: string }).message
        : '';

  const codeFromMessage = message.match(/auth\/[a-z0-9-]+/i)?.[0] ?? '';
  const code = codeFromProp || codeFromMessage || 'unknown';

  if (code !== 'unknown') {
    return getAuthErrorMessage(code);
  }

  if (message) {
    return normalizeLoginCredentialCopy(message);
  }

  return getAuthErrorMessage(code);
}

export { LOGIN_CREDENTIALS_ERROR };
