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

/** Share icon — three connected nodes (Figma share CTA). */
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
      style={{ width: size, height: size, flexShrink: 0 }}
      aria-hidden
    >
      <circle cx="10.9809" cy="2.82365" r="1.56876" stroke="#303030" strokeWidth="1.25501" />
      <circle cx="3.45157" cy="7.21622" r="1.56876" stroke="#303030" strokeWidth="1.25501" />
      <path
        d="M9.41222 3.76503L5.01968 6.27505"
        stroke="#303030"
        strokeWidth="1.25501"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.70567 8.4713L9.41196 11.2951"
        stroke="#303030"
        strokeWidth="1.25501"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10.9809" cy="12.2362" r="1.56876" stroke="#303030" strokeWidth="1.25501" />
    </svg>
  );
}
