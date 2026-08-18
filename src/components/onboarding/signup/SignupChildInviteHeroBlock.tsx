'use client';

import { useState } from 'react';
import {
  SIGNUP_CHILD_INVITE_HERO_FADE_GRADIENT,
  SIGNUP_CHILD_INVITE_HERO_FADE_H_PX,
  SIGNUP_CHILD_INVITE_HERO_FADE_LEFT_PX,
  SIGNUP_CHILD_INVITE_HERO_FADE_RIGHT_LEFT_PX,
  SIGNUP_CHILD_INVITE_HERO_FADE_TOP_PX,
  SIGNUP_CHILD_INVITE_HERO_FADE_W_PX,
  SIGNUP_CHILD_INVITE_HERO_PX,
} from '@/constants/signup-child-invite-layout';
import { SIGNUP_CHILD_INVITE_HERO_IMAGE } from '@/constants/onboarding-figma';

type SignupChildInviteHeroBlockProps = {
  childName: string;
  /** Scales hero art on short viewports (default 200 @ 812). */
  heroSizePx?: number;
};

/** Shared hero + headline — Figma 12914 / image 291 (200×200 + side fades). */
export function SignupChildInviteHeroBlock({
  childName,
  heroSizePx = SIGNUP_CHILD_INVITE_HERO_PX,
}: SignupChildInviteHeroBlockProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const heroScale = heroSizePx / SIGNUP_CHILD_INVITE_HERO_PX;

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="v03-funnel-enter-0 relative mx-auto shrink-0"
        style={{
          width: heroSizePx,
          height: heroSizePx,
        }}
      >
        {!imageFailed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={SIGNUP_CHILD_INVITE_HERO_IMAGE}
            alt=""
            className="pointer-events-none absolute left-0 top-0 object-contain"
            style={{ width: heroSizePx, height: heroSizePx }}
            onError={() => setImageFailed(true)}
          />
        )}
        <div
          className="pointer-events-none absolute"
          style={{
            width: SIGNUP_CHILD_INVITE_HERO_FADE_W_PX * heroScale,
            height: SIGNUP_CHILD_INVITE_HERO_FADE_H_PX * heroScale,
            left: SIGNUP_CHILD_INVITE_HERO_FADE_RIGHT_LEFT_PX * heroScale,
            top: SIGNUP_CHILD_INVITE_HERO_FADE_TOP_PX * heroScale,
            background: SIGNUP_CHILD_INVITE_HERO_FADE_GRADIENT,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute"
          style={{
            width: SIGNUP_CHILD_INVITE_HERO_FADE_W_PX * heroScale,
            height: SIGNUP_CHILD_INVITE_HERO_FADE_H_PX * heroScale,
            left: SIGNUP_CHILD_INVITE_HERO_FADE_LEFT_PX * heroScale,
            top: heroSizePx,
            transform: 'rotate(180deg)',
            transformOrigin: 'top left',
            background: SIGNUP_CHILD_INVITE_HERO_FADE_GRADIENT,
          }}
          aria-hidden
        />
      </div>

      <h1
        className="v03-funnel-enter-1 w-full text-center font-simpler font-black leading-[1.1] tracking-[-0.8px] text-white"
        style={{ fontSize: Math.max(32, Math.round(40 * heroScale)) }}
      >
        שנכניס את {childName} לתמונה?
      </h1>
    </div>
  );
}
