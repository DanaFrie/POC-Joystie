'use client';

import { useEffect } from 'react';

/** Light gradient funnel — no grid, no ellipse 385 (toggle on mount). */
export function useOnboardingLightFunnel(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const root = document.querySelector<HTMLElement>('[data-v03-funnel]');
    if (!root) return;

    root.classList.add('v03-funnel-light');

    const theme = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    const prevTheme = theme?.content;
    if (theme) theme.content = '#ffffff';

    return () => {
      root.classList.remove('v03-funnel-light');
      if (theme && prevTheme) theme.content = prevTheme;
    };
  }, [enabled]);
}
