'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type LandingLocale = 'he' | 'en';

const LandingLocaleContext = createContext<LandingLocale>('he');

export function LandingLocaleProvider({
  locale,
  children,
}: {
  locale: LandingLocale;
  children: ReactNode;
}) {
  return (
    <LandingLocaleContext.Provider value={locale}>{children}</LandingLocaleContext.Provider>
  );
}

export function useLandingLocale(): LandingLocale {
  return useContext(LandingLocaleContext);
}

export function landingHomePath(locale: LandingLocale): string {
  return locale === 'en' ? '/en' : '/';
}

export function landingAboutPath(locale: LandingLocale): string {
  return locale === 'en' ? '/en/about' : '/about';
}

export function landingKnowledgePath(locale: LandingLocale, slug: string): string {
  return locale === 'en' ? `/en/knowledge/${slug}` : `/knowledge/${slug}`;
}

export function landingOtherLocale(locale: LandingLocale): LandingLocale {
  return locale === 'en' ? 'he' : 'en';
}

/** Resolve home / about / knowledge URL for a target locale from the current path. */
export function landingPathForLocale(
  target: LandingLocale,
  pathname: string | null,
): string {
  const path = pathname ?? '/';
  if (path === '/' || path === '/en') return landingHomePath(target);
  if (path === '/about' || path === '/en/about') return landingAboutPath(target);
  const knowledge = path.match(/^\/(?:en\/)?knowledge\/([^/]+)/);
  if (knowledge?.[1]) return landingKnowledgePath(target, knowledge[1]);
  return landingHomePath(target);
}
