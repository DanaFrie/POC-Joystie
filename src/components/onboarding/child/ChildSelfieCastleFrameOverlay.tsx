'use client';

import { useId } from 'react';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';
import { V03_SCREEN_HEIGHT, V03_SCREEN_WIDTH } from '@/constants/v03-screen';
import type { SelfieFaceHole } from '@/components/onboarding/child/ChildSelfieFaceMask';

type ChildSelfieCastleFrameOverlayProps = {
  src: string;
  childHole: SelfieFaceHole;
  parentHole: SelfieFaceHole;
};

/** Castle illustration with circular face cutouts — reveals live camera beneath. */
export function ChildSelfieCastleFrameOverlay({
  src,
  childHole,
  parentHole,
}: ChildSelfieCastleFrameOverlayProps) {
  const bleedStyle = useFunnelFullBleed();
  const uid = useId().replace(/:/g, '');
  const maskId = `child-selfie-castle-frame-${uid}`;

  return (
    <div
      className="pointer-events-none absolute z-[5]"
      style={bleedStyle}
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={V03_SCREEN_WIDTH}
        height={V03_SCREEN_HEIGHT}
        viewBox={`0 0 ${V03_SCREEN_WIDTH} ${V03_SCREEN_HEIGHT}`}
        fill="none"
        className="size-full"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect width={V03_SCREEN_WIDTH} height={V03_SCREEN_HEIGHT} fill="white" />
            <circle cx={childHole.cx} cy={childHole.cy} r={childHole.r} fill="black" />
            <circle cx={parentHole.cx} cy={parentHole.cy} r={parentHole.r} fill="black" />
          </mask>
        </defs>
        <image
          href={src}
          width={V03_SCREEN_WIDTH}
          height={V03_SCREEN_HEIGHT}
          preserveAspectRatio="xMidYMid slice"
          mask={`url(#${maskId})`}
        />
      </svg>
    </div>
  );
}
