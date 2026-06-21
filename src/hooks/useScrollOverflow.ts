'use client';

import { useEffect, useState, type RefObject } from 'react';

/** True when the element's content exceeds its visible height. */
export function useScrollOverflow(
  ref: RefObject<HTMLElement | null>,
  deps: unknown[] = []
): boolean {
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      setOverflows(element.scrollHeight > element.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);

    for (const child of Array.from(element.children)) {
      observer.observe(child);
    }

    return () => observer.disconnect();
  }, [ref, ...deps]);

  return overflows;
}
