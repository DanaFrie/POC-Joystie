function currentHostname(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hostname.toLowerCase();
}

function configuredAuthDomainHost(): string {
  const raw = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '';
  return raw.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
}

/** True on Firebase App Hosting default URL (*.hosted.app). */
export function isFirebaseAppHostingOrigin(): boolean {
  return /\.hosted\.app$/i.test(currentHostname());
}

/**
 * Redirect OAuth stores getRedirectResult on `authDomain` (usually *.firebaseapp.com).
 * joystie.com / App Hosting / Cloud Run are third-party to that host, so redirect
 * returns empty. Localhost always uses popup instead — do not treat it as unreliable.
 */
export function isOAuthRedirectUnreliableOrigin(): boolean {
  const host = currentHostname();
  if (!host) return false;
  if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return false;
  if (isFirebaseAppHostingOrigin() || /\.run\.app$/i.test(host)) return true;
  if (host === 'joystie.com' || host.endsWith('.joystie.com')) return true;
  const authHost = configuredAuthDomainHost();
  return Boolean(authHost && host !== authHost);
}
