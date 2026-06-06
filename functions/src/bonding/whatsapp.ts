/** Server copy of client WhatsApp template (keep in sync with src/constants/whatsapp.ts). */
const TEMPLATE_HE = `היי{childNameGreeting}! 👋
{parentName} מזמין/ה אותך ל-Joystie — בואו נתחיל יחד את המסע.

לחצו על הקישור:
{childUrl}`;

export function buildWhatsAppChildInviteMessage(params: {
  childUrl: string;
  childName?: string;
  parentName?: string;
}): string {
  const childNameGreeting = params.childName ? ` ${params.childName}` : '';
  const parentLabel = params.parentName?.trim() || 'ההורה שלך';
  return TEMPLATE_HE.replace('{childNameGreeting}', childNameGreeting)
    .replace('{parentName}', parentLabel)
    .replace('{childUrl}', params.childUrl);
}

export function buildWhatsAppShareUrl(params: {
  childUrl: string;
  childName?: string;
  parentName?: string;
}): string {
  const text = buildWhatsAppChildInviteMessage(params);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
