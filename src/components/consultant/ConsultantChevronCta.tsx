'use client';

import type { ButtonHTMLAttributes } from 'react';

/** Purple square + left chevron from the /consultant offer CTA. */
export function PurpleChevronIcon({ size = 32 }: { size?: number }) {
  const icon = Math.round(size * 0.34);
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-[10px] bg-[#8C00FF]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={icon} height={icon} viewBox="0 0 10 16" fill="none">
        <path
          d="M8 2L2 8L8 14"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function consultantCtaShellClass(size: 'desktop' | 'mobile' | 'responsive' = 'desktop'): string {
  const base =
    'inline-flex items-center bg-white shadow-[2px_2px_20px_rgba(0,0,0,0.05)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60';
  if (size === 'mobile') {
    return `${base} gap-[25px] rounded-[16px] py-2 pl-2 pr-5`;
  }
  if (size === 'responsive') {
    return `${base} gap-[25px] rounded-[16px] py-2 pl-2 pr-5 md:h-[50px] md:rounded-[18px] md:pl-3 md:pr-[25px]`;
  }
  return `${base} h-[50px] gap-[25px] rounded-[18px] py-2 pl-3 pr-[25px]`;
}

export function consultantCtaLabelClass(size: 'desktop' | 'mobile' | 'responsive' = 'desktop'): string {
  const base = 'font-rubik font-bold text-[#05161a]';
  if (size === 'mobile') {
    return `${base} text-[16px] leading-[1.28] tracking-[-0.32px]`;
  }
  if (size === 'responsive') {
    return `${base} text-[16px] leading-[1.28] tracking-[-0.32px] md:text-[18px] md:leading-[1.2] md:tracking-[-0.36px]`;
  }
  return `${base} text-[18px] leading-[1.2] tracking-[-0.36px]`;
}

export function ConsultantChevronButton({
  label,
  size = 'responsive',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  size?: 'desktop' | 'mobile' | 'responsive';
}) {
  return (
    <button
      dir="ltr"
      className={`${consultantCtaShellClass(size)} ${className ?? ''}`}
      {...props}
    >
      {size === 'responsive' ? (
        <>
          <span className="md:hidden">
            <PurpleChevronIcon size={28} />
          </span>
          <span className="hidden md:flex">
            <PurpleChevronIcon size={32} />
          </span>
        </>
      ) : (
        <PurpleChevronIcon size={size === 'mobile' ? 28 : 32} />
      )}
      <span className={consultantCtaLabelClass(size)}>
        <span dir="rtl">{label}</span>
      </span>
    </button>
  );
}
