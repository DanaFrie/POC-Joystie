'use client';

import { useEffect, useRef, useState } from 'react';
import { ScreenTimeProgressRing } from '@/components/onboarding/screen-time/ScreenTimeProgressRing';
import { CHILD_SHARED_PHOTO_PREPARING_MS } from '@/constants/child-post-game-layout';
import { CHILD_SHARED_PHOTO_PREPARING_SUBTITLE } from '@/lib/onboarding/childPostGameCopy';

type ChildSharedPhotoPreparingStepProps = {
  onComplete: () => void;
};

/** Figma loading — grid + mint glow from flow; ring animates 0→100. */
export function ChildSharedPhotoPreparingStep({
  onComplete,
}: ChildSharedPhotoPreparingStepProps) {
  const [percent, setPercent] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / CHILD_SHARED_PHOTO_PREPARING_MS);
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
    <section
      className="absolute inset-0 z-[10] flex flex-col items-center justify-center gap-[39px] px-v03-gutter"
      aria-label="מכינים תמונה משותפת"
      aria-busy="true"
    >
      <ScreenTimeProgressRing percent={percent} />

      <div className="flex w-full max-w-v03-content flex-col items-center">
        <p className="w-full text-center font-simpler text-[24px] font-normal leading-[30px] text-v03-green-200">
          כמה רגעים
        </p>
        <p className="w-full text-center font-simpler text-[30px] font-black leading-[33px] text-white [text-shadow:0_0_20px_rgba(255,255,255,0.5)]">
          {CHILD_SHARED_PHOTO_PREPARING_SUBTITLE}
        </p>
      </div>
    </section>
  );
}
