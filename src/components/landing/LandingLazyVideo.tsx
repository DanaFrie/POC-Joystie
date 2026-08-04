'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

/**
 * Muted loop video that stays off the network until near the viewport.
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          void el.play().catch(() => {
            /* autoplay may be blocked; muted+playsInline usually OK */
          });
        } else {
          el.pause();
        }
      },
      { rootMargin: '120px 0px', threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-label={ariaLabel}
    />
  );
}
