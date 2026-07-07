'use client';

import { useEffect, useRef, useState } from 'react';
import { ChildPostGameFunnelShell } from '@/components/onboarding/child/ChildPostGameFunnelShell';
import { ScreenTimeProgressRing } from '@/components/onboarding/screen-time/ScreenTimeProgressRing';
import {
  FunnelStepForeground,
  FunnelStepSection,
} from '@/components/ui/funnel-layout';
import { CHILD_SHARED_PHOTO_PREPARING_MS } from '@/constants/child-post-game-layout';
import { CHILD_SHARED_PHOTO_PREPARING_SUBTITLE } from '@/lib/onboarding/childPostGameCopy';

type ChildSharedPhotoPreparingStepProps = {
  onComplete: () => void;
  /** Cloud compose task — loader waits for this + min display time. */
  task?: Promise<unknown> | null;
  /** When set (0–100), ring follows service progress instead of time-only easing. */
  progressPercent?: number | null;
};

/** Figma loading — ring tracks cloud task progress when provided. */
export function ChildSharedPhotoPreparingStep({
  onComplete,
  task = null,
  progressPercent = null,
}: ChildSharedPhotoPreparingStepProps) {
  const [percent, setPercent] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (progressPercent == null) return;
    setPercent(progressPercent);
  }, [progressPercent]);

  useEffect(() => {
    let cancelled = false;
    const start = performance.now();
    let raf = 0;

    void (async () => {
      await Promise.all([
        task ?? Promise.resolve(),
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, CHILD_SHARED_PHOTO_PREPARING_MS);
        }),
      ]);
      if (!cancelled) onCompleteRef.current();
    })();

    if (progressPercent != null) {
      return () => {
        cancelled = true;
      };
    }

    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / CHILD_SHARED_PHOTO_PREPARING_MS);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      setPercent(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [progressPercent, task]);

  return (
    <ChildPostGameFunnelShell ellipse="upper" showGrid>
      <FunnelStepForeground fitViewport distribution="center" padTopPx={0} padBottomPx={34}>
        <FunnelStepSection
          className="flex flex-col items-center justify-center"
          aria-busy="true"
          aria-label="מכינים תמונה משותפת"
        >
          <div className="flex w-full flex-col items-center gap-[39px]">
            <ScreenTimeProgressRing percent={percent} />

            <div className="flex w-full max-w-v03-content flex-col items-center">
              <p className="w-full text-center font-simpler text-[24px] font-normal leading-[30px] text-v03-green-200">
                כמה רגעים
              </p>
              <p className="w-full text-center font-simpler text-[30px] font-black leading-[33px] text-white [text-shadow:0_0_20px_rgba(255,255,255,0.5)]">
                {CHILD_SHARED_PHOTO_PREPARING_SUBTITLE}
              </p>
            </div>
          </div>
        </FunnelStepSection>
      </FunnelStepForeground>
    </ChildPostGameFunnelShell>
  );
}
