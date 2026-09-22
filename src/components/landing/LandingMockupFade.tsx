'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type LandingMockupFadeProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Fades mockup imagery in when it reaches ~25% from the top of the viewport
 * (Introducing / features bullets). Opacity-only — no layout shift.
 */
export function LandingMockupFade({ children, className = '' }: LandingMockupFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      {
        /* Band starting ~25% from top — fires when mockup reaches that line */
        root: null,
        rootMargin: '-25% 0px -45% 0px',
        threshold: 0,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`landing-mockup-fade${visible ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  );
}
