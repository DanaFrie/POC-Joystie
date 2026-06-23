import {
  WHATSAPP_CHILD_INVITE_TEMPLATE_HE,
  WHATSAPP_NATIVE_SEND_SCHEME,
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

function isMobileHandset(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Mobile: `whatsapp://send?text=` via synthetic click — no wa.me navigation (Safari
 * universal links often resume the app without the prefilled composer).
 * Desktop: `wa.me` in a new tab.
 */
export function openWhatsAppWithMessage(text: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const encoded = encodeURIComponent(text);

  if (isMobileHandset()) {
    const nativeUrl = `${WHATSAPP_NATIVE_SEND_SCHEME}?text=${encoded}`;
    const link = document.createElement('a');
    link.href = nativeUrl;
    link.style.display = 'none';
    link.setAttribute('aria-hidden', 'true');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const webUrl = `${WHATSAPP_SHARE_BASE_URL}?text=${encoded}`;
  const opened = window.open(webUrl, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.open(webUrl, '_blank');
  }
}

/** Parse `text` from a wa.me URL and open the composer. */
export function openWhatsAppShareUrl(url: string): void {
  let text = '';
  try {
    text = new URL(url).searchParams.get('text') ?? '';
  } catch {
    // fall through
  }
  if (text) {
    openWhatsAppWithMessage(text);
  }
}

export function openWhatsAppChildInvite(
  params: WhatsAppChildInviteParams | string,
  legacyChildUrl?: string
): void {
  const text =
    typeof params === 'string'
      ? buildWhatsAppChildInviteMessage(params, legacyChildUrl)
      : buildWhatsAppChildInviteMessage(params);

  openWhatsAppWithMessage(text);
}
