/**
 * Firebase server clock. Phone wall clocks disagree by a second or more;
 * the countdown and the "start play" check both read this offset.
 */
import { onValue, ref } from 'firebase/database';
import { getDatabaseInstance } from '@/lib/firebase';

let offsetMs = 0;
let listening = false;
const listeners = new Set<(offsetMs: number) => void>();

export function serverClockOffsetMs(): number {
  return offsetMs;
}

/** Local `Date.now()` shifted onto the Firebase server clock. */
export function serverNowMs(nowMs = Date.now()): number {
  return nowMs + offsetMs;
}

export function subscribeServerClock(listener: (offsetMs: number) => void): () => void {
  listeners.add(listener);
  listener(offsetMs);
  if (!listening && typeof window !== 'undefined') {
    listening = true;
    void getDatabaseInstance().then((db) => {
      onValue(ref(db, '.info/serverTimeOffset'), (snap) => {
        const value = snap.val();
        offsetMs = typeof value === 'number' && Number.isFinite(value) ? value : 0;
        listeners.forEach((fn) => fn(offsetMs));
      });
    });
  }
  return () => {
    listeners.delete(listener);
  };
}
