/**
 * WhatsApp share message template for child bonding link.
 * Keep in sync with `functions/src/bonding/whatsapp.ts`.
 */
export const WHATSAPP_CHILD_INVITE_TEMPLATE_HE = `{inviteVerb} אותך לג׳ויסטי - האפליקציה שתעזור לנו להשקיע את הזמן שלנו בדברים כיפים (ופחות בפלאפון) וגם לחסוך כסף על הדרך

מתחילים עכשיו:

{childUrl}`;

export const WHATSAPP_INVITE_VERB_FEMALE = 'אני מזמינה';
export const WHATSAPP_INVITE_VERB_MALE = 'אני מזמין';

/** wa.me base — opens WhatsApp with pre-filled text (mobile + desktop). */
export const WHATSAPP_SHARE_BASE_URL = 'https://wa.me/';

export function resolveWhatsAppInviteVerb(
  parentGender?: 'female' | 'male' | null
): string {
  return parentGender === 'female'
    ? WHATSAPP_INVITE_VERB_FEMALE
    : WHATSAPP_INVITE_VERB_MALE;
}

/** Plain https URL on its own line — no bidi marks (WhatsApp ignores those for link detection). */
export function formatChildUrlForMessaging(childUrl: string): string {
  return childUrl.trim();
}
