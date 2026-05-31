'use client';

import { useState, type CSSProperties } from 'react';
import { ONBOARDING_SIGNUP_HERO_IMAGE } from '@/constants/onboarding-figma';
import {
  SIGNUP_ELLIPSE_391_HEIGHT_PX,
  SIGNUP_ELLIPSE_391_TOP_PX,
  SIGNUP_HERO_HEIGHT_PX,
} from '@/constants/signup-layout';

const HERO_GRADIENT =
  'linear-gradient(180deg, rgba(47, 47, 47, 0) 0%, rgba(47, 47, 47, 0.5) 80%)';

const ellipseBlurLg = 'blur(49.561641693115234px)';
const ellipseBlurSm = 'blur(20.461671829223633px)';

/** Figma ellipse 391 — 145×89.93, rgba(6,43,33,0.15) */
const ellipse391Style: CSSProperties = {
  top: SIGNUP_ELLIPSE_391_TOP_PX,
  left: -56,
  right: -56,
  height: SIGNUP_ELLIPSE_391_HEIGHT_PX,
  borderRadius: '50%',
  background: 'rgba(6, 43, 33, 0.15)',
  filter: ellipseBlurSm,
};

const ellipse389Style: CSSProperties = {
  top: 188,
  bottom: -90,
  right: -74,
  left: 210,
  borderRadius: 351.215,
  background: '#092523',
  filter: ellipseBlurLg,
};

const ellipse390Style: CSSProperties = {
  top: 188,
  bottom: -90,
  right: 288,
  left: -152,
  borderRadius: 351.215,
  background: '#092523',
  filter: ellipseBlurLg,
};

/** Figma Frame 1430108703 — 375×533; art 487×366 + gradient + ellipses 391/389/390. */
export function SignupHeroFrame() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className="relative w-full shrink-0 overflow-hidden"
      style={{ height: SIGNUP_HERO_HEIGHT_PX }}
      aria-hidden
    >
      {!imageFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ONBOARDING_SIGNUP_HERO_IMAGE}
          alt=""
          className="pointer-events-none absolute left-1/2 top-0 max-w-none -translate-x-1/2"
          width={487}
          height={366}
          style={{ width: 487, height: 366 }}
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="absolute inset-0" style={{ background: HERO_GRADIENT }} />
      <div
        className="pointer-events-none absolute"
        style={ellipse391Style}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute"
        style={ellipse389Style}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute"
        style={ellipse390Style}
        aria-hidden
      />
    </div>
  );
}
