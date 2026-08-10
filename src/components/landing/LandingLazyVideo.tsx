'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

/**
 * Muted loop video — network fetch only when near the viewport.
 * Pauses when scrolled away to save decode/battery on mobile.
 */
export function LandingLazyVideo({
  src,
  className,
  style,
  'aria-label': ariaLabel,
}: {
  src: string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (!loadedRef.current) {
            loadedRef.current = true;
            el.src = src;
            el.load();
          }
          void el.play().catch(() => {
            /* autoplay may be blocked; muted+playsInline usually OK */
          });
        } else {
          el.pause();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      muted
      loop
      playsInline
      preload="none"
      aria-label={ariaLabel}
    />
  );
}
