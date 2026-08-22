import type { CSSProperties, ReactNode } from 'react';

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Kept for call-site compat — entrance stagger is CSS-only when used */
  delayMs?: number;
  /** Kept for call-site compat */
  immediate?: boolean;
  variant?: 'float' | 'fade';
  dir?: 'rtl' | 'ltr';
};

/**
 * Server-only layout wrapper — no client JS, no post-hydration hide.
 * Content is visible in HTML immediately (critical for slow App Hosting networks).
 */
export function LandingReveal({
  children,
  className = '',
  id,
  delayMs = 0,
  immediate = false,
  variant = 'float',
  dir,
}: LandingRevealProps) {
  const style = {
    ['--landing-reveal-delay' as string]: `${delayMs}ms`,
  } as CSSProperties;

  const variantClass = variant === 'fade' ? ' landing-reveal--fade' : '';

  return (
    <div
      id={id}
      dir={dir}
      className={`landing-reveal is-in${variantClass}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}
