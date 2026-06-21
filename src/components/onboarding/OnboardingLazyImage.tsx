'use client';

import type { ImgHTMLAttributes } from 'react';

type OnboardingLazyImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** When true, browser may fetch immediately (hero in view). */
  priority?: boolean;
};

/**
 * Onboarding raster — lazy by default to avoid loading multi-MB PNGs upfront.
 */
export function OnboardingLazyImage({
  priority = false,
  loading,
  decoding = 'async',
  fetchPriority,
  ...props
}: OnboardingLazyImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      loading={loading ?? (priority ? 'eager' : 'lazy')}
      decoding={decoding}
      fetchPriority={fetchPriority ?? (priority ? 'high' : 'low')}
    />
  );
}
