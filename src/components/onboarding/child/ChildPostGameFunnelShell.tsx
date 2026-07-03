'use client';

import type { ReactNode } from 'react';
import { ChildPostGameGrid } from '@/components/onboarding/child/ChildPostGameGrid';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
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
    <div dir="rtl" className="relative h-full w-full overflow-hidden">
      <div
        className="pointer-events-none z-0 bg-v03-green-900"
        style={bleedStyle}
        aria-hidden
      />
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
      ) : (
        <OnboardingMintGlow className="z-[1]" />
      )}
      <ChildPostGameGrid enabled={showGrid} />
      <div className="relative z-[10] h-full w-full">{children}</div>
    </div>
  );
}
