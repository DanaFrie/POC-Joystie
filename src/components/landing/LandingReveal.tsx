'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

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
 * Soft float-up + fade when scrolled into view (or on mount if `immediate`).
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
        // Root is inset so a hit means the block is in the main reading band —
        // not just peeking at the bottom edge of the screen.
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
        }
      },
      {
        threshold: 0,
        // Top/bottom inset: animate only once the user has scrolled to the section.
        rootMargin: '-14% 0px -22% 0px',
      }
    );

    observer.observe(el);

    // Hash nav / late hydration: reveal only if already in the same reading band
    const checkAlreadyVisible = () => {
      const rect = el.getBoundingClientRect();
      if (rect.height <= 0 && rect.width <= 0) return;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const bandTop = vh * 0.14;
      const bandBottom = vh * 0.78;
      const overlapsBand = rect.top < bandBottom && rect.bottom > bandTop;
      if (overlapsBand) {
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
      id={id}
      dir={dir}
      className={`landing-reveal${variantClass}${visible ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}
