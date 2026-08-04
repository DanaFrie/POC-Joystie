'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
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
 * Soft float-up + fade when scrolled into view (or on mount if `immediate`).
 */
export function LandingReveal({
  children,
  className = '',
  delayMs = 0,
  immediate = false,
  variant = 'float',
  onVisible,
  dir,
}: LandingRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  useEffect(() => {
    if (!visible) return;
    onVisibleRef.current?.();
  }, [visible]);

  useEffect(() => {
    if (immediate) {
      const id = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(id);
    }

    const el = ref.current;
    if (!el) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setVisible(true);
      observer.disconnect();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0)) {
          reveal();
        }
      },
      // Only when the block actually enters the viewport — not while still below the fold
      { threshold: [0, 0.12], rootMargin: '0px 0px -12% 0px' },
    );

    observer.observe(el);

    // Hash nav / late hydration: reveal only if already meaningfully on-screen
    const checkAlreadyVisible = () => {
      const rect = el.getBoundingClientRect();
      if (rect.height <= 0 && rect.width <= 0) return;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(vh, rect.bottom);
      const visibleH = Math.max(0, visibleBottom - visibleTop);
      if (visibleH / Math.min(rect.height, vh) >= 0.12) {
        reveal();
      }
    };
    const raf = window.requestAnimationFrame(checkAlreadyVisible);
    const t = window.setTimeout(checkAlreadyVisible, 120);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [immediate]);

  const style = {
    ['--landing-reveal-delay' as string]: `${delayMs}ms`,
  } as CSSProperties;

  const variantClass = variant === 'fade' ? ' landing-reveal--fade' : '';

  return (
    <div
      ref={ref}
      dir={dir}
      className={`landing-reveal${variantClass}${visible ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}
