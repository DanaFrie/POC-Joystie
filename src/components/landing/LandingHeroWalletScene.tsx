import dynamic from 'next/dynamic';
import {
  HERO_SCENE_SCALE,
  LandingHeroFloatingCompanions,
} from '@/components/landing/LandingHeroFloatingCompanions';
import { LandingHeroEllipses } from '@/components/landing/LandingHeroEllipses';
import { LandingHeroWalletStatic } from '@/components/landing/LandingHeroWalletStatic';

const HeroWalletCard = dynamic(() => import('@/components/landing/HeroWalletCard'), {
  ssr: false,
  loading: () => <LandingHeroWalletStatic />,
});

export function LandingHeroWalletScene() {
  return (
    <div className="relative flex h-full max-h-full w-full items-center justify-center overflow-visible">
      <LandingHeroEllipses />

      <div className={`relative z-10 shrink-0 ${HERO_SCENE_SCALE}`}>
        <div className="relative w-[320px] pb-[100px]">
          <div className="relative z-10">
            <HeroWalletCard />
          </div>
          <LandingHeroFloatingCompanions />
        </div>
      </div>
    </div>
  );
}
