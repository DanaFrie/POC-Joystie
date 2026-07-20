'use client';

type DashboardFigmaBackgroundProps = {
  /**
   * When true (default), paint only the fixed top mint — bottom glows belong
   * in scroll content via `DashboardBottomGlows`.
   * When `embedded`, fill the scroll-content box (top + bottom) so bg scrolls
   * with the page as one surface.
   */
  mode?: 'fixedTop' | 'embedded';
  /** @deprecated use mode — when false, top mint only (legacy). */
  showBottomGlows?: boolean;
};

/** Figma dashboard — mint / cyan blur ellipses on #061C1E. */
export function DashboardFigmaBackground({
  mode,
  showBottomGlows = true,
}: DashboardFigmaBackgroundProps) {
  const embedded = mode === 'embedded' || (mode == null && showBottomGlows);

  return (
    <div
      className={
        embedded
          ? 'pointer-events-none absolute inset-0 z-0 min-h-full w-full overflow-hidden'
          : 'pointer-events-none absolute inset-0 z-0 h-full w-full min-w-full overflow-hidden'
      }
      style={{ background: '#061C1E' }}
      aria-hidden
    >
      {/* Top mint */}
      <div
        className="absolute rounded-full"
        style={{
          width: 176,
          height: 176,
          left: 100,
          top: -90,
          background: 'rgba(0, 231, 162, 0.45)',
          filter: 'blur(100px)',
        }}
      />
      {embedded ? <DashboardBottomGlows /> : null}
    </div>
  );
}

/**
 * Turquoise + mint bottom ellipses — sit at the bottom of scroll content
 * so they stay visible when the user reaches the end of the dashboard.
 */
export function DashboardBottomGlows() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[320px] overflow-visible"
      aria-hidden
    >
      {/* Bottom-left cyan / turquoise */}
      <div
        className="absolute rounded-full"
        style={{
          width: 252,
          height: 252,
          left: -116,
          bottom: -80,
          background: '#00D5F2',
          filter: 'blur(231.61764526367188px)',
        }}
      />
      {/* Bottom-right mint */}
      <div
        className="absolute rounded-full"
        style={{
          width: 176,
          height: 176,
          left: 254,
          bottom: -99,
          background: '#00E7A2',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
}
