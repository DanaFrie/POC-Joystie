'use client';

import { useState } from 'react';
import { SignupHeroEllipses } from '@/components/onboarding/signup/SignupHeroEllipses';
import { ONBOARDING_SIGNUP_HERO_IMAGE } from '@/constants/onboarding-figma';
import { FunnelRootPortal } from '@/components/ui/FunnelRootPortal';
import { useFunnelHeroBleed } from '@/components/ui/FunnelViewportContext';
import {
  SIGNUP_HERO_HEIGHT_PX,
  SIGNUP_HERO_IMAGE_HEIGHT_PX,
  SIGNUP_HERO_IMAGE_OFFSET_X_PX,
  SIGNUP_HERO_IMAGE_VIEWPORT_W_PX,
  SIGNUP_HERO_IMAGE_WIDTH_PX,
} from '@/constants/signup-layout';

const HERO_GRADIENT =
  'linear-gradient(180deg, rgba(47, 47, 47, 0) 0%, rgba(47, 47, 47, 0.5) 57.98%)';

/**
 * Figma Frame 1430108703 — mountain (z-1) → ellipses (z-2) → form (z-20+).
 * Portaled to the hero bleed mount (like landing kingdom) — top-anchored background,
 * not in scroll flow.
 */
export function SignupHeroFrame() {
  const bleedStyle = useFunnelHeroBleed(SIGNUP_HERO_HEIGHT_PX);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <FunnelRootPortal rootSelector="[data-v03-funnel-hero]">
      <div
        className="pointer-events-none relative overflow-visible v03-funnel-enter-0"
        style={bleedStyle}
        aria-hidden
      >
        <div
          className="absolute left-0 top-0 overflow-hidden"
          style={{
            width: SIGNUP_HERO_IMAGE_VIEWPORT_W_PX,
            height: SIGNUP_HERO_IMAGE_HEIGHT_PX,
            zIndex: 1,
          }}
        >
          {!imageFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ONBOARDING_SIGNUP_HERO_IMAGE}
              alt=""
              className="absolute top-0 block max-w-none object-cover object-top"
              style={{
                width: SIGNUP_HERO_IMAGE_WIDTH_PX,
                height: SIGNUP_HERO_IMAGE_HEIGHT_PX,
                left: -SIGNUP_HERO_IMAGE_OFFSET_X_PX,
              }}
              draggable={false}
              onError={() => setImageFailed(true)}
            />
          )}
          <div className="absolute inset-0" style={{ background: HERO_GRADIENT }} />
        </div>

        <div
          className="absolute inset-x-0 top-0 overflow-visible"
          style={{ height: SIGNUP_HERO_HEIGHT_PX, zIndex: 2 }}
        >
          <SignupHeroEllipses />
        </div>
      </div>
    </FunnelRootPortal>
  );
}
