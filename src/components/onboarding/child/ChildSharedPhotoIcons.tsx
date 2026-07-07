'use client';

/** Camera icon — matches mission 3 capture CTA (צילום). */
export function ChildSelfieCaptureCameraIcon({
  stroke = '#303030',
  size = 15.06,
  className = '',
}: {
  stroke?: string;
  size?: number;
  className?: string;
}) {
  const scale = size / 18;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <path
        d="M1.5 7.84234C1.5 6.20352 2.82852 4.875 4.46734 4.875C4.94215 4.875 5.37127 4.59204 5.55831 4.15562L5.7 3.825C6.10949 2.86951 7.04901 2.25 8.08855 2.25H9H9.91145C10.951 2.25 11.8905 2.86951 12.3 3.825L12.4417 4.15562C12.6287 4.59204 13.0579 4.875 13.5327 4.875C15.1715 4.875 16.5 6.20352 16.5 7.84234V10.375C16.5 13.1364 14.2614 15.375 11.5 15.375H6.5C3.73858 15.375 1.5 13.1364 1.5 10.375V7.84234Z"
        stroke={stroke}
        strokeWidth={1.5 * scale}
      />
      <circle
        cx="2.25"
        cy="2.25"
        r="2.25"
        transform="matrix(-1 0 0 1 11.25 7.125)"
        stroke={stroke}
        strokeWidth={1.5 * scale}
      />
    </svg>
  );
}

/** @deprecated Use ChildSelfieCaptureCameraIcon with stroke="white" */
export function ChildSharedPhotoRetakeIcon() {
  return <ChildSelfieCaptureCameraIcon stroke="white" />;
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
