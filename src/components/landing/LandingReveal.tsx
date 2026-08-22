'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Stagger delay after the element enters view */
  delayMs?: number;
  /** Float in on mount (hero / above-the-fold) */
  immediate?: boolean;
  /** `fade` = opacity only (gentle); default floats up */
  variant?: 'float' | 'fade';
  /** Fires once when the reveal becomes visible */
  onVisible?: () => void;
  dir?: 'rtl' | 'ltr';
};

/**
 * SSR and hydration keep content visible — no post-hydration hide for off-screen blocks.
 * Entrance animation runs once when the block enters the viewport (or immediately).
 */
export function LandingReveal({
  children,
  className = '',
  id,
  delayMs = 0,
  immediate = false,
  variant = 'float',
  onVisible,
  dir,
}: LandingRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let done = false;
    const fireVisible = () => {
      if (done) return;
      done = true;
      onVisibleRef.current?.();
    };

    if (immediate) {
      el.classList.add('is-in');
      fireVisible();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          el.classList.add('is-in');
          fireVisible();
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' }
    );

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const alreadyOnScreen = rect.bottom > 0 && rect.top < vh;

    if (alreadyOnScreen) {
      el.classList.add('is-in');
      fireVisible();
      return;
    }

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate]);

  const style = {
    ['--landing-reveal-delay' as string]: `${delayMs}ms`,
  } as CSSProperties;

  const variantClass = variant === 'fade' ? ' landing-reveal--fade' : '';
  const initialClass = immediate ? ' is-in' : '';

  return (
    <div
      ref={ref}
      id={id}
      dir={dir}
      className={`landing-reveal${variantClass}${initialClass}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}
