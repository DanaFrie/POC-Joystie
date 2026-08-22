'use client';

import type { ReactNode } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { SignupChildInviteWaitingMarqueeBleed } from '@/components/onboarding/signup/SignupChildInviteWaitingMarqueeBleed';
import { FunnelRootPortal } from '@/components/ui/FunnelRootPortal';
import { useFunnelLayoutReady } from '@/components/ui/FunnelViewportContext';

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
  /** Override fill color (e.g. dark loading). */
  fillClassName?: string;
  /**
   * `funnel` — portal onto funnel root (escapes 375×812 scale / letterbox).
   * `viewport` — fixed 100dvh (dashboard loaders).
   * `auto` — viewport outside FunnelViewport; funnel when measured.
   */
  cover?: 'funnel' | 'viewport' | 'auto';
};

function WaitingLayers({
  children,
  showBackButton,
  staticLayout,
  fillClassName,
  ariaBusy,
}: {
  children: ReactNode;
  showBackButton?: ReactNode;
  staticLayout: boolean;
  fillClassName: string;
  ariaBusy?: boolean;
}) {
  return (
    <>
      <div
        className={`pointer-events-none absolute inset-0 z-0 ${fillClassName}`}
        aria-hidden
      />
      {/* inset-0 grid — do not use funnel bleed math (wrong units outside scaled canvas). */}
      <div
        className="v03-onboarding-grid-layer pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
      />
      <OnboardingMintGlow className="z-[8]" fit="viewport" />
      {showBackButton}
      <div
        className={`relative z-[10] h-full min-h-0 w-full overflow-hidden${staticLayout ? '' : ' v03-funnel-screen'}`}
        aria-busy={ariaBusy || undefined}
        aria-live="polite"
      >
        {children}
      </div>
      <SignupChildInviteWaitingMarqueeBleed />
    </>
  );
}

function WaitingFrame({
  children,
  fillClassName,
  zIndex,
  ariaBusy,
  mode,
}: {
  children: ReactNode;
  fillClassName: string;
  zIndex: number;
  ariaBusy?: boolean;
  mode: 'fixed' | 'absolute';
}) {
  return (
    <div
      dir="rtl"
      className={`${mode === 'fixed' ? 'fixed' : 'absolute'} inset-0 overflow-hidden ${fillClassName}`}
      style={
        mode === 'fixed'
          ? { zIndex, width: '100%', height: '100svh' }
          : { zIndex }
      }
      aria-label={ariaBusy ? 'טוען' : undefined}
      role={ariaBusy ? 'status' : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Shared waiting shell (empty / logo GIF, wordmark marquee, payment verify copy).
 * Always paints true 100dvh — never the scaled 812 canvas (that letterboxes on S9+ / tall phones).
 */
export function OnboardingWaitingScreenShell({
  children,
  showBackButton,
  zIndex = 10,
  ariaBusy,
  staticLayout = false,
  fillClassName = 'bg-v03-green-900',
  cover = 'auto',
}: OnboardingWaitingScreenShellProps) {
  const layoutReady = useFunnelLayoutReady();
  const useFixedViewport =
    cover === 'viewport' || (cover === 'auto' && !layoutReady);

  const layers = (
    <WaitingLayers
      showBackButton={showBackButton}
      staticLayout={staticLayout}
      fillClassName={fillClassName}
      ariaBusy={ariaBusy}
    >
      {children}
    </WaitingLayers>
  );

  if (useFixedViewport) {
    return (
      <WaitingFrame
        mode="fixed"
        fillClassName={fillClassName}
        zIndex={Math.max(zIndex, 50)}
        ariaBusy={ariaBusy}
      >
        {layers}
      </WaitingFrame>
    );
  }

  // Inside FunnelViewport: portal onto funnel root so transform:scale cannot letterbox us.
  return (
    <FunnelRootPortal>
      <WaitingFrame
        mode="absolute"
        fillClassName={fillClassName}
        zIndex={zIndex}
        ariaBusy={ariaBusy}
      >
        {layers}
      </WaitingFrame>
    </FunnelRootPortal>
  );
}
