import { FirebaseError } from 'firebase/app';

/** User-facing Hebrew errors for billing callables. */
export function billingCallableErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    if (err.code === 'functions/unauthenticated') {
      return 'יש להתחבר לפני תשלום.';
    }
    if (err.code === 'functions/permission-denied') {
      return 'אין הרשאה לבצע תשלום.';
    }
    if (err.code === 'functions/internal' || err.code === 'functions/unavailable') {
      return (
        'שרת התשלום לא זמין. אם אתם על emulator — הריצו `npm run emulators:billing` ' +
        '(functions + firestore יחד), לא functions בלבד. אחרת ודאו deploy ב-joystie-poc.'
      );
    }
    if (err.code === 'functions/failed-precondition') {
      return err.message;
    }
    if (err.message) return err.message;
  }

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (
      msg.includes('cors') ||
      msg.includes('failed to fetch') ||
      msg.includes('network')
    ) {
      return (
        'לא ניתן להגיע לשרת התשלום (CORS / רשת). ' +
        'סביר ש-createCardcomTrialCheckout לא deployed — הריצו deploy אחרי תיקון Secret Manager (CARDCOM-SETUP.md).'
      );
    }
    return err.message;
  }

  return 'לא הצלחנו לפתוח את דף התשלום. נסו שוב.';
}
