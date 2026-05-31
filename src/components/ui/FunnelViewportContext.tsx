'use client';

import { createContext, useContext } from 'react';

const FunnelViewportContext = createContext({ isDesktop: false });

export function FunnelViewportProvider({
  isDesktop,
  children,
}: {
  isDesktop: boolean;
  children: React.ReactNode;
}) {
  return (
    <FunnelViewportContext.Provider value={{ isDesktop }}>
      {children}
    </FunnelViewportContext.Provider>
  );
}

/** True when viewport ≥ desktop breakpoint (onboarding shows grid-only). */
export function useFunnelDesktop() {
  return useContext(FunnelViewportContext).isDesktop;
}
