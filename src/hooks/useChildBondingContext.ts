'use client';

import { useEffect, useState } from 'react';
import {
  childBondingContextEventName,
  getChildBondingContext,
  type ChildBondingContext,
} from '@/lib/onboarding/childBondingContext';

/** Reactive bonding context — updates after `useChildBondingBootstrap` resolves the token. */
export function useChildBondingContext(): ChildBondingContext | null {
  const [ctx, setCtx] = useState<ChildBondingContext | null>(() =>
    typeof window !== 'undefined' ? getChildBondingContext() : null
  );

  useEffect(() => {
    const refresh = () => setCtx(getChildBondingContext());
    refresh();
    window.addEventListener(childBondingContextEventName, refresh);
    return () => window.removeEventListener(childBondingContextEventName, refresh);
  }, []);

  return ctx;
}
