'use client';

import type { ReactNode } from 'react';
import { ChildPostGameGrid } from '@/components/onboarding/child/ChildPostGameGrid';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';
import type { ChildPostGameEllipseVariant } from '@/constants/child-post-game-layout';
import { CHILD_POST_GAME_ELLIPSE } from '@/constants/child-post-game-layout';

/** Green-900 funnel shell — grid + configurable mint ellipse (Figma 13466 / 13674). */
export function ChildPostGameFunnelShell({
  ellipse = 'upper',
  showGrid = true,
  children,
}: {
  ellipse?: ChildPostGameEllipseVariant;
  showGrid?: boolean;
  children: ReactNode;
}) {
  const bleedStyle = useFunnelFullBleed();
  const upper = CHILD_POST_GAME_ELLIPSE.upper;

  return (
    <FunnelStepRoot fitViewport className="overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-visible" aria-hidden>
        <div className="bg-v03-green-900" style={bleedStyle} />
      </div>
      {ellipse === 'upper' ? (
        <div
          className="pointer-events-none absolute z-[1]"
          aria-hidden
          style={{
            top: upper.top,
            left: upper.left,
            width: upper.size,
            height: upper.size,
            borderRadius: upper.size,
            background: upper.fill,
            filter: `blur(${upper.blur}px)`,
          }}
        />
      ) : ellipse === 'lowerLeft' ? (
        <OnboardingMintGlow className="z-[1]" />
      ) : null}
      <ChildPostGameGrid enabled={showGrid} />
      <div className="relative z-[10] h-full w-full">{children}</div>
    </FunnelStepRoot>
  );
}
