'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ONBOARDING_SCREEN_TIME_MAX,
  ONBOARDING_SCREEN_TIME_MIN,
  snapScreenTimeHours,
} from '@/lib/onboarding/childrenScreenTime';

const THUMB_SIZE = 21;
const TRACK_HEIGHT = 4;
const TRACK_TOP = 11;
const THUMB_TOP = TRACK_TOP + TRACK_HEIGHT / 2 - THUMB_SIZE / 2;
/** Figma design track width — used until measured. */
const DEFAULT_TRACK_WIDTH = 291;

type ChildScreenTimeSliderProps = {
  value: number;
  onChange: (hours: number) => void;
  onDragChange?: (hours: number) => void;
  onDragEnd?: () => void;
};

function thumbLeftPx(hours: number, trackWidth: number): number {
  const range = ONBOARDING_SCREEN_TIME_MAX - ONBOARDING_SCREEN_TIME_MIN;
  const t = (hours - ONBOARDING_SCREEN_TIME_MIN) / range;
  return t * (trackWidth - THUMB_SIZE);
}

function fillWidthPx(hours: number, trackWidth: number): number {
  return thumbLeftPx(hours, trackWidth) + THUMB_SIZE / 2;
}

/** 0–12 hours; track fills parent width; snaps to 0.5h on release. */
export function ChildScreenTimeSlider({
  value,
  onChange,
  onDragChange,
  onDragEnd,
}: ChildScreenTimeSliderProps) {
  const safeValue = snapScreenTimeHours(value);
  const [liveValue, setLiveValue] = useState<number | null>(null);
  const [trackWidth, setTrackWidth] = useState(DEFAULT_TRACK_WIDTH);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const displayValue = liveValue ?? safeValue;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setTrackWidth(w);
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const commitValue = (raw: number) => {
    const snapped = snapScreenTimeHours(raw);
    draggingRef.current = false;
    setLiveValue(null);
    onDragEnd?.();
    onChange(snapped);
  };

  return (
    <div dir="ltr" className="flex w-full min-w-0 flex-col items-stretch">
      <div ref={trackRef} className="relative h-[21px] w-full min-w-0">
        <div
          className="absolute left-0 right-0 rounded-full bg-white/25"
          style={{ top: TRACK_TOP, height: TRACK_HEIGHT }}
          aria-hidden
        />
        <div
          className="absolute left-0 rounded-full bg-v03-turquoise-300"
          style={{
            top: TRACK_TOP,
            width: fillWidthPx(displayValue, trackWidth),
            height: TRACK_HEIGHT,
          }}
          aria-hidden
        />
        <div
          className="absolute h-[21px] w-[21px] rounded-full bg-white"
          style={{
            left: thumbLeftPx(displayValue, trackWidth),
            top: THUMB_TOP,
          }}
          aria-hidden
        />
        <input
          type="range"
          min={ONBOARDING_SCREEN_TIME_MIN}
          max={ONBOARDING_SCREEN_TIME_MAX}
          step="any"
          value={displayValue}
          onPointerDown={() => {
            draggingRef.current = true;
          }}
          onPointerUp={(e) => commitValue(Number(e.currentTarget.value))}
          onPointerCancel={(e) => commitValue(Number(e.currentTarget.value))}
          onChange={(e) => {
            const raw = Number(e.target.value);
            if (draggingRef.current) {
              setLiveValue(raw);
              onDragChange?.(raw);
              return;
            }
            commitValue(raw);
          }}
          aria-valuemin={ONBOARDING_SCREEN_TIME_MIN}
          aria-valuemax={ONBOARDING_SCREEN_TIME_MAX}
          aria-valuenow={safeValue}
          aria-label="שעות מסך ביום"
          className="absolute inset-0 h-[21px] w-full cursor-pointer opacity-0"
        />
      </div>
      <div className="flex w-full items-start justify-between">
        <span className="font-simpler text-base font-normal leading-[30px] text-v03-green-100">
          {ONBOARDING_SCREEN_TIME_MIN}
        </span>
        <span className="font-simpler text-base font-normal leading-[30px] text-v03-green-100">
          {ONBOARDING_SCREEN_TIME_MAX}
        </span>
      </div>
    </div>
  );
}
