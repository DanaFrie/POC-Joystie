'use client';

type BallGameWinFadeOverlayProps = {
  /** 0 = transparent, 1 = fully faded */
  opacity: number;
};

/** Full-screen fade over the court while the celebration ball keeps moving. */
export function BallGameWinFadeOverlay({ opacity }: BallGameWinFadeOverlayProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[40] bg-[#092125] transition-opacity duration-1000 ease-out"
      style={{ opacity }}
      aria-hidden
    />
  );
}
