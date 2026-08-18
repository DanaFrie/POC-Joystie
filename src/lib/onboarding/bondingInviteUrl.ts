/** Bonding child invite URL query params — works without deployed callables / RTDB meta. */

export type BondingInviteUrlMeta = {
  childName?: string;
  childGender?: 'boy' | 'girl';
  parentName?: string;
  parentGender?: 'female' | 'male';
};

const KEYS = ['cn', 'cg', 'pn', 'pg'] as const;

export function withBondingInviteQueryParams(
  url: string,
  meta: BondingInviteUrlMeta
): string {
  if (!url.trim()) return url;
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://joystie.com');
    if (meta.childName?.trim()) parsed.searchParams.set('cn', meta.childName.trim());
    if (meta.childGender) parsed.searchParams.set('cg', meta.childGender);
    if (meta.parentName?.trim()) parsed.searchParams.set('pn', meta.parentName.trim());
    if (meta.parentGender) parsed.searchParams.set('pg', meta.parentGender);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getBondingInviteIdFromUrl(url: string): string | null {
  if (!url.trim()) return null;
  try {
    const parsed = new URL(
      url,
      typeof window !== 'undefined' ? window.location.origin : 'https://joystie.com'
    );
    return parsed.searchParams.get('invite')?.trim() || null;
  } catch {
    return null;
  }
}

export function parseBondingInviteQueryParams(
  searchParams: Pick<URLSearchParams, 'get'>
): BondingInviteUrlMeta {
  const cn = searchParams.get('cn')?.trim();
  const cg = searchParams.get('cg');
  const pn = searchParams.get('pn')?.trim();
  const pg = searchParams.get('pg');

  return {
    childName: cn || undefined,
    childGender: cg === 'girl' || cg === 'boy' ? cg : undefined,
    parentName: pn || undefined,
    parentGender: pg === 'female' || pg === 'male' ? pg : undefined,
  };
}

export function preserveBondingInviteQueryParams(fromUrl: string, toUrl: string): string {
  try {
    const from = new URL(fromUrl, typeof window !== 'undefined' ? window.location.origin : 'https://joystie.com');
    const to = new URL(toUrl, typeof window !== 'undefined' ? window.location.origin : 'https://joystie.com');
    for (const key of KEYS) {
      const value = from.searchParams.get(key);
      if (value) to.searchParams.set(key, value);
    }
    return to.toString();
  } catch {
    return toUrl;
  }
}
