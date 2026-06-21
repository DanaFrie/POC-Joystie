import type { CSSProperties } from 'react';

/** Figma 13367:4107 — speech bubble tail. */
export function ChildDoriSpeechTail({
  className = '',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width="34"
      height="27"
      viewBox="0 0 34 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      <foreignObject x="-17.3255" y="-22.8186" width="67.854" height="60.7504">
        <div
          style={{
            backdropFilter: 'blur(11.41px)',
            clipPath: 'url(#bgblur_0_13367_4107_clip_path)',
            height: '100%',
            width: '100%',
          }}
        />
      </foreignObject>
      <g filter="url(#filter0_d_13367_4107)" data-figma-bg-blur-radius="22.8186">
        <path
          d="M17.4496 12.6432C17.0579 13.2699 16.1452 13.2699 15.7536 12.6432L9.10156 2L24.1016 2L17.4496 12.6432Z"
          fill="white"
          fillOpacity="0.1"
          shapeRendering="crispEdges"
        />
        <path
          d="M25.9062 1L24.9492 2.53027L18.2979 13.1729C17.5145 14.4262 15.6886 14.4262 14.9053 13.1729L8.25391 2.53027L7.29688 1H25.9062Z"
          stroke="white"
          strokeWidth="2"
          shapeRendering="crispEdges"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_13367_4107"
          x="-17.3255"
          y="-22.8186"
          width="67.854"
          height="60.7504"
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
          <feOffset dy="5.49324" />
          <feGaussianBlur stdDeviation="2.74662" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_13367_4107"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_13367_4107"
            result="shape"
          />
        </filter>
        <clipPath
          id="bgblur_0_13367_4107_clip_path"
          transform="translate(17.3255 22.8186)"
        >
          <path d="M17.4496 12.6432C17.0579 13.2699 16.1452 13.2699 15.7536 12.6432L9.10156 2L24.1016 2L17.4496 12.6432Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
