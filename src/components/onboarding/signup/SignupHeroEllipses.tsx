import type { CSSProperties } from 'react';
import { V03_SCREEN_WIDTH } from '@/constants/v03-screen';
import {
  SIGNUP_ELLIPSE_391_HEIGHT_PX,
  SIGNUP_ELLIPSE_391_TOP_PX,
  SIGNUP_ELLIPSE_391_WIDTH_PX,
} from '@/constants/signup-layout';

const ELLIPSE_BLUR_LG = 'blur(49.561641693115234px)';
const ELLIPSE_BLUR_SM = 'blur(20.461671829223633px)';
const ELLIPSE_LG_W_PX = 351.215;
const ELLIPSE_LG_H_PX = 268;

/** Shared hero glow ellipses — signup, login, subscription (Figma Frame 1430108703). */
export const signupHeroEllipse391Style: CSSProperties = {
  top: SIGNUP_ELLIPSE_391_TOP_PX,
  left: (V03_SCREEN_WIDTH - SIGNUP_ELLIPSE_391_WIDTH_PX) / 2,
  width: SIGNUP_ELLIPSE_391_WIDTH_PX,
  height: SIGNUP_ELLIPSE_391_HEIGHT_PX,
  borderRadius: '50%',
  background: 'rgba(6, 43, 33, 0.15)',
  filter: ELLIPSE_BLUR_SM,
};

export const signupHeroEllipse388Style: CSSProperties = {
  top: 188,
  left: 120.6738,
  width: ELLIPSE_LG_W_PX,
  height: ELLIPSE_LG_H_PX,
  borderRadius: ELLIPSE_LG_W_PX,
  background: '#062B21',
  filter: ELLIPSE_BLUR_LG,
};

export const signupHeroEllipse389Style: CSSProperties = {
  top: 188,
  left: 210.0068,
  width: ELLIPSE_LG_W_PX,
  height: ELLIPSE_LG_H_PX,
  borderRadius: ELLIPSE_LG_W_PX,
  background: '#092523',
  filter: ELLIPSE_BLUR_LG,
};

export const signupHeroEllipse390Style: CSSProperties = {
  top: 188,
  left: -152.2217,
  width: ELLIPSE_LG_W_PX,
  height: ELLIPSE_LG_H_PX,
  borderRadius: ELLIPSE_LG_W_PX,
  background: '#092523',
  filter: ELLIPSE_BLUR_LG,
};

/** Ellipse stack between mountain art and gradient — same coords as signup/login. */
export function SignupHeroEllipses({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-visible ${className}`}
      aria-hidden
    >
      <div className="absolute" style={signupHeroEllipse391Style} />
      <div className="absolute" style={signupHeroEllipse388Style} />
      <div className="absolute" style={signupHeroEllipse389Style} />
      <div className="absolute" style={signupHeroEllipse390Style} />
    </div>
  );
}
