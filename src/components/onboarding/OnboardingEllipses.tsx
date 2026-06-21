/**
 * Transition ellipses 387 + 388 — Figma Dev Mode CSS.
 * Mint glow (385) — OnboardingMintGlow.
 */

function BlurEllipse({
  className,
  fill,
  blurPx,
}: {
  className: string;
  fill: string;
  blurPx: number;
}) {
  return (
    <div className={`overflow-visible ${className}`} aria-hidden>
      <div
        className="h-full w-full rounded-full"
        style={{ background: fill, filter: `blur(${blurPx}px)` }}
      />
    </div>
  );
}

export function OnboardingEllipses() {
  return (
    <>
      <BlurEllipse
        className="pointer-events-none absolute left-[140px] top-[267px] z-[3] h-[248px] w-[265px]"
        fill="#092125"
        blurPx={45}
      />
      <BlurEllipse
        className="pointer-events-none absolute left-[-24px] top-[284px] z-[3] h-[236px] w-[253px]"
        fill="#092125"
        blurPx={45}
      />
    </>
  );
}
