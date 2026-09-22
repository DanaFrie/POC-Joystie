'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useLandingLocale } from '@/components/landing/LandingLocaleContext';
import {
  clearMarketingExit,
  startMarketingExit,
  useMarketingFadeNavigate,
} from '@/components/landing/useMarketingFadeNavigate';

export type EnglishAppGateIntent = 'join' | 'login';

type EnglishAppGateValue = {
  open: boolean;
  intent: EnglishAppGateIntent;
  show: (intent: EnglishAppGateIntent) => void;
  hide: () => void;
  /** Close overlay without restoring page opacity (navigation in progress). */
  closeForNavigate: () => void;
};

const EnglishAppGateContext = createContext<EnglishAppGateValue | null>(null);

export function EnglishAppGateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<EnglishAppGateIntent>('join');

  const show = useCallback((next: EnglishAppGateIntent) => {
    setIntent(next);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    clearMarketingExit();
    setOpen(false);
  }, []);

  const closeForNavigate = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ open, intent, show, hide, closeForNavigate }),
    [open, intent, show, hide, closeForNavigate]
  );

  return (
    <EnglishAppGateContext.Provider value={value}>{children}</EnglishAppGateContext.Provider>
  );
}

export function useEnglishAppGateOptional(): EnglishAppGateValue | null {
  return useContext(EnglishAppGateContext);
}

export function useEnglishAppGateIntercept(intent: EnglishAppGateIntent) {
  const locale = useLandingLocale();
  const gate = useEnglishAppGateOptional();
  const fadeNavigate = useMarketingFadeNavigate();
  const href = intent === 'join' ? '/onboarding' : '/login';
  const shouldGate = locale === 'en' && Boolean(gate);

  const onClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (shouldGate && gate) {
        startMarketingExit(() => {
          gate.show(intent);
        });
        return;
      }
      fadeNavigate(href);
    },
    [shouldGate, gate, intent, fadeNavigate, href]
  );

  return { href, onClick };
}
