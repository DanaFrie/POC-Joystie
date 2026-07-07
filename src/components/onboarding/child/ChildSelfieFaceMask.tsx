'use client';

import { useId } from 'react';
import { useFunnelBleedBarStyle } from '@/components/ui/FunnelViewportContext';
import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';

export type SelfieFaceHole = {
  cx: number;
  cy: number;
  r: number;
};

type ChildSelfieFaceMaskProps = {
  childHole: SelfieFaceHole;
  parentHole: SelfieFaceHole;
  blur: number;
  overlay?: string;
  ringStroke?: number;
  ringOpacity?: number;
  /** When false, only face rings — no frosted scrim (live camera uses opaque castle frame). */
  showFrost?: boolean;
  /** When false, hide white hole rings (blurred placeholder ellipses replace them). */
  showRings?: boolean;
};

/** Full-bleed frosted mask with two circular face holes + include rings. */
export function ChildSelfieFaceMask({
  childHole,
  parentHole,
  blur,
  overlay = 'rgba(9, 33, 37, 0.42)',
  ringStroke = 2,
  ringOpacity = 0.65,
  showFrost = true,
  showRings = true,
}: ChildSelfieFaceMaskProps) {
  const coverStyle = useFunnelBleedBarStyle(0);
  const uid = useId().replace(/:/g, '');
  const maskId = `child-selfie-mask-${uid}`;

  const holes = [childHole, parentHole];

  return (
    <div
      className="pointer-events-none absolute z-10 overflow-hidden"
      style={coverStyle}
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${V03_SCREEN_WIDTH} ${V03_SCREEN_HEIGHT}`}
        fill="none"
        className="absolute inset-0 size-full"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect width={V03_SCREEN_WIDTH} height={V03_SCREEN_HEIGHT} fill="white" />
            {holes.map((hole) => (
              <circle key={`${hole.cx}-${hole.cy}`} cx={hole.cx} cy={hole.cy} r={hole.r} fill="black" />
            ))}
          </mask>
        </defs>

        {showFrost ? (
          <foreignObject
            x="0"
            y="0"
            width={V03_SCREEN_WIDTH}
            height={V03_SCREEN_HEIGHT}
            mask={`url(#${maskId})`}
          >
            <div
              style={{
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                background: overlay,
                height: '100%',
                width: '100%',
              }}
            />
          </foreignObject>
        ) : null}

        {showRings
          ? holes.map((hole) => (
              <circle
                key={`ring-${hole.cx}-${hole.cy}`}
                cx={hole.cx}
                cy={hole.cy}
                r={hole.r}
                stroke="white"
                strokeOpacity={ringOpacity}
                strokeWidth={ringStroke}
                fill="none"
              />
            ))
          : null}
      </svg>
    </div>
  );
}
