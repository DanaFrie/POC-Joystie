import dynamic from 'next/dynamic';
import { LandingHeroFloatingCompanions } from '@/components/landing/LandingHeroFloatingCompanions';
import { LandingHeroEllipses } from '@/components/landing/LandingHeroEllipses';
import { LandingHeroWalletStatic } from '@/components/landing/LandingHeroWalletStatic';

const PHONE_H = 640;
const PHONE_W = 320;

const HeroWalletCard = dynamic(() => import('@/components/landing/HeroWalletCard'), {
  ssr: false,
  loading: () => <LandingHeroWalletStatic />,
});

export function LandingHeroWalletScene() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-visible">
      <LandingHeroEllipses />

      <div className="landing-hero-scene-scale relative z-10 shrink-0">
        <div className="relative" style={{ width: PHONE_W, height: PHONE_H }}>
          <div className="relative z-10 h-full w-full">
            <HeroWalletCard />
          </div>
          <LandingHeroFloatingCompanions />
        </div>
      </div>
    </div>
  );
}
