/**
 * WhatsApp share message template for child bonding link.
 * Keep in sync with `functions/src/bonding/whatsapp.ts`.
 */
export const WHATSAPP_CHILD_INVITE_TEMPLATE_HE = `היי{childNameGreeting}! 👋
{parentName} מזמין/ה אותך ל-Joystie — בואו נתחיל יחד את המסע.

לחצו על הקישור:
{childUrl}`;

/** wa.me base — opens WhatsApp with pre-filled text (mobile + desktop). */
export const WHATSAPP_SHARE_BASE_URL = 'https://wa.me/';

/** @deprecated Use buildWhatsAppChildInviteMessage from lib/share/whatsapp */
export function buildWhatsAppChildInviteMessageLegacy(
  childName: string,
  childUrl: string
): string {
  return `היי ${childName}! מזמינים אותך להצטרף למסע ב-Joystie 🌟\n${childUrl}`;
}
