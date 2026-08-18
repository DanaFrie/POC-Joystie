'use client';

import {
  ballGamePaddleWidthNorm,
  paddlePixelRect,
  type ScaledBallGameLayout,
} from '@/lib/game/ballGameCourt';
import { BallGameScoreRing } from '@/components/onboarding/game/BallGameScoreRing';
import { parentCourtLabel } from '@/lib/onboarding/childBondingLabels';
import type { GamePlayerRole } from '@/types/game';

type BallGameCourtLayerProps = {
  role: GamePlayerRole;
  layout: ScaledBallGameLayout;
  parentGender: 'female' | 'male';
  childName: string;
  score?: number;
  showScoreRing?: boolean;
  showPaddles?: boolean;
};

/** Static ball-game court — background, labels, paddles, score ring, center line. */
export function BallGameCourtLayer({
  role,
  layout,
  parentGender,
  childName,
  score = 0,
  showScoreRing = true,
  showPaddles = true,
}: BallGameCourtLayerProps) {
  const parentCourtName = parentCourtLabel(parentGender);
  const selfName = role === 'parent' ? parentCourtName : childName;
  const rivalName = role === 'parent' ? childName : parentCourtName;
  const selfLabelTop = role === 'parent' ? layout.parentLabel.top : layout.childLabel.top;
  const rivalLabelTop = role === 'parent' ? layout.childLabel.top : layout.parentLabel.top;

  return (
    <>
      {showScoreRing ? (
        <div
          className="absolute z-[4] overflow-visible"
          style={{
            left: `calc(50% - ${layout.scoreRing.size / 2}px)`,
            top: layout.scoreRing.top,
            width: layout.scoreRing.size,
            height: layout.scoreRing.size,
          }}
        >
          <BallGameScoreRing score={score} sizePx={layout.scoreRing.size} />
        </div>
      ) : null}

      <div
        className="pointer-events-none absolute z-[6] h-0 -translate-x-1/2 border-t border-dashed border-white/20"
        style={{ left: '50%', top: layout.centerLine.top, width: layout.centerLine.width }}
        aria-hidden
      />

      <p
        className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-center font-assistant text-[24px] font-semibold leading-[41px] tracking-[-0.48px] text-[#00E7A2] opacity-60"
        style={{ top: rivalLabelTop, maxWidth: layout.parentLabel.width }}
      >
        {rivalName}
      </p>

      <p
        className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-center font-assistant text-[28px] font-black leading-[41px] tracking-[-0.6px] text-[#00E7A2]"
        style={{
          top: selfLabelTop,
          textShadow: '0 0 25px rgba(0, 255, 179, 0.5)',
        }}
      >
        {selfName}
      </p>

      {showPaddles ? (
        <>
          <div
            className="absolute z-10 rounded-[22px] bg-white/60"
            style={paddlePixelRect(layout, 'child', 0.5, ballGamePaddleWidthNorm(layout))}
          />
          <div
            className="absolute z-10 rounded-[22px] bg-white"
            style={paddlePixelRect(layout, 'parent', 0.5, ballGamePaddleWidthNorm(layout))}
          />
        </>
      ) : null}
    </>
  );
}
