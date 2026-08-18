'use client';

import { useState } from 'react';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';

type ParentRoleCardProps = {
  label: string;
  imageSrc: string;
  imageAlt: string;
  selected: boolean;
  onSelect: () => void;
};

/** Role picker card — Figma 327×135; Selected state with inner mint glow. */
export function ParentRoleCard({
  label,
  imageSrc,
  imageAlt,
  selected,
  onSelect,
}: ParentRoleCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      type="button"
      dir="rtl"
      onClick={onSelect}
      className={`relative flex h-[135px] w-full items-center justify-between overflow-hidden rounded-[24px] bg-white/5 py-[14px] pe-[10px] ps-[40px] transition ${
        selected
          ? 'shadow-[2px_2px_20px_rgba(255,255,255,0.4)] outline outline-[0.7px] outline-offset-[-0.7px] outline-white'
          : 'outline outline-[1.5px] outline-offset-[-1.5px] outline-white/25 hover:outline-white/40'
      }`}
    >
      {selected && (
        <div
          className="pointer-events-none absolute left-[28px] top-[82px] h-[111.5px] w-[111.5px] rounded-full"
          style={{
            background: 'rgba(0, 255, 179, 0.90)',
            filter: 'blur(61.49px)',
          }}
          aria-hidden
        />
      )}

      <div className="relative z-[1] flex min-w-[93px] shrink-0 flex-col items-center justify-center self-stretch">
        <span
          className={`whitespace-nowrap text-center font-simpler text-[24px] leading-[30px] ${
            selected ? 'font-bold text-white' : 'font-normal text-v03-green-400'
          }`}
        >
          {label}
        </span>
      </div>

      <div className="relative z-[1] flex items-center justify-start pt-[29px] opacity-90">
        <div className="relative h-[147px] w-[147px] shrink-0">
          {!imageFailed ? (
            <OnboardingLazyImage
              src={imageSrc}
              alt={imageAlt}
              width={147}
              height={147}
              className="h-[147px] w-[147px] object-contain object-bottom"
              priority={selected}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div
              className="h-[147px] w-[147px] rounded-full bg-gradient-to-b from-white/15 to-transparent"
              aria-hidden
            />
          )}
        </div>
      </div>
    </button>
  );
}
