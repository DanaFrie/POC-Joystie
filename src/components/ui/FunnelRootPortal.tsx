'use client';

import { useLayoutEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFunnelLayoutReady } from '@/components/ui/FunnelViewportContext';

/** Render into `[data-v03-funnel]` so footers span the viewport, not the scaled 375px canvas. */
export function FunnelRootPortal({ children }: { children: ReactNode }) {
  const layoutReady = useFunnelLayoutReady();
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setRoot(document.querySelector<HTMLElement>('[data-v03-funnel]'));
  }, []);

  if (!root || !layoutReady) {
    return null;
  }

  return createPortal(children, root);
}
