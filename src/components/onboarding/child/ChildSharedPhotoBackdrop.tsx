'use client';

import type { ReactNode } from 'react';
import { JoystieWordmarkLogo } from '@/components/brand/JoystieWordmarkLogo';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';
import { CHILD_ONBOARDING_ASSETS } from '@/constants/child-onboarding-assets';
import { CHILD_SHARED_PHOTO_REVIEW } from '@/constants/child-post-game-layout';

type ChildSharedPhotoBackdropProps = {
  /** Generated selfie URL — replaces placeholder when wired. */
  photoSrc?: string | null;
  children?: ReactNode;
};

/** Castle selfie bg + corner logo; optional generated photo overlay. */
export function ChildSharedPhotoBackdrop({
  photoSrc = null,
  children,
}: ChildSharedPhotoBackdropProps) {
  const bleedStyle = useFunnelFullBleed();
  const logo = CHILD_SHARED_PHOTO_REVIEW.logo;

  return (
    <div dir="rtl" className="relative h-full w-full overflow-hidden">
      <OnboardingLazyImage
        src={CHILD_ONBOARDING_ASSETS.castleDoriSelfie}
        alt=""
        className="pointer-events-none absolute z-0 object-cover object-center"
        style={bleedStyle}
        priority
      />

      {photoSrc ? (
        <OnboardingLazyImage
          src={photoSrc}
          alt=""
          className="pointer-events-none absolute inset-0 z-[1] object-cover object-center"
          priority
        />
      ) : (
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-black/10"
          aria-hidden
          data-photo-placeholder
        />
      )}

      <div
        className="pointer-events-none absolute z-[2]"
        style={{ left: logo.left, top: logo.top, width: logo.width }}
        aria-hidden
      >
        <JoystieWordmarkLogo className="h-auto w-full" />
      </div>

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
