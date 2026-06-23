import {
  WHATSAPP_CHILD_INVITE_TEMPLATE_HE,
  WHATSAPP_SHARE_BASE_URL,
  formatChildUrlForMessaging,
  resolveWhatsAppInviteVerb,
} from '@/constants/whatsapp';

export interface WhatsAppChildInviteParams {
  childUrl: string;
  childName?: string;
  parentName?: string;
  parentGender?: 'female' | 'male';
}

/** Build Hebrew invite message from the constant template. */
export function buildWhatsAppChildInviteMessage(
  params: WhatsAppChildInviteParams | string,
  legacyChildUrl?: string
): string {
  if (typeof params === 'string') {
    return WHATSAPP_CHILD_INVITE_TEMPLATE_HE.replace(
      '{inviteVerb}',
      resolveWhatsAppInviteVerb('male')
    )
      .replace('{childUrl}', formatChildUrlForMessaging(legacyChildUrl ?? ''));
  }

  const { childUrl, parentGender } = params;
  return WHATSAPP_CHILD_INVITE_TEMPLATE_HE.replace(
    '{inviteVerb}',
    resolveWhatsAppInviteVerb(parentGender)
  ).replace('{childUrl}', formatChildUrlForMessaging(childUrl));
}

export function buildWhatsAppShareUrl(params: WhatsAppChildInviteParams): string {
  const text = buildWhatsAppChildInviteMessage(params);
  return `${WHATSAPP_SHARE_BASE_URL}?text=${encodeURIComponent(text)}`;
}

/** Mobile browsers — same-tab handoff opens native WhatsApp after user consent. */
function prefersNativeWhatsAppHandoff(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Open wa.me with pre-filled text.
 * Mobile/Safari: same-document navigation (not `_blank`) so the OS offers the native app.
 * Desktop: new tab, with same-tab fallback if popups are blocked.
 */
export function openWhatsAppShareUrl(url: string): void {
  if (typeof window === 'undefined') return;

  if (prefersNativeWhatsAppHandoff()) {
    window.location.assign(url);
    return;
  }

  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.assign(url);
  }
}

export function openWhatsAppChildInvite(
  params: WhatsAppChildInviteParams | string,
  legacyChildUrl?: string
): void {
  const url =
    typeof params === 'string'
      ? `${WHATSAPP_SHARE_BASE_URL}?text=${encodeURIComponent(
          buildWhatsAppChildInviteMessage(params, legacyChildUrl)
        )}`
      : buildWhatsAppShareUrl(params);

  openWhatsAppShareUrl(url);
}
