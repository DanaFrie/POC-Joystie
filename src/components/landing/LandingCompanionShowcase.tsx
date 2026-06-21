'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SIGNUP_COMPANION_IMAGES } from '@/constants/onboarding-figma';

const ROTATE_MS = 2800;

/**
 * Hero visual — cycles through the four signup companions (no piggy / time-coin).
 */
export function LandingCompanionShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % SIGNUP_COMPANION_IMAGES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto flex h-[260px] w-full max-w-[340px] items-end justify-center sm:h-[300px] md:h-[440px] md:max-w-none lg:h-[520px] xl:h-[560px]">
      <div
        className="pointer-events-none absolute bottom-8 left-1/2 h-[120px] w-[200px] -translate-x-1/2 rounded-[50%] opacity-40 md:bottom-12 md:h-[200px] md:w-[320px] lg:h-[240px] lg:w-[380px]"
        style={{
          background: 'var(--v03-ellipse-385)',
          filter: 'blur(60px)',
        }}
        aria-hidden
      />
      {SIGNUP_COMPANION_IMAGES.map((src, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={src}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 transition-all duration-700 ease-out"
            style={{
              opacity: isActive ? 1 : 0,
              transform: `translateX(-50%) translateY(${isActive ? 0 : 12}px) scale(${isActive ? 1 : 0.92})`,
              zIndex: isActive ? 2 : 1,
            }}
          >
            <Image
              src={src}
              alt=""
              width={400}
              height={400}
              className="h-[200px] w-[200px] object-contain drop-shadow-v03-display sm:h-[220px] sm:w-[220px] md:h-[340px] md:w-[340px] lg:h-[400px] lg:w-[400px] xl:h-[440px] xl:w-[440px]"
              priority={index === 0}
              draggable={false}
            />
          </div>
        );
      })}
      <div className="absolute bottom-0 left-1/2 z-[3] flex -translate-x-1/2 gap-2 md:gap-2.5" aria-hidden>
        {SIGNUP_COMPANION_IMAGES.map((_, index) => (
          <span
            key={index}
            className={`rounded-full transition-all duration-300 md:h-2 ${
              index === activeIndex
                ? 'h-1.5 w-6 bg-v03-accent md:w-8'
                : 'h-1.5 w-1.5 bg-v03-green-200/50 md:h-2 md:w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
