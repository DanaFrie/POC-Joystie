'use client';

import { useRef, useState } from 'react';
import {
  ONBOARDING_SCREEN_TIME_MAX,
  ONBOARDING_SCREEN_TIME_MIN,
  snapScreenTimeHours,
} from '@/lib/onboarding/childrenScreenTime';

const TRACK_WIDTH = 291;
const THUMB_SIZE = 21;
const TRACK_HEIGHT = 4;
const TRACK_TOP = 11;
const THUMB_TOP = TRACK_TOP + TRACK_HEIGHT / 2 - THUMB_SIZE / 2;

type ChildScreenTimeSliderProps = {
  value: number;
  onChange: (hours: number) => void;
  onDragChange?: (hours: number) => void;
  onDragEnd?: () => void;
};

function thumbLeftPx(hours: number): number {
  const range = ONBOARDING_SCREEN_TIME_MAX - ONBOARDING_SCREEN_TIME_MIN;
  const t = (hours - ONBOARDING_SCREEN_TIME_MIN) / range;
  return t * (TRACK_WIDTH - THUMB_SIZE);
}

function fillWidthPx(hours: number): number {
  return thumbLeftPx(hours) + THUMB_SIZE / 2;
}

/** 0–12 hours; smooth drag, snaps to 0.5h steps on release. */
export function ChildScreenTimeSlider({
  value,
  onChange,
  onDragChange,
  onDragEnd,
}: ChildScreenTimeSliderProps) {
  const safeValue = snapScreenTimeHours(value);
  const [liveValue, setLiveValue] = useState<number | null>(null);
  const draggingRef = useRef(false);

  const displayValue = liveValue ?? safeValue;

  const commitValue = (raw: number) => {
    const snapped = snapScreenTimeHours(raw);
    draggingRef.current = false;
    setLiveValue(null);
    onDragEnd?.();
    onChange(snapped);
  };

  return (
    <div dir="ltr" className="flex w-full flex-col items-stretch">
      <div className="relative h-[21px] w-full max-w-[291px]">
        <div
          className="absolute left-0 w-[291px] rounded-full bg-white/25"
          style={{ top: TRACK_TOP, height: TRACK_HEIGHT }}
          aria-hidden
        />
        <div
          className="absolute left-0 rounded-full bg-v03-turquoise-300"
          style={{
            top: TRACK_TOP,
            width: fillWidthPx(displayValue),
            height: TRACK_HEIGHT,
          }}
          aria-hidden
        />
        <div
          className="absolute h-[21px] w-[21px] rounded-full bg-white"
          style={{ left: thumbLeftPx(displayValue), top: THUMB_TOP }}
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
      <div className="flex w-full max-w-[291px] items-start justify-between">
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
