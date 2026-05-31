'use client';

import { useLayoutEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Render into `[data-v03-funnel]` so footers span the viewport, not the scaled 375px canvas. */
export function FunnelRootPortal({ children }: { children: ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setRoot(document.querySelector<HTMLElement>('[data-v03-funnel]'));
  }, []);

  if (!root) {
    return null;
  }

  return createPortal(children, root);
}
