'use client';

import type { ReactNode } from 'react';
import { JoystieWordmarkLogo } from '@/components/brand/JoystieWordmarkLogo';
import { OnboardingLazyImage } from '@/components/onboarding/OnboardingLazyImage';
import { FunnelStepRoot } from '@/components/ui/funnel-layout';
import { useFunnelBleedBarStyle, useFunnelFullBleed } from '@/components/ui/FunnelViewportContext';
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
  const coverStyle = useFunnelBleedBarStyle(0);
  const fullBleedStyle = useFunnelFullBleed();
  const logo = CHILD_SHARED_PHOTO_REVIEW.logo;

  return (
    <FunnelStepRoot fitViewport className="overflow-hidden bg-v03-green-900">
      <div
        className="pointer-events-none absolute z-0 bg-v03-green-900"
        style={fullBleedStyle}
        aria-hidden
      />
      {!photoSrc ? (
        <OnboardingLazyImage
          src={CHILD_ONBOARDING_ASSETS.castleDoriSelfie}
          alt=""
          className="pointer-events-none absolute z-0 object-cover"
          style={{ ...coverStyle, objectPosition: 'center bottom' }}
          priority
        />
      ) : null}

      {photoSrc ? (
        <OnboardingLazyImage
          src={photoSrc}
          alt=""
          className="pointer-events-none absolute z-[1] object-cover"
          style={{ ...coverStyle, objectPosition: 'center bottom' }}
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

      <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
    </FunnelStepRoot>
  );
}
