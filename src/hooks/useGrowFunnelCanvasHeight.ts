'use client';

import { useLayoutEffect, type RefObject } from 'react';
import { V03_ACTIVE_CANVAS_HEIGHT_VAR } from '@/constants/funnel-vertical-layout';
import { V03_SCREEN_HEIGHT } from '@/constants/v03-screen';

/**
 * Grow the funnel artboard to fit tall content so `FunnelViewport` page-scrolls
 * instead of nesting an inner scroll frame.
 */
export function useGrowFunnelCanvasHeight(
  contentRef: RefObject<HTMLElement | null>,
  deps: unknown[] = []
) {
  useLayoutEffect(() => {
    const content = contentRef.current;
    const funnelRoot = document.querySelector('[data-v03-funnel]');
    if (!content || !(funnelRoot instanceof HTMLElement)) {
      return undefined;
    }

    const sync = () => {
      const measured = Math.max(content.scrollHeight, content.offsetHeight);
      const nextHeight = Math.max(V03_SCREEN_HEIGHT, Math.ceil(measured));
      const prev = funnelRoot.style.getPropertyValue(V03_ACTIVE_CANVAS_HEIGHT_VAR);
      if (prev === `${nextHeight}px`) {
        return;
      }
      funnelRoot.style.setProperty(V03_ACTIVE_CANVAS_HEIGHT_VAR, `${nextHeight}px`);
      window.dispatchEvent(new Event('resize'));
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(content);

    return () => {
      observer.disconnect();
      funnelRoot.style.removeProperty(V03_ACTIVE_CANVAS_HEIGHT_VAR);
      window.dispatchEvent(new Event('resize'));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller-controlled deps
  }, deps);
}
