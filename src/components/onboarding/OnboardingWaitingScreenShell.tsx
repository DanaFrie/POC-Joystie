'use client';

import { useLayoutEffect, type ReactNode } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { SignupChildInviteWaitingMarqueeBleed } from '@/components/onboarding/signup/SignupChildInviteWaitingMarqueeBleed';
import { useFunnelViewportMetrics } from '@/components/ui/FunnelViewportContext';
import { V03_ACTIVE_CANVAS_HEIGHT_VAR } from '@/constants/funnel-vertical-layout';

type OnboardingWaitingScreenShellProps = {
  children: ReactNode;
  showBackButton?: ReactNode;
  zIndex?: number;
  ariaBusy?: boolean;
  /** When true, skip funnel slide-in — headline-only updates on the same shell. */
  staticLayout?: boolean;
  /**
   * @deprecated Grid + mint ellipse always render inside this shell (parent
   * backdrops are covered by the full-bleed fill). Kept for call-site compat.
   */
  skipMintGlow?: boolean;
};

function viewportFillCanvasHeightPx(viewportHeight: number, scale: number): number {
  return Math.max(1, Math.round(viewportHeight / Math.max(scale, 0.0001)));
}

/**
 * Shared waiting shell (empty / logo GIF, wordmark marquee, payment verify copy).
 * Full-bleed green + grid + mint ellipse; canvas locked to 100vh.
 */
export function OnboardingWaitingScreenShell({
  children,
  showBackButton,
  zIndex = 10,
  ariaBusy,
  staticLayout = false,
}: OnboardingWaitingScreenShellProps) {
  const { viewportHeight, scale } = useFunnelViewportMetrics();
  const fillCanvasHeightPx = viewportFillCanvasHeightPx(viewportHeight, scale);

  useLayoutEffect(() => {
    const roots = [
      document.querySelector('[data-v03-funnel]'),
      document.querySelector('[data-v03-funnel-canvas]'),
    ].filter((n): n is HTMLElement => n instanceof HTMLElement);

    if (roots.length === 0) return undefined;

    for (const root of roots) {
      root.style.setProperty(V03_ACTIVE_CANVAS_HEIGHT_VAR, `${fillCanvasHeightPx}px`);
    }
    window.dispatchEvent(new Event('resize'));

    return () => {
      for (const root of roots) {
        root.style.removeProperty(V03_ACTIVE_CANVAS_HEIGHT_VAR);
      }
      window.dispatchEvent(new Event('resize'));
    };
  }, [fillCanvasHeightPx]);

  return (
    <div
      dir="rtl"
      className="absolute inset-0 overflow-visible bg-v03-green-900"
      style={{ zIndex }}
      aria-busy={ariaBusy}
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-v03-green-900" aria-hidden />
      <div
        className="v03-onboarding-grid-layer pointer-events-none fixed inset-0 z-[1]"
        aria-hidden
      />
      <OnboardingMintGlow className="z-[8]" />
      {showBackButton}
      <div
        className={`relative z-[10] h-full min-h-0 w-full overflow-hidden${staticLayout ? '' : ' v03-funnel-screen'}`}
      >
        {children}
      </div>
      <SignupChildInviteWaitingMarqueeBleed />
    </div>
  );
}
