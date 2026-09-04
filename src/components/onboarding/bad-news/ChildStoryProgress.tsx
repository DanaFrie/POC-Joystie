'use client';

import { useId } from 'react';

type ChildStoryProgressProps = {
  count: number;
  activeIndex: number;
  /** 0–1 purple fill on the active loader. */
  progress: number;
  className?: string;
  /** After auto story ends — ellipses only, no purple loader. */
  staticMode?: boolean;
};

/** Figma ellipse — 10px fill + drop-shadow (viewBox includes blur bleed). */
function StoryEllipse({
  filterId,
  fill = 'white',
}: {
  filterId: string;
  fill?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={27}
      height={27}
      viewBox="0 0 27 27"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <g filter={`url(#${filterId})`}>
        <circle cx="11.6665" cy="11.6667" r="5" fill={fill} />
      </g>
      <defs>
        <filter
          id={filterId}
          x="-0.000162482"
          y="2.06232e-05"
          width="26.6667"
          height="26.6667"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="1.66667" dy="1.66667" />
          <feGaussianBlur stdDeviation="4.16667" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

/** Figma 52×10 loader — purple fill grows right → left. */
function StoryLoader({
  progress,
  filterId,
}: {
  progress: number;
  filterId: string;
}) {
  const fill = Math.max(0, Math.min(1, progress));
  const fillWidth = 52 * fill;
  // Anchor on the right edge of the 52px track (x=8..60), expand leftward.
  const fillX = 8 + (52 - fillWidth);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={72}
      height={30}
      viewBox="0 0 72 30"
      fill="none"
      className="shrink-0 self-stretch"
      aria-hidden
    >
      <g filter={`url(#${filterId})`}>
        <rect x="8" y="8" width="52" height="10" rx="5" fill="white" />
      </g>
      {fillWidth > 0 ? (
        <rect
          x={fillX}
          y="8"
          width={fillWidth}
          height="10"
          rx="5"
          fill="#8C00FF"
        />
      ) : null}
      <defs>
        <filter
          id={filterId}
          x="0"
          y="0"
          width="72"
          height="30"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="2" dy="2" />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Story progress — RTL: first child on the right, advances left.
 * Auto: active = purple loader bar. Static/manual: dots only (active = purple).
 */
export function ChildStoryProgress({
  count,
  activeIndex,
  progress,
  className = '',
  /** After auto story ends — ellipses only; active dot is purple. */
  staticMode = false,
}: ChildStoryProgressProps) {
  const uid = useId().replace(/:/g, '');
  if (count < 1) return null;

  const fill = Math.max(0, Math.min(1, progress));
  const safeActive = Math.max(0, Math.min(activeIndex, count - 1));

  return (
    <div
      dir="rtl"
      className={`inline-flex items-center justify-center gap-[9px] ${className}`}
      role="tablist"
      aria-label="התקדמות בין הילדים"
    >
      {Array.from({ length: count }, (_, i) => {
        const isActive = i === safeActive;
        return (
          <span
            key={i}
            role="tab"
            aria-selected={isActive}
            className="inline-flex items-center justify-center"
          >
            {isActive && !staticMode ? (
              <StoryLoader
                progress={fill}
                filterId={`story-loader-${uid}-${i}`}
              />
            ) : (
              <StoryEllipse
                filterId={`story-dot-${uid}-${i}`}
                fill={isActive && staticMode ? '#8C00FF' : 'white'}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
