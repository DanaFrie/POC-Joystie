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
  const query = new URLSearchParams({ text });
  return `${WHATSAPP_SHARE_BASE_URL}?${query.toString()}`;
}

export function openWhatsAppChildInvite(
  params: WhatsAppChildInviteParams | string,
  legacyChildUrl?: string
): void {
  if (typeof window === 'undefined') return;

  const url =
    typeof params === 'string'
      ? `${WHATSAPP_SHARE_BASE_URL}?${new URLSearchParams({
          text: buildWhatsAppChildInviteMessage(params, legacyChildUrl),
        }).toString()}`
      : buildWhatsAppShareUrl(params);

  window.open(url, '_blank', 'noopener,noreferrer');
}
