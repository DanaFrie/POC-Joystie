import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import { onDocumentCreated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getServiceAccount } from '../serviceAccount';
import { buildBondingCalendarUrl } from './calendarLink';
import {
  appBaseUrl,
  sendChildNotStartedEmail,
  sendEnglishWaitlistEmail,
  sendFirstDealEmail,
  sendTrialEndingEmail,
  sendWelcomeEmail,
} from './sendLifecycle';

const emailUser = defineSecret('SERVICE_FUNCTION_EMAIL_USER');
const emailPassword = defineSecret('SERVICE_FUNCTION_EMAIL_PASSWORD');
const emailFrom = defineSecret('SERVICE_FUNCTION_EMAIL_FROM');
const baseUrl = defineSecret('SERVICE_FUNCTION_BASE_URL');

const MAIL_SECRETS = [emailUser, emailPassword, emailFrom, baseUrl];
const REGION = 'us-central1';
const DAY_MS = 24 * 60 * 60 * 1000;

type Kid = { name?: string; gender?: 'boy' | 'girl' };
type LifecycleMail = {
  welcomeAt?: string;
  childNotStartedAt?: string;
  firstDealNudgeAt?: string;
  trialEndingAt?: string;
};
type UserDoc = {
  email?: string;
  firstName?: string;
  onboarding?: boolean;
  signupDate?: string;
  onboardingCompletedAt?: string;
  primaryChildId?: string;
  kidsAges?: Kid[];
  bondingInviteId?: string;
  lifecycleMail?: LifecycleMail;
  subscription?: {
    status?: string;
    plan?: 'monthly' | 'annual';
    trialEndsAt?: string;
    /** ISO time the card was stored and the trial actually started. */
    cardcomVerifiedAt?: string;
  };
};

function db() {
  return admin.firestore();
}

function childNameFrom(user: UserDoc): string {
  const named = user.kidsAges?.find((kid) => kid.name?.trim());
  return named?.name?.trim() || '';
}

function parentNameFrom(user: UserDoc): string {
  return user.firstName?.trim() || '';
}

function signupReady(user: UserDoc): boolean {
  return Boolean(user.email?.includes('@') && parentNameFrom(user) && childNameFrom(user));
}

