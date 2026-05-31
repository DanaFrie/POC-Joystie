/** Figma — purple down arrow beside 55% (37×37). */
import type { CSSProperties } from 'react';

export function GoodNewsPercentArrow({
  className = '',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={37}
      height={37}
      viewBox="0 0 37 37"
      fill="none"
      className={className}
      style={style}
      aria-hidden
    >
      <path
        d="M27.6028 21.0611C27.6028 21.0611 20.6308 29.2164 18.5006 29.2164C16.3704 29.2164 9.3985 21.0611 9.3985 21.0611M18.5006 28.3108L18.5006 6.50831"
        stroke="var(--v03-accent-purple)"
        strokeWidth={2.3125}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
