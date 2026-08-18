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
 * Visible in SSR / before JS. After hydration, off-screen blocks hide then
 * float in when they enter the viewport — no empty wait for chunk load.
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
  const [phase, setPhase] = useState<'in' | 'pending'>('in');
  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  useEffect(() => {
    if (immediate) {
      onVisibleRef.current?.();
      return;
    }

    const el = ref.current;
    if (!el) return;

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setPhase('in');
      onVisibleRef.current?.();
      observer.disconnect();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' }
    );

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const alreadyOnScreen = rect.bottom > 0 && rect.top < vh;

    if (alreadyOnScreen) {
      observer.disconnect();
      onVisibleRef.current?.();
      return;
    }

    setPhase('pending');
    observer.observe(el);

    return () => observer.disconnect();
  }, [immediate]);

  const style = {
    ['--landing-reveal-delay' as string]: `${delayMs}ms`,
  } as CSSProperties;

  const variantClass = variant === 'fade' ? ' landing-reveal--fade' : '';
  const phaseClass = phase === 'pending' ? ' is-pending' : ' is-in';

  return (
    <div
      ref={ref}
      id={id}
      dir={dir}
      className={`landing-reveal${variantClass}${phaseClass}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}
