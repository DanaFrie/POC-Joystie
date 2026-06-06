/**
 * Remind the *parent* to share with the child when they are together (remind_later flow).
 * Do not encourage sending the child link remotely — CTA opens WhatsApp share when ready.
 */
import * as admin from 'firebase-admin';
import { sendNotificationEmail } from '../email';
import type { FirestoreBondingInvite } from './types';

const COLLECTION = 'bonding_invites';

function getDb() {
  return admin.firestore();
}

export async function processBondingShareReminders(): Promise<number> {
  const now = new Date().toISOString();
  const snap = await getDb()
    .collection(COLLECTION)
    .where('status', '==', 'remind_scheduled')
    .where('shareReminderAt', '<=', now)
    .limit(50)
    .get();

  let sent = 0;
  for (const doc of snap.docs) {
    const invite = { id: doc.id, ...doc.data() } as FirestoreBondingInvite;
    if (invite.shareReminderSentAt) continue;
    try {
      await sendBondingShareReminderEmail(invite);
      await doc.ref.update({
        shareReminderSentAt: now,
        updatedAt: now,
      });
      sent += 1;
    } catch (err) {
      console.error('[BondingReminder] Failed for', doc.id, err);
    }
  }
  return sent;
}

async function sendBondingShareReminderEmail(invite: FirestoreBondingInvite): Promise<void> {
  const userSnap = await getDb().collection('users').doc(invite.parentId).get();
  if (!userSnap.exists) return;
  const user = userSnap.data() as { email?: string; firstName?: string; notificationsEnabled?: boolean };
  if (!user.email || user.notificationsEnabled === false) return;

  const firstName = user.firstName || 'הורה';
  const base = process.env.SERVICE_FUNCTION_BASE_URL || 'https://joystie.com';
  const bondingScreenUrl = `${base}/bonding/share?inviteId=${invite.id}`;

  const subject = 'הגיע הזמן לשבת עם הילד/ה ולהתחיל ב-Joystie';
  const content = `
    <p>שלום ${firstName},</p>
    <p>ביקשתם שנזכיר לכם כשתהיו יחד עם הילד/ה.</p>
    <p><strong>חשוב:</strong> אל תשלחו את הקישור לילד/ה מרחוק — זה עובד הכי טוב כשאתם לידו עם הטלפון, דקה אחת.</p>
    <p>כשאתם יחד: לחצו למטה, פתחו WhatsApp, והילד/ה ילחץ על הקישור מולכם.</p>
  `;

  await sendNotificationEmail(
    user.email,
    subject,
    content,
    'פתחו שיתוף ב-WhatsApp (יחד)',
    bondingScreenUrl
  );
}
