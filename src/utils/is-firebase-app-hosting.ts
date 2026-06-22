/** True on Firebase App Hosting (*.hosted.app). */
export function isFirebaseAppHostingOrigin(): boolean {
  if (typeof window === 'undefined') return false;
  return /\.hosted\.app$/i.test(window.location.hostname);
}
