/** Server copy of client WhatsApp template (keep in sync with src/constants/whatsapp.ts). */
const TEMPLATE_HE = `{inviteVerb} אותך לג׳ויסטי - האפליקציה שתעזור לנו להשקיע את הזמן שלנו בדברים כיפים (ופחות בפלאפון) וגם לחסוך כסף על הדרך

מתחילים עכשיו:

{childUrl}`;

const INVITE_VERB_FEMALE = 'אני מזמינה';
const INVITE_VERB_MALE = 'אני מזמין';

function resolveInviteVerb(parentGender?: 'female' | 'male'): string {
  return parentGender === 'female' ? INVITE_VERB_FEMALE : INVITE_VERB_MALE;
}

function formatChildUrlForMessaging(childUrl: string): string {
  return childUrl.trim();
}

export function buildWhatsAppChildInviteMessage(params: {
  childUrl: string;
  childName?: string;
  parentName?: string;
  parentGender?: 'female' | 'male';
}): string {
  return TEMPLATE_HE.replace('{inviteVerb}', resolveInviteVerb(params.parentGender))
    .replace('{childUrl}', formatChildUrlForMessaging(params.childUrl));
}

export function buildWhatsAppShareUrl(params: {
  childUrl: string;
  childName?: string;
  parentName?: string;
  parentGender?: 'female' | 'male';
}): string {
  const text = buildWhatsAppChildInviteMessage(params);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
