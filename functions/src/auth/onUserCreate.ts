import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

/**
 * Create Firestore user profile when Auth account is created (email or OAuth).
 */
export const authOnUserCreated = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  const ref = db.collection('users').doc(user.uid);
  const existing = await ref.get();
  if (existing.exists) {
    return;
  }

  const display = user.displayName?.trim() || '';
  const nameParts = display ? display.split(/\s+/) : [];
  const now = new Date().toISOString();

  await ref.set({
    id: user.uid,
    email: (user.email || '').toLowerCase(),
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    gender: 'male',
    kidsAges: [],
    termsAccepted: false,
    signupDate: now,
    createdAt: now,
    updatedAt: now,
    authProviders: user.providerData.map((p) => p.providerId),
  });

  console.log('[authOnUserCreated] Created user profile for', user.uid);
});
