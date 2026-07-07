'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useFunnelProportionalTopPx } from '@/components/ui/FunnelViewportContext';
import {
  BALL_GAME_COUNTDOWN_TOTAL_MS,
  ballGameCountdownStep,
  type BallGameCountdownStep,
} from '@/constants/ball-game-countdown';

type BallGameCountdownOverlayProps = {
  countdownAt: string;
};

/** Figma canvas coords — shared headline slot for מוכנים? / צאו לדרך!; numbers below. */
const HEADLINE_TOP_PX = 281;
const NUMBER_TOP_PX = 359;
const NUMBER_LEFT_PX = 118;
const NUMBER_WIDTH_PX = 131;
const HEADLINE_WIDTH_PX = 327;

function CountdownHeadlineSlot({
  children,
  flashKey,
  className,
  style,
  topPx,
}: {
  children: ReactNode;
  flashKey: number;
  className: string;
  style?: React.CSSProperties;
  topPx: number;
}) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={{ top: topPx, width: HEADLINE_WIDTH_PX }}
    >
      <p key={flashKey} className={className} style={style}>
        {children}
      </p>
    </div>
  );
}

/** First-rally countdown — מוכנים? → 3 → 2 → 1 → צאו לדרך! */
export function BallGameCountdownOverlay({ countdownAt }: BallGameCountdownOverlayProps) {
  const scaleY = useFunnelProportionalTopPx;
  const headlineTopPx = scaleY(HEADLINE_TOP_PX);
  const numberTopPx = scaleY(NUMBER_TOP_PX);
  const [step, setStep] = useState<BallGameCountdownStep>('ready');
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    const startMs = new Date(countdownAt).getTime();
    let lastStep: BallGameCountdownStep | null = null;

    const tick = () => {
      const elapsed = Date.now() - startMs;
      if (elapsed >= BALL_GAME_COUNTDOWN_TOTAL_MS) return;
      const next = ballGameCountdownStep(elapsed);
      if (next !== lastStep) {
        lastStep = next;
        setStep(next);
        setFlashKey((k) => k + 1);
      }
    };
    tick();
    const id = window.setInterval(tick, 40);
    return () => window.clearInterval(id);
  }, [countdownAt]);

  const showReady = step !== 'go';
  const showNumber = step === '3' || step === '2' || step === '1';

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[22]"
      aria-live="assertive"
      aria-atomic
    >
      {step === 'go' ? (
        <CountdownHeadlineSlot
          flashKey={flashKey}
          topPx={headlineTopPx}
          className="ball-game-countdown-flash text-center font-assistant font-black text-white"
          style={{
            fontSize: 60,
            lineHeight: '48px',
            letterSpacing: '-0.9px',
          }}
        >
          צאו לדרך!
        </CountdownHeadlineSlot>
      ) : (
        <>
          {showReady ? (
            <CountdownHeadlineSlot
              flashKey={flashKey}
              topPx={headlineTopPx}
              className="ball-game-countdown-flash text-center font-assistant font-normal text-white"
              style={{
                fontSize: 40,
                lineHeight: '48px',
                letterSpacing: '16.8px',
              }}
            >
              מוכנים?
            </CountdownHeadlineSlot>
          ) : null}
          {showNumber ? (
            <p
              key={`num-${flashKey}`}
              className="ball-game-countdown-flash absolute text-center font-assistant font-black text-white"
              style={{
                top: numberTopPx,
                left: NUMBER_LEFT_PX,
                width: NUMBER_WIDTH_PX,
                fontSize: 130.35,
                lineHeight: '156.42px',
              }}
            >
              {step}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
