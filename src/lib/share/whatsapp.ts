import { buildWhatsAppChildInviteMessage } from '@/constants/whatsapp';

export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function openWhatsAppChildInvite(childName: string, childUrl: string) {
  const text = buildWhatsAppChildInviteMessage(childName, childUrl);
  window.open(buildWhatsAppShareUrl(text), '_blank', 'noopener,noreferrer');
}
