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

/**
 * Advance a single video in time slices per tap (equal by default; custom ranges optional).
 */
export function useSegmentedVideoTap(
  segmentCount: number,
  onAllSegmentsComplete: () => void,
  getPlaybackRate?: SegmentPlaybackRateFn,
  getSegmentRange: SegmentRangeFn = equalSegmentRange
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const segmentIndexRef = useRef(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isPlayingSegment, setIsPlayingSegment] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const markVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  const playNextSegment = useCallback(() => {
    const video = videoRef.current;
    if (!video || isPlayingSegment) return;
    if (segmentIndexRef.current >= segmentCount) return;

    const runSegment = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;

      const currentIndex = segmentIndexRef.current;
      const nextIndex = currentIndex + 1;
      const { start, end } = getSegmentRange(currentIndex, segmentCount, video.duration);
      const startTime = Math.max(0, start);
      const endTime = Math.min(end, video.duration);
      const playbackRate = getPlaybackRate?.(currentIndex, segmentCount) ?? 1;

      setIsPlayingSegment(true);
      video.playbackRate = playbackRate;
      video.currentTime = startTime;

      const finishSegment = () => {
        video.pause();
        video.playbackRate = 1;
        video.removeEventListener('timeupdate', onTimeUpdate);
        segmentIndexRef.current = nextIndex;
        setSegmentIndex(nextIndex);
        setIsPlayingSegment(false);
        if (nextIndex >= segmentCount) {
          onAllSegmentsComplete();
        }
      };

      const onTimeUpdate = () => {
        if (video.currentTime >= endTime - 0.04) {
          finishSegment();
        }
      };

      video.addEventListener('timeupdate', onTimeUpdate);
      void video.play().catch(() => {
        finishSegment();
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
    isPlayingSegment,
    onAllSegmentsComplete,
    segmentCount,
  ]);

  return {
    videoRef,
    segmentIndex,
    isPlayingSegment,
    videoReady,
    markVideoReady,
    playNextSegment,
  };
}
