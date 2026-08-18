'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

/** Applies backgroundImage only when near the viewport (heavy footer mountain). */
export function LandingLazyBackground({
  imageUrl,
  className,
  style,
  rootMargin = '280px 0px',
}: {
  imageUrl: string;
  className?: string;
  style?: CSSProperties;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setReady(true);
        io.disconnect();
      },
      { rootMargin, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={
        ready
          ? { ...style, backgroundImage: `url(${imageUrl})` }
          : { ...style, backgroundImage: undefined }
      }
      aria-hidden
    />
  );
}
