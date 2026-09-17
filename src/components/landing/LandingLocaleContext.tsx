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

export function landingOtherLocale(locale: LandingLocale): LandingLocale {
  return locale === 'en' ? 'he' : 'en';
}
