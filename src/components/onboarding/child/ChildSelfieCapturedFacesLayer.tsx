'use client';

import type { SelfieFaceHole } from '@/components/onboarding/child/ChildSelfieFaceMask';
import { holeFaceClipStyle } from '@/components/onboarding/child/childSelfieArtboard';
import { useSelfieCoverLayout } from '@/components/onboarding/child/useSelfieCoverLayout';

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
  const { coverStyle, artboardStyle } = useSelfieCoverLayout();

  return (
    <div
      className="pointer-events-none absolute z-[4]"
      style={{
        ...coverStyle,
        opacity: fading ? 0 : 1,
        transition: `opacity ${fadeMs}ms ease-out`,
      }}
      aria-hidden
    >
      <div className="relative" style={artboardStyle}>
        <HoleFaceImage src={parentSrc} hole={parentHole} />
        <HoleFaceImage src={childSrc} hole={childHole} />
      </div>
    </div>
  );
}
