import { getFirestoreInstance } from '@/lib/firebase';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('EnglishWaitlist');
const COLLECTION = 'english_waitlist';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitEnglishWaitlist(rawEmail: string): Promise<void> {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email)) {
    throw new Error('invalid-email');
  }

  try {
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    const db = await getFirestoreInstance();
    await addDoc(collection(db, COLLECTION), {
      email,
      createdAt: serverTimestamp(),
      source: 'en-landing',
    });
    logger.log('waitlist signup', { email });
  } catch (error) {
    logger.warn('Firestore waitlist write failed — stored locally', error);
    if (typeof window !== 'undefined') {
      const key = 'joystie_english_waitlist';
      const prev: unknown[] = JSON.parse(window.localStorage.getItem(key) || '[]');
      prev.push({ email, createdAt: new Date().toISOString(), source: 'en-landing' });
      window.localStorage.setItem(key, JSON.stringify(prev));
    }
  }
}
