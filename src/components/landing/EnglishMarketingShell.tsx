'use client';

import type { ReactNode } from 'react';
import { LandingLocaleProvider } from '@/components/landing/LandingLocaleContext';
import { EnglishAppGateProvider } from '@/components/landing/EnglishAppGateContext';
import { EnglishAppUnavailableGate } from '@/components/landing/EnglishAppUnavailableGate';

/** EN marketing shell — waitlist gate for login/join on every /en page. */
export function EnglishMarketingShell({ children }: { children: ReactNode }) {
  return (
    <LandingLocaleProvider locale="en">
      <EnglishAppGateProvider>
        {children}
        <EnglishAppUnavailableGate />
      </EnglishAppGateProvider>
    </LandingLocaleProvider>
  );
}
