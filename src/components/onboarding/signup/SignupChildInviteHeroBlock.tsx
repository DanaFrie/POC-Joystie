'use client';

import { useState } from 'react';
import {
  SIGNUP_CHILD_INVITE_HERO_BLOCK_W_PX,
  SIGNUP_CHILD_INVITE_HERO_FADE_H_PX,
  SIGNUP_CHILD_INVITE_HERO_FADE_TOP_PX,
  SIGNUP_CHILD_INVITE_HERO_FADE_W_PX,
  SIGNUP_CHILD_INVITE_HERO_PX,
} from '@/constants/signup-child-invite-layout';
import { SIGNUP_CHILD_INVITE_HERO_IMAGE } from '@/constants/onboarding-figma';

const HERO_FADE_GRADIENT =
  'linear-gradient(95.81deg, rgba(9, 33, 37, 0) 20.98%, rgb(9, 33, 37) 86.28%)';

/** Shared hero + headline — Figma image 291 / «שנכניס את {child} לתמונה?». */
export function SignupChildInviteHeroBlock({ childName }: { childName: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className="flex w-full flex-col items-center"
      style={{ maxWidth: SIGNUP_CHILD_INVITE_HERO_BLOCK_W_PX }}
    >
      <div
        className="v03-funnel-enter-0 relative shrink-0 overflow-hidden"
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
            className="pointer-events-none size-full object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
        <div
          className="pointer-events-none absolute left-0"
          style={{
            top: SIGNUP_CHILD_INVITE_HERO_FADE_TOP_PX,
            width: SIGNUP_CHILD_INVITE_HERO_FADE_W_PX,
            height: SIGNUP_CHILD_INVITE_HERO_FADE_H_PX,
            backgroundImage: HERO_FADE_GRADIENT,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute"
          style={{
            left: SIGNUP_CHILD_INVITE_HERO_PX - SIGNUP_CHILD_INVITE_HERO_FADE_W_PX,
            top: SIGNUP_CHILD_INVITE_HERO_FADE_TOP_PX,
            width: SIGNUP_CHILD_INVITE_HERO_FADE_W_PX,
            height: SIGNUP_CHILD_INVITE_HERO_FADE_H_PX,
            backgroundImage: HERO_FADE_GRADIENT,
            transform: 'scaleY(-1) rotate(180deg)',
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
