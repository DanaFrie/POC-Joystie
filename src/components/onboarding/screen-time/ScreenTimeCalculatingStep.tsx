'use client';

import { useEffect, useRef, useState } from 'react';
import { ScreenTimeProgressRing } from '@/components/onboarding/screen-time/ScreenTimeProgressRing';

const PROGRESS_MS = 3500;

type ScreenTimeCalculatingStepProps = {
  onComplete: () => void;
};

/** Figma loading — grid visible, ring + % animate 0→100, then `onComplete`. */
export function ScreenTimeCalculatingStep({
  onComplete,
}: ScreenTimeCalculatingStepProps) {
  const [percent, setPercent] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / PROGRESS_MS);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      setPercent(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onCompleteRef.current();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <section
        className="absolute inset-0 z-[10] flex flex-col items-center justify-center gap-[39px] px-v03-gutter"
        aria-label="מחשבים זמן מסך"
        aria-busy="true"
      >
        <ScreenTimeProgressRing percent={percent} />

        <div className="flex w-full max-w-v03-content flex-col items-center">
          <p className="w-full text-center font-simpler text-[24px] font-normal leading-[30px] text-v03-green-200">
            כמה רגעים
          </p>
          <p className="w-full text-center font-simpler text-[30px] font-black leading-[34.5px] text-white [text-shadow:0_0_20px_rgba(255,255,255,0.5)]">
            מחשבים זמן מסך...
          </p>
        </div>
      </section>
    </>
  );
}
