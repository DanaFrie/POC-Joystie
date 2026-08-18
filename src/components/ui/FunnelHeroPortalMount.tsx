'use client';

/**
 * Hero bleed mount — above green bleed (z-0), below step UI (z-10).
 * SignupHeroFrame portals mountain + ellipses here.
 */
export function FunnelHeroPortalMount() {
  return (
    <div
      data-v03-funnel-hero
      className="pointer-events-none absolute inset-0 z-[5] overflow-visible"
      aria-hidden
    />
  );
}

/** Step content (forms, heroes in flow) — stacks above portaled mountain art. */
export function FunnelStepContentLayer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative z-[10] h-full w-full ${className}`}>{children}</div>
  );
}
