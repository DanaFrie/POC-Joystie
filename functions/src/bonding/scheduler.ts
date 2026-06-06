import { onSchedule } from 'firebase-functions/v2/scheduler';
import { processBondingShareReminders } from './shareReminder';

const emailSecrets = [
  'SERVICE_FUNCTION_EMAIL_USER',
  'SERVICE_FUNCTION_EMAIL_PASSWORD',
  'SERVICE_FUNCTION_EMAIL_FROM',
] as const;

/**
 * Email parents who have not shared the child WhatsApp link (runs every 30 min).
 */
export const scheduledBondingShareReminders = onSchedule(
  {
    schedule: 'every 30 minutes',
    timeZone: 'Asia/Jerusalem',
    region: 'us-central1',
    secrets: [...emailSecrets],
  },
  async () => {
    const sent = await processBondingShareReminders();
    console.log('[scheduledBondingShareReminders] sent', sent);
  }
);
