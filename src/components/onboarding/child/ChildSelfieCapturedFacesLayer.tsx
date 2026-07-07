'use client';

import type { SelfieFaceHole } from '@/components/onboarding/child/ChildSelfieFaceMask';
import {
  CHILD_SELFIE_ARTBOARD,
  holeFaceClipStyle,
} from '@/components/onboarding/child/childSelfieArtboard';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';

type ChildSelfieHoleFaceProps = {
  src: string;
  hole: SelfieFaceHole;
};

function HoleFaceImage({ src, hole }: ChildSelfieHoleFaceProps) {
  return (
    <div style={holeFaceClipStyle(hole)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-full object-cover" />
    </div>
  );
}

type ChildSelfieCapturedFacesLayerProps = {
  childSrc: string;
  parentSrc: string;
  childHole: SelfieFaceHole;
  parentHole: SelfieFaceHole;
  fading?: boolean;
  fadeMs?: number;
};

/** Still preview — parent hole (screen left), child hole (screen right). */
export function ChildSelfieCapturedFacesLayer({
  childSrc,
  parentSrc,
  childHole,
  parentHole,
  fading = false,
  fadeMs = 400,
}: ChildSelfieCapturedFacesLayerProps) {
  const bleedStyle = useFunnelFullBleed();

  return (
    <div
      className="pointer-events-none absolute z-[4]"
      style={{
        ...bleedStyle,
        opacity: fading ? 0 : 1,
        transition: `opacity ${fadeMs}ms ease-out`,
      }}
      aria-hidden
    >
      <div
        className="relative"
        style={{
          width: CHILD_SELFIE_ARTBOARD.width,
          height: CHILD_SELFIE_ARTBOARD.height,
        }}
      >
        <HoleFaceImage src={parentSrc} hole={parentHole} />
        <HoleFaceImage src={childSrc} hole={childHole} />
      </div>
    </div>
  );
}
