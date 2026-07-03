'use client';

/** Share headline turquoise scribble — Figma 13702 share frame. */
export function ChildSharedPhotoShareUnderline({
  top,
  left,
  width,
  height,
}: {
  top: number;
  left: number;
  width: number;
  height: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 257 27"
      fill="none"
      className="pointer-events-none absolute"
      style={{ top, left }}
      aria-hidden
    >
      <path
        d="M20.9438 26.6594C21.0992 26.6222 21.738 26.603 22.0111 26.5649C47.4557 8.17493 59.0279 7.21275 81.3582 5.35433 110.117 2.59258 148.334 0.904541 192.975 1.81769 235.7 8.81255 252.678 14.6607 256.38 14.6804C256.672 14.8579 255.802 16.8317 254.376 16.6456 252.242 24.2173 248.035 13.3225 240.615 11.0688 228.387 7.26952 205.499 16.859 178.664 0.796046 136.236 1.5548 81.293 15.1768 47.6338 23.8159L20.9438 26.6594Z"
        fill="#00FFB3"
      />
    </svg>
  );
}
