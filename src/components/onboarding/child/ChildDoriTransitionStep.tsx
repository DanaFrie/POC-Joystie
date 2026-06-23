'use client';

import { useCallback, useEffect, useRef } from 'react';
import { OnboardingMintGlow } from '@/components/onboarding/OnboardingMintGlow';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';
import {
  CHILD_DORI_TRANSITION_AUTO_MS,
  CHILD_ONBOARDING_ASSETS,
} from '@/constants/child-onboarding-assets';

/** Screen 7 — Figma 13147:5623. Brief transition between reveal and mission intro. */
export function ChildDoriTransitionStep({ onComplete }: { onComplete: () => void }) {
  const videoFillStyle = useFunnelFullBleed();
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      const timer = window.setTimeout(finish, CHILD_DORI_TRANSITION_AUTO_MS);
      return () => window.clearTimeout(timer);
    }

    const onEnded = () => finish();
    const onError = () => finish();

    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);

    void video.play().catch(() => finish());

    const fallback = window.setTimeout(finish, CHILD_DORI_TRANSITION_AUTO_MS + 2500);

    return () => {
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      window.clearTimeout(fallback);
    };
  }, [finish]);

  return (
    <div className="relative h-full w-full overflow-visible bg-transparent">
      <OnboardingMintGlow />
      <div className="absolute z-[1] overflow-hidden" style={videoFillStyle}>
        <video
          ref={videoRef}
          src={CHILD_ONBOARDING_ASSETS.doriRevealTransitionVideo}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover object-center"
          aria-hidden
        />
      </div>
    </div>
  );
}
