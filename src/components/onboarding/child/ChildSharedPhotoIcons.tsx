'use client';

/** Small white retake camera — review footer secondary. */
export function ChildSharedPhotoRetakeIcon() {
  const size = 15.06;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <rect
        x="1.5"
        y="2.5"
        width="10.5"
        height="8.5"
        rx="1.5"
        stroke="white"
        strokeWidth="1.26"
      />
      <circle cx="11.5" cy="11.5" r="2.2" stroke="white" strokeWidth="1.26" />
    </svg>
  );
}

/** Share icon — three nodes. */
export function ChildSharedPhotoShareIcon() {
  const size = 15.06;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <circle cx="11" cy="3" r="1.8" stroke="#303030" strokeWidth="1.26" />
      <circle cx="3.5" cy="7" r="1.8" stroke="#303030" strokeWidth="1.26" />
      <circle cx="11" cy="11.5" r="1.8" stroke="#303030" strokeWidth="1.26" />
    </svg>
  );
}
