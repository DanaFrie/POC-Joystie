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

/** Shared hero + headline — Figma 12914 / image 291 (200×200 + side fades). */
export function SignupChildInviteHeroBlock({ childName }: { childName: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="v03-funnel-enter-0 relative mx-auto shrink-0"
        style={{
          width: SIGNUP_CHILD_INVITE_HERO_PX,
          height: SIGNUP_CHILD_INVITE_HERO_PX,
        }}
      >
        {!imageFailed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={SIGNUP_CHILD_INVITE_HERO_IMAGE}
            alt=""
            className="pointer-events-none absolute left-0 top-0 size-[200px] object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
        {/* Right fade — Figma left: 169, top: 66 */}
        <div
          className="pointer-events-none absolute"
          style={{
            width: SIGNUP_CHILD_INVITE_HERO_FADE_W_PX,
            height: SIGNUP_CHILD_INVITE_HERO_FADE_H_PX,
            left: SIGNUP_CHILD_INVITE_HERO_FADE_RIGHT_LEFT_PX,
            top: SIGNUP_CHILD_INVITE_HERO_FADE_TOP_PX,
            background: SIGNUP_CHILD_INVITE_HERO_FADE_GRADIENT,
          }}
          aria-hidden
        />
        {/* Left fade — Figma left: 31, top: 200, rotate 180° */}
        <div
          className="pointer-events-none absolute"
          style={{
            width: SIGNUP_CHILD_INVITE_HERO_FADE_W_PX,
            height: SIGNUP_CHILD_INVITE_HERO_FADE_H_PX,
            left: SIGNUP_CHILD_INVITE_HERO_FADE_LEFT_PX,
            top: SIGNUP_CHILD_INVITE_HERO_PX,
            transform: 'rotate(180deg)',
            transformOrigin: 'top left',
            background: SIGNUP_CHILD_INVITE_HERO_FADE_GRADIENT,
          }}
          aria-hidden
        />
      </div>

      <h1 className="v03-funnel-enter-1 w-full text-center font-simpler text-[40px] font-black leading-[1.1] tracking-[-0.8px] text-white">
        שנכניס את {childName} לתמונה?
      </h1>
    </div>
  );
}
