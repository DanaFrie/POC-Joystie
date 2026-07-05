'use client';

import { useLayoutEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFunnelLayoutReady } from '@/components/ui/FunnelViewportContext';

/** Render into funnel DOM — default root for footers; hero slot for signup/login mountain art. */
export function FunnelRootPortal({
  children,
  rootSelector = '[data-v03-funnel]',
}: {
  children: ReactNode;
  rootSelector?: string;
}) {
  const layoutReady = useFunnelLayoutReady();
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setRoot(document.querySelector<HTMLElement>(rootSelector));
  }, [rootSelector]);

  if (!root || !layoutReady) {
    return null;
  }

  return createPortal(children, root);
}
