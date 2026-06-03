/** Keep in sync with `functions/src/bonding/whatsapp.ts` on feat/v03-bonding. */
export function buildWhatsAppChildInviteMessage(
  childName: string,
  childUrl: string
): string {
  return `היי ${childName}! מזמינים אותך להצטרף למסע ב-Joystie 🌟\n${childUrl}`;
}
