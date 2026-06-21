/**
 * Firebase Auth error codes → Hebrew messages (email + OAuth).
 */
export function getAuthErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'כתובת האימייל כבר בשימוש',
    'auth/invalid-email': 'כתובת אימייל לא תקינה',
    'auth/operation-not-allowed': 'שיטת ההתחברות לא מופעלת בפרויקט. פנה לתמיכה.',
    'auth/weak-password': 'סיסמה חלשה מדי. אנא השתמש בסיסמה חזקה יותר',
    'auth/user-disabled': 'החשבון הושבת',
    'auth/user-not-found': 'לא נמצא משתמש עם כתובת אימייל זו',
    'auth/wrong-password': 'סיסמה לא נכונה',
    'auth/too-many-requests': 'יותר מדי ניסיונות. אנא נסה שוב מאוחר יותר',
    'auth/network-request-failed': 'שגיאת רשת. אנא בדוק את החיבור לאינטרנט',
    'auth/invalid-credential': 'פרטי התחברות לא נכונים',
    'auth/expired-action-code': 'קישור פג תוקף. אנא בקש קישור חדש',
    'auth/invalid-action-code': 'קישור לא תקין. אנא בקש קישור חדש',
    // OAuth / popup
    'auth/popup-closed-by-user': 'החלון נסגר לפני סיום ההתחברות. נסו שוב.',
    'auth/cancelled-popup-request': 'ההתחברות בוטלה. נסו שוב.',
    'auth/popup-blocked': 'הדפדפן חסם חלון קופץ. אפשרו חלונות קופצים או השתמשו בהתחברות עם הפניה.',
    'auth/account-exists-with-different-credential':
      'כתובת האימייל כבר רשומה בשיטה אחרת. התחברו בשיטה המקורית או אפסו סיסמה.',
    'auth/credential-already-in-use': 'חשבון זה כבר מקושר למשתמש אחר.',
    'auth/auth-domain-config-required': 'תצורת התחברות לא הושלמה. פנו לתמיכה.',
    'auth/unauthorized-domain': 'הדומיין לא מאושר להתחברות. פנו לתמיכה.',
    'auth/operation-not-supported-in-this-environment':
      'התחברות לא נתמחה בסביבה זו. נסו דפדפן אחר.',
    'auth/redirect-cancelled-by-user': 'ההתחברות בוטלה.',
    'auth/redirect-operation-pending': 'התחברות כבר בתהליך. המתינו רגע.',
    'auth/disallowed-useragent':
      'לא ניתן להתחבר עם Google מדפדפן מוטמע. פתחו את האתר ב-Chrome או Safari.',
  };

  return errorMessages[code] || 'אירעה שגיאה בהתחברות. נסה שוב.';
}

export function getAuthErrorFromUnknown(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: string }).code === 'string'
      ? (error as { code: string }).code
      : 'unknown';
  if (error instanceof Error && code === 'unknown' && error.message) {
    return error.message;
  }
  return getAuthErrorMessage(code);
}
