/**
 * Meta Pixel ID (public, client-side).
 * Single source of truth for layout Script + Events Manager.
 */
export const META_PIXEL_ID = '1988536355373234';

/** Production only — off on intgr, localhost, and local dev builds. */
export function isMetaPixelEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ENV === 'prod') {
    return true;
  }
  if (process.env.NEXT_PUBLIC_ENV === 'intgr') {
    return false;
  }
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'joystie-poc-prod';
}