async function latestInviteLink(userId: string, user: UserDoc): Promise<string> {
  const base = appBaseUrl();
  const fallback = `${base}/onboarding`;
  try {
    if (user.bondingInviteId) {
      const snap = await db().collection('bonding_invites').doc(user.bondingInviteId).get();
      const data = snap.data() as { whatsappShareUrl?: string; childUrl?: string } | undefined;
      if (data?.whatsappShareUrl) return data.whatsappShareUrl;
      if (data?.childUrl) return data.childUrl;
    }
    const recent = await db()
      .collection('bonding_invites')
      .where('parentId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    const data = recent.docs[0]?.data() as { whatsappShareUrl?: string; childUrl?: string } | undefined;
    if (data?.whatsappShareUrl) return data.whatsappShareUrl;
    if (data?.childUrl) return data.childUrl;
  } catch (error) {
    console.error('[lifecycleMail] invite lookup failed', userId, error);
  }
  return fallback;
}

async function hasScreenDeal(parentId: string): Promise<boolean> {
  const snap = await db().collection('challenges').where('parentId', '==', parentId).limit(1).get();
  return !snap.empty;
}

function childGenderFrom(user: UserDoc): 'boy' | 'girl' | undefined {
  const named = user.kidsAges?.find((kid) => kid.name?.trim());
  const gender = named?.gender ?? user.kidsAges?.find((kid) => kid.gender)?.gender;
  return gender === 'girl' || gender === 'boy' ? gender : undefined;
}

async function childDisplayName(user: UserDoc): Promise<string> {
  const fromKids = childNameFrom(user);
  if (fromKids) return fromKids;
  if (!user.primaryChildId) return 'הילד';
  const child = await db().collection('children').doc(user.primaryChildId).get();
  const name = String(child.data()?.name || '').trim();
  return name || 'הילד';
}

async function childGender(user: UserDoc): Promise<'boy' | 'girl'> {
  const fromKids = childGenderFrom(user);
  if (fromKids) return fromKids;
  if (!user.primaryChildId) return 'boy';
  const child = await db().collection('children').doc(user.primaryChildId).get();
  return child.data()?.gender === 'girl' ? 'girl' : 'boy';
}

export const onUserLifecycleMail = onDocumentWritten(
  {
    document: 'users/{userId}',
    region: REGION,
    serviceAccount: getServiceAccount(),
    secrets: MAIL_SECRETS,
  },
  async (event) => {
    const afterSnap = event.data?.after;
    if (!afterSnap?.exists) return;
    const user = afterSnap.data() as UserDoc;
    const before = event.data?.before?.data() as UserDoc | undefined;
    const ref = afterSnap.ref;
    const now = new Date().toISOString();
    const patch: Record<string, string> = {};

    if (user.onboarding === true && !user.onboardingCompletedAt) {
      patch.onboardingCompletedAt = now;
    }

    const welcomeAlready = Boolean(user.lifecycleMail?.welcomeAt);
    const becameReady = signupReady(user) && !signupReady(before || {});
    if (!welcomeAlready && (becameReady || (signupReady(user) && !before))) {
      const parentName = parentNameFrom(user);
      const childName = childNameFrom(user);
      const gender = await childGender(user);
      await sendWelcomeEmail({
        to: user.email!.trim(),
        parentName,
        childName,
        childGender: gender,
      });
      patch['lifecycleMail.welcomeAt'] = now;
      console.log('[lifecycleMail] welcome sent', afterSnap.id);
    }

    if (Object.keys(patch).length) {
      await ref.update(patch);
    }
  }
);

export const onEnglishWaitlistCreated = onDocumentCreated(
  {
    document: 'english_waitlist/{id}',
    region: REGION,
    serviceAccount: getServiceAccount(),
    secrets: MAIL_SECRETS,
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const email = String(snap.data()?.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (snap.data()?.welcomeEmailAt) return;
    await sendEnglishWaitlistEmail(email);
    await snap.ref.update({ welcomeEmailAt: new Date().toISOString() });
    console.log('[lifecycleMail] waitlist sent', snap.id);
  }
);

export const scheduledLifecycleMails = onSchedule(
  {
    schedule: '0 * * * *',
    timeZone: 'Asia/Jerusalem',
    region: REGION,
    serviceAccount: getServiceAccount(),
    secrets: MAIL_SECRETS,
  },
  async () => {
    const now = Date.now();
    await sendChildNotStartedNudges(now);
    await sendFirstDealNudges(now);
    await sendTrialEndingNudges(now);
  }
);

async function sendChildNotStartedNudges(now: number): Promise<void> {
  const from = new Date(now - 7 * DAY_MS).toISOString();
  const until = new Date(now - DAY_MS).toISOString();
  const snap = await db()
    .collection('users')
    .where('signupDate', '>=', from)
    .where('signupDate', '<=', until)
    .limit(200)
    .get();

  for (const doc of snap.docs) {
    const user = doc.data() as UserDoc;
    if (user.onboarding === true) continue;
    if (user.lifecycleMail?.childNotStartedAt) continue;
    const email = user.email?.trim();
    const parentName = parentNameFrom(user);
    if (!email || !parentName) continue;
    const childName = (await childDisplayName(user)) || 'הילד';
    const gender = await childGender(user);
    try {
      const sendLinkUrl = await latestInviteLink(doc.id, user);
      const calendarUrl = buildBondingCalendarUrl(`${appBaseUrl()}/onboarding`);
      await sendChildNotStartedEmail({
        to: email,
        parentName,
        childName,
        childGender: gender,
        sendLinkUrl,
        calendarUrl,
      });
      await doc.ref.update({ 'lifecycleMail.childNotStartedAt': new Date().toISOString() });
      console.log('[lifecycleMail] child-not-started sent', doc.id);
    } catch (error) {
      console.error('[lifecycleMail] child-not-started failed', doc.id, error);
    }
  }
}

async function sendFirstDealNudges(now: number): Promise<void> {
  const from = new Date(now - 7 * DAY_MS).toISOString();
  const until = new Date(now - DAY_MS).toISOString();
  const snap = await db()
    .collection('users')
    .where('onboardingCompletedAt', '>=', from)
    .where('onboardingCompletedAt', '<=', until)
    .limit(200)
    .get();

  for (const doc of snap.docs) {
    const user = doc.data() as UserDoc;
    if (user.lifecycleMail?.firstDealNudgeAt) continue;
    const email = user.email?.trim();
    const parentName = parentNameFrom(user);
    if (!email || !parentName) continue;
    try {
      if (await hasScreenDeal(doc.id)) {
        await doc.ref.update({ 'lifecycleMail.firstDealNudgeAt': new Date().toISOString() });
        continue;
      }
      const childName = await childDisplayName(user);
      await sendFirstDealEmail({ to: email, parentName, childName });
      await doc.ref.update({ 'lifecycleMail.firstDealNudgeAt': new Date().toISOString() });
      console.log('[lifecycleMail] first-deal sent', doc.id);
    } catch (error) {
      console.error('[lifecycleMail] first-deal failed', doc.id, error);
    }
  }
}

const TRIAL_DAYS = 30;

/** Trial end: 30 days after the card was stored. Falls back to the stored end. */
function trialEndMs(user: UserDoc): number | null {
  const verified = Date.parse(user.subscription?.cardcomVerifiedAt || '');
  if (!Number.isNaN(verified)) return verified + TRIAL_DAYS * DAY_MS;
  const stored = Date.parse(user.subscription?.trialEndsAt || '');
  return Number.isNaN(stored) ? null : stored;
}

async function sendTrialEndingNudges(now: number): Promise<void> {
  const snap = await db()
    .collection('users')
    .where('subscription.status', '==', 'trialing')
    .limit(200)
    .get();

  for (const doc of snap.docs) {
    const user = doc.data() as UserDoc;
    if (user.lifecycleMail?.trialEndingAt) continue;
    const email = user.email?.trim();
    const parentName = parentNameFrom(user);
    if (!email || !parentName) continue;
    const ends = trialEndMs(user);
    if (ends == null) continue;
    // 30-day trial: send once from day 28 (two days before the end) until it ends.
    const sendFrom = ends - 2 * DAY_MS;
    if (now < sendFrom || now >= ends) continue;
    try {
      await sendTrialEndingEmail({
        to: email,
        parentName,
      });
      await doc.ref.update({ 'lifecycleMail.trialEndingAt': new Date().toISOString() });
      console.log('[lifecycleMail] trial-ending sent', doc.id);
    } catch (error) {
      console.error('[lifecycleMail] trial-ending failed', doc.id, error);
    }
  }
}
