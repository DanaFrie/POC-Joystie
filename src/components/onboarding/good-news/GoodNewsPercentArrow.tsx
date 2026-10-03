/** Figma — dashed purple down-arrow beside 55% (27×27). */
export function GoodNewsPercentArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={27}
      height={27}
      viewBox="0 0 27 27"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M13.5 5.62524V6.18774M13.5 9.56274V11.2502M13.5 14.6252V21.3752"
        stroke="#8C00FF"
        strokeWidth={1.6875}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.25 14.6248L13.5 21.3748"
        stroke="#8C00FF"
        strokeWidth={1.6875}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 14.6248L13.5 21.3748"
        stroke="#8C00FF"
        strokeWidth={1.6875}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma — Purple-100 hairline flanking the 55% cluster (`flex: 1 0 0`). */
export function GoodNewsPercentSideLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex h-0 min-w-0 flex-1 basis-0 items-center self-center ${className}`}
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="59"
        height="1"
        viewBox="0 0 59 1"
        fill="none"
        className="h-px w-full"
        preserveAspectRatio="none"
      >
        <path d="M0 0.5H59" stroke="#E7E1EC" strokeWidth={1} />
      </svg>
    </div>
  );
}
