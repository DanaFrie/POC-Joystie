import { LandingHero } from '@/components/landing/LandingHero';
import { LandingHomeBelowFold } from '@/components/landing/LandingHomeBelowFold';
import { LandingNav } from '@/components/landing/LandingNav';
import { SIGNUP_COMPANION_IMAGES } from '@/constants/onboarding-figma';

export default function Home() {
  return (
    <>
      <link
        rel="preload"
        href={SIGNUP_COMPANION_IMAGES[0]}
        as="image"
        type="image/webp"
      />
      <div
        className="v03-landing-root min-h-screen overflow-x-hidden text-right font-simpler text-v03-text-on-dark"
        dir="rtl"
      >
        <LandingNav />
        <LandingHero />
        <LandingHomeBelowFold />
      </div>
    </>
  );
}
