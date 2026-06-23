'use client';

import { useState, type CSSProperties } from 'react';
import { ONBOARDING_SIGNUP_HERO_IMAGE } from '@/constants/onboarding-figma';
import { FunnelRootPortal } from '@/components/ui/FunnelRootPortal';
import {
  useFunnelHeroBleedInsets,
  useFunnelViewportMetrics,
} from '@/components/ui/FunnelViewportContext';
import { V03_SCREEN_WIDTH } from '@/constants/v03-screen';
import {
  SIGNUP_ELLIPSE_391_HEIGHT_PX,
  SIGNUP_ELLIPSE_391_TOP_PX,
  SIGNUP_ELLIPSE_391_WIDTH_PX,
  SIGNUP_HERO_FRAME_TOP_PX,
  SIGNUP_HERO_HEIGHT_PX,
  SIGNUP_HERO_IMAGE_HEIGHT_PX,
} from '@/constants/signup-layout';

const HERO_GRADIENT =
  'linear-gradient(180deg, rgba(47, 47, 47, 0) 0%, rgba(47, 47, 47, 0.5) 57.98%)';

const ELLIPSE_BLUR_LG = 'blur(49.561641693115234px)';
const ELLIPSE_BLUR_SM = 'blur(20.461671829223633px)';
const ELLIPSE_LG_W_PX = 351.215;
const ELLIPSE_LG_H_PX = 268;

const ellipse391Style: CSSProperties = {
  top: SIGNUP_ELLIPSE_391_TOP_PX,
  left: (V03_SCREEN_WIDTH - SIGNUP_ELLIPSE_391_WIDTH_PX) / 2,
  width: SIGNUP_ELLIPSE_391_WIDTH_PX,
  height: SIGNUP_ELLIPSE_391_HEIGHT_PX,
  borderRadius: '50%',
  background: 'rgba(6, 43, 33, 0.15)',
  filter: ELLIPSE_BLUR_SM,
};

const ellipse388Style: CSSProperties = {
  top: 188,
  left: 120.6738,
  width: ELLIPSE_LG_W_PX,
  height: ELLIPSE_LG_H_PX,
  borderRadius: ELLIPSE_LG_W_PX,
  background: '#062B21',
  filter: ELLIPSE_BLUR_LG,
};

const ellipse389Style: CSSProperties = {
  top: 188,
  left: 210.0068,
  width: ELLIPSE_LG_W_PX,
  height: ELLIPSE_LG_H_PX,
  borderRadius: ELLIPSE_LG_W_PX,
  background: '#092523',
  filter: ELLIPSE_BLUR_LG,
};

const ellipse390Style: CSSProperties = {
  top: 188,
  left: -152.2217,
  width: ELLIPSE_LG_W_PX,
  height: ELLIPSE_LG_H_PX,
  borderRadius: ELLIPSE_LG_W_PX,
  background: '#092523',
  filter: ELLIPSE_BLUR_LG,
};

type SignupHeroFrameProps = {
  /** Canvas-space scroll offset from the signup scroll container. */
  scrollTop?: number;
};

/**
 * Figma Frame 1430108703 — z-order: mountain (1) → ellipses (2) → form (in flow).
 * Portaled below funnel content (wrapper z-10).
 */
export function SignupHeroFrame({ scrollTop = 0 }: SignupHeroFrameProps) {
  const { scale, offsetX, offsetY, viewportWidth, designWidth } =
    useFunnelViewportMetrics();
  const { bleedY } = useFunnelHeroBleedInsets();
  const [imageFailed, setImageFailed] = useState(false);

  const frameTopCanvas = SIGNUP_HERO_FRAME_TOP_PX - bleedY;
  const heroTopPx = offsetY + (frameTopCanvas - scrollTop) * scale;
  const heroHeightPx = (SIGNUP_HERO_IMAGE_HEIGHT_PX + bleedY) * scale;
  const ellipseTopPx = offsetY + (SIGNUP_HERO_FRAME_TOP_PX - scrollTop) * scale;
  const ellipseWidthPx = designWidth * scale;
  const ellipseHeightPx = SIGNUP_HERO_HEIGHT_PX * scale;
  const ellipse391CanvasStyle: CSSProperties = {
    ...ellipse391Style,
    left: (designWidth - SIGNUP_ELLIPSE_391_WIDTH_PX) / 2,
  };

  return (
    <>
      <FunnelRootPortal>
        <div
          className="pointer-events-none overflow-hidden"
          style={{
            position: 'fixed',
            left: 0,
            top: heroTopPx,
            width: viewportWidth,
            height: heroHeightPx,
            zIndex: 1,
          }}
          aria-hidden
        >
          {!imageFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ONBOARDING_SIGNUP_HERO_IMAGE}
              alt=""
              className="absolute left-1/2 top-0 min-h-full min-w-[115%] -translate-x-1/2 object-cover object-top"
              draggable={false}
              onError={() => setImageFailed(true)}
            />
          )}
          <div className="absolute inset-0" style={{ background: HERO_GRADIENT }} />
        </div>

        <div
          className="pointer-events-none overflow-visible"
          style={{
            position: 'fixed',
            left: offsetX,
            top: ellipseTopPx,
            width: ellipseWidthPx,
            height: ellipseHeightPx,
            zIndex: 2,
            transformOrigin: 'top left',
          }}
          aria-hidden
        >
          <div
            className="absolute inset-0 overflow-visible"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: designWidth,
              height: SIGNUP_HERO_HEIGHT_PX,
            }}
          >
            <div className="absolute" style={ellipse391CanvasStyle} />
            <div className="absolute" style={ellipse388Style} />
            <div className="absolute" style={ellipse389Style} />
            <div className="absolute" style={ellipse390Style} />
          </div>
        </div>
      </FunnelRootPortal>

      <div
        className="pointer-events-none shrink-0 v03-funnel-enter-0"
        style={{
          height: SIGNUP_HERO_HEIGHT_PX + bleedY,
          marginTop: SIGNUP_HERO_FRAME_TOP_PX - bleedY,
        }}
        aria-hidden
      />
    </>
  );
}
