'use client';

import { useCallback, useRef, useState } from 'react';

export type SegmentPlaybackRateFn = (
  /** Zero-based index of the segment about to play. */
  segmentIndex: number,
  segmentCount: number
) => number;

export type SegmentRangeFn = (
  segmentIndex: number,
  segmentCount: number,
  duration: number
) => { start: number; end: number };

function equalSegmentRange(
  segmentIndex: number,
  segmentCount: number,
  duration: number
): { start: number; end: number } {
  const segmentDuration = duration / segmentCount;
  const start = segmentIndex * segmentDuration;
  const end = Math.min((segmentIndex + 1) * segmentDuration, duration);
  return { start, end };
}

/** Prefer rAF over `timeupdate` — browsers throttle timeupdate (~4Hz) and it feels laggy. */
function watchUntilTime(
  video: HTMLVideoElement,
  endTime: number,
  onReach: () => void
): () => void {
  let rafId = 0;
  let cancelled = false;

  const tick = () => {
    if (cancelled) return;
    if (video.currentTime >= endTime - 0.02 || video.ended) {
      onReach();
      return;
    }
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
  };
}

function seekThenPlay(video: HTMLVideoElement, startTime: number): Promise<void> {
  return new Promise((resolve) => {
    const nearEnough = Math.abs(video.currentTime - startTime) < 0.04;
    const startPlayback = () => {
      void video.play().then(resolve).catch(() => resolve());
    };

    if (nearEnough && !video.seeking) {
      startPlayback();
      return;
    }

    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      startPlayback();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = startTime;
  });
}

/**
 * Advance a single video in time slices per tap (equal by default; custom ranges optional).
 * One pending tap may queue while a segment plays so rapid taps stay responsive.
 */
export function useSegmentedVideoTap(
  segmentCount: number,
  onAllSegmentsComplete: () => void,
  getPlaybackRate?: SegmentPlaybackRateFn,
  getSegmentRange: SegmentRangeFn = equalSegmentRange
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const segmentIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const pendingTapRef = useRef(false);
  const stopWatchRef = useRef<(() => void) | null>(null);
  const playNextSegmentRef = useRef<() => void>(() => {});
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isPlayingSegment, setIsPlayingSegment] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const markVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  const playNextSegment = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (segmentIndexRef.current >= segmentCount) return;

    if (isPlayingRef.current) {
      pendingTapRef.current = true;
      return;
    }

    const runSegment = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;

      const currentIndex = segmentIndexRef.current;
      const nextIndex = currentIndex + 1;
      const { start, end } = getSegmentRange(currentIndex, segmentCount, video.duration);
      const startTime = Math.max(0, start);
      const endTime = Math.min(end, video.duration);
      const playbackRate = getPlaybackRate?.(currentIndex, segmentCount) ?? 1;

      isPlayingRef.current = true;
      setIsPlayingSegment(true);
      video.playbackRate = playbackRate;

      const finishSegment = () => {
        stopWatchRef.current?.();
        stopWatchRef.current = null;
        video.pause();
        video.playbackRate = 1;
        segmentIndexRef.current = nextIndex;
        setSegmentIndex(nextIndex);
        isPlayingRef.current = false;
        setIsPlayingSegment(false);

        if (nextIndex >= segmentCount) {
          pendingTapRef.current = false;
          onAllSegmentsComplete();
          return;
        }

        if (pendingTapRef.current) {
          pendingTapRef.current = false;
          queueMicrotask(() => playNextSegmentRef.current());
        }
      };

      void seekThenPlay(video, startTime).then(() => {
        if (segmentIndexRef.current !== currentIndex) return;
        stopWatchRef.current?.();
        stopWatchRef.current = watchUntilTime(video, endTime, finishSegment);
      });
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      runSegment();
      return;
    }

    const onMetadata = () => {
      video.removeEventListener('loadedmetadata', onMetadata);
      runSegment();
    };
    video.addEventListener('loadedmetadata', onMetadata);
  }, [
    getPlaybackRate,
    getSegmentRange,
    onAllSegmentsComplete,
    segmentCount,
  ]);

  playNextSegmentRef.current = playNextSegment;

  return {
    videoRef,
    segmentIndex,
    isPlayingSegment,
    videoReady,
    markVideoReady,
    playNextSegment,
  };
}
