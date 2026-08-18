'use client';

import Link from 'next/link';

type MarketingCtaButtonProps = {
  href: string;
  label: string;
  className?: string;
  size?: 'desktop' | 'mobile' | 'compact';
  iconTone?: 'purple' | 'mint';
  onClick?: () => void;
};

/**
 * White pill CTA — Figma CTA_Special_Button (RTL: label on the right, purple icon on the left).
 * Icon: 32×32, fill Purple-700 #8C00FF, white chevron.
 */
export function MarketingCtaButton({
  href,
  label,
  className = '',
  size = 'desktop',
  iconTone = 'purple',
  onClick,
}: MarketingCtaButtonProps) {
  const iconFill = iconTone === 'mint' ? '#00ffb3' : '#8C00FF';
  const sizeClasses =
    size === 'compact'
      ? /* Figma compact: py 6.98, pe(icon) 6.98, ps(label) 17.45, radius 13.96 */
        'gap-[21.81px] rounded-[13.96px] py-[6.98px] pe-[6.98px] ps-[17.45px]'
      : size === 'mobile'
        ? 'gap-[21.809px] rounded-2xl py-[6.979px] pe-[6.979px] ps-[17.447px]'
      : 'h-[50px] gap-6 rounded-[18px] py-2 pe-2 ps-6';
  const labelClasses =
    size === 'compact'
      ? 'text-[13.96px] leading-[17.87px] tracking-[-0.28px]'
      : size === 'mobile'
        ? 'text-base leading-[1.28] tracking-[-0.32px]'
        : 'text-[18px] leading-[1.2] tracking-[-0.36px]';
  const iconSize =
    size === 'compact'
      ? 'size-[24.43px]'
      : size === 'mobile'
        ? 'size-[24.426px]'
      : 'size-8';
  const iconRadius = size === 'compact' ? 8.72 : 10.2535;

  return (
    <Link
      href={href}
      onClick={onClick}
      dir="rtl"
      className={`inline-flex flex-row items-center bg-white shadow-[2px_2px_20px_rgba(0,0,0,0.05)] transition-[filter,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:brightness-95 hover:-translate-y-0.5 ${sizeClasses} ${className}`}
    >
      <span className={`font-rubik font-bold text-[#05161a] ${labelClasses}`}>{label}</span>
      <span className={`inline-flex shrink-0 ${iconSize}`} aria-hidden>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          className="size-full"
        >
          <rect
            width="32"
            height="32"
            rx={iconRadius}
            transform="matrix(1 1.74846e-07 1.74846e-07 -1 0 32)"
            fill={iconFill}
          />
          <path
            d="M17.7129 21.4087L12.3044 16.0003L17.7129 10.5918"
            stroke="white"
            strokeWidth="1.57747"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
